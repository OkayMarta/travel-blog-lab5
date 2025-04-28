require('dotenv').config(); // Завантажує змінні з .env файлу
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const path = require('path'); // Модуль для роботи зі шляхами

// --- Ініціалізація Firebase Admin SDK ---
// Шлях до файлу ключа сервісного аккаунту береться зі змінної середовища або використовується стандартний шлях
const serviceAccountPath = process.env.SERVICE_ACCOUNT_KEY_PATH || './serviceAccountKey.json';
try {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log("Firebase Admin SDK ініціалізовано успішно.");
} catch (error) {
    console.error("Помилка ініціалізації Firebase Admin SDK:", error);
    console.error("Переконайтесь, що файл serviceAccountKey.json існує, має правильний формат та шлях у .env (SERVICE_ACCOUNT_KEY_PATH) вказано вірно.");
    process.exit(1); // Зупиняємо сервер, якщо SDK не вдалося ініціалізувати
}

const db = admin.firestore(); // Отримуємо доступ до бази даних Firestore
// -----------------------------------------

const app = express();

// Middleware (Проміжне програмне забезпечення)
app.use(cors()); // Дозволяє запити з інших доменів (наприклад, з вашого фронтенду)
app.use(express.json()); // Дозволяє серверу розбирати тіла запитів у форматі JSON

// --- Middleware для верифікації Firebase Authentication Token ---
const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization; // Отримуємо заголовок Authorization
    // Перевіряємо наявність токену та його формат (має починатися з "Bearer ")
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Немає токену автентифікації або невірний формат" });
    }
    const idToken = authHeader.split('Bearer ')[1]; // Витягуємо сам токен

    try {
        // Верифікуємо токен за допомогою Firebase Admin SDK
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user = decodedToken; // Додаємо розшифровані дані користувача (включаючи UID) до об'єкту запиту
        next(); // Передаємо управління наступному обробнику маршруту
    } catch (error) {
        console.error('Помилка верифікації токена:', error);
        return res.status(403).json({ message: "Невалідний або прострочений токен автентифікації" });
    }
};
// -------------------------------------------------


// --- Маршрут для отримання списку ID статей, які вподобав користувач ---
app.get('/api/likes', verifyToken, async (req, res) => {
    const userId = req.user.uid; // ID користувача отримуємо з верифікованого токену (доданого middleware `verifyToken`)
    try {
        const userLikesRef = db.collection('userLikes').doc(userId); // Посилання на документ з лайками користувача
        const doc = await userLikesRef.get(); // Отримуємо документ

        if (!doc.exists) {
            // Якщо документ для цього користувача ще не існує, повертаємо порожній масив
            res.json({ likedArticleIds: [] });
        } else {
            // Якщо документ існує, повертаємо масив ID вподобаних статей (або порожній масив, якщо поле відсутнє)
            res.json({ likedArticleIds: doc.data().likedArticleIds || [] });
        }
    } catch (error) {
        console.error('Помилка отримання вподобань користувача:', error);
        res.status(500).json({ message: 'Внутрішня помилка сервера при отриманні вподобань' });
    }
});
// -----------------------------------------------------


// --- Маршрут для ДОДАВАННЯ лайка статті ---
app.post('/api/likes', verifyToken, async (req, res) => {
    const userId = req.user.uid; // ID користувача
    const { articleId } = req.body; // ID статті з тіла запиту

    // Перевірка наявності articleId
    if (!articleId) {
        return res.status(400).json({ message: 'Необхідно надати ID статті (articleId)' });
    }

    // Посилання на документ з лайками користувача та документ самої статті
    const userLikesRef = db.collection('userLikes').doc(userId);
    const articleRef = db.collection('articles').doc(articleId);

    try {
        // Виконуємо операції атомарно за допомогою транзакції Firestore
        const newLikesCount = await db.runTransaction(async (transaction) => {
            // 1. Читаємо документ лайків користувача всередині транзакції
            const userLikesDoc = await transaction.get(userLikesRef);
            // 2. Читаємо документ статті всередині транзакції
            const articleDoc = await transaction.get(articleRef);

            // Перевіряємо, чи існує стаття
            if (!articleDoc.exists) {
                throw new Error("Статтю з вказаним ID не знайдено"); // Генеруємо помилку, щоб транзакція відкотилася
            }

            // Отримуємо поточний список лайків користувача (або порожній масив)
            const likedArticleIds = userLikesDoc.exists ? userLikesDoc.data().likedArticleIds || [] : [];

            // Перевіряємо, чи користувач вже лайкнув цю статтю
            if (likedArticleIds.includes(articleId)) {
                 // Якщо вже лайкнув, нічого не змінюємо, просто повертаємо поточну кількість лайків
                 console.log(`Користувач ${userId} вже лайкав статтю ${articleId}. Оновлення не потрібне.`);
                 return articleDoc.data().likesCount || 0; // Повертаємо поточну кількість лайків зі статті
            }

            // 3. Оновлюємо документ лайків користувача: додаємо ID статті до масиву `likedArticleIds`
            // Використовуємо transaction.set з { merge: true }, щоб створити документ, якщо його немає, або оновити існуючий
            transaction.set(userLikesRef,
                { likedArticleIds: admin.firestore.FieldValue.arrayUnion(articleId) }, // arrayUnion додає елемент, якщо його немає
                { merge: true } // Важливо для створення документа, якщо він відсутній
            );

            // 4. Оновлюємо документ статті: збільшуємо лічильник `likesCount` на 1
            transaction.update(articleRef, {
                likesCount: admin.firestore.FieldValue.increment(1) // Атомарно збільшує значення поля на 1
            });

            // Розраховуємо та повертаємо нову очікувану кількість лайків
            const currentCount = articleDoc.data().likesCount || 0;
            return currentCount + 1;
        });

        // Логуємо успішне виконання та відправляємо відповідь клієнту
        console.log(`Користувач ${userId} вподобав статтю ${articleId}. Нова кількість лайків: ${newLikesCount}`);
        res.status(200).json({ message: 'Статтю успішно вподобано', likesCount: newLikesCount });

    } catch (error) {
        console.error('Помилка транзакції при збереженні вподобання:', error);
        // Повертаємо повідомлення про помилку (специфічне з транзакції або загальне)
        res.status(500).json({ message: error.message || 'Внутрішня помилка сервера при збереженні вподобання' });
    }
});


// --- Маршрут для ВИДАЛЕННЯ лайка зі статті (Розлайкування) ---
app.delete('/api/likes/:articleId', verifyToken, async (req, res) => {
    const userId = req.user.uid; // ID користувача
    const { articleId } = req.params; // ID статті з параметрів URL

    // Перевірка наявності articleId в URL
    if (!articleId) {
        // Ця перевірка менш імовірна через структуру маршруту, але залишаємо для повноти
        return res.status(400).json({ message: 'Необхідно вказати ID статті (articleId) у шляху запиту' });
    }

    // Посилання на документи
    const userLikesRef = db.collection('userLikes').doc(userId);
    const articleRef = db.collection('articles').doc(articleId);

    try {
        // Виконуємо операції атомарно за допомогою транзакції Firestore
        const newLikesCount = await db.runTransaction(async (transaction) => {
            // 1. Читаємо документи всередині транзакції
            const userLikesDoc = await transaction.get(userLikesRef);
            const articleDoc = await transaction.get(articleRef);

            // Перевірка, чи користувач взагалі має запис про лайки
            if (!userLikesDoc.exists) {
                 console.log(`Документ лайків для користувача ${userId} не існує. Видалення лайка неможливе.`);
                 // Якщо документа немає, то й лайка на цю статтю немає. Повертаємо поточну кількість лайків статті (або 0)
                 return articleDoc.exists ? articleDoc.data().likesCount || 0 : 0;
            }

            // Отримуємо поточний список лайків користувача
            const likedArticleIds = userLikesDoc.data().likedArticleIds || [];

            // Перевіряємо, чи користувач дійсно лайкав цю статтю
            if (!likedArticleIds.includes(articleId)) {
                 // Якщо лайка не було, нічого не робимо, повертаємо поточну кількість
                 console.log(`Користувач ${userId} не лайкав статтю ${articleId}. Оновлення не потрібне.`);
                 return articleDoc.exists ? articleDoc.data().likesCount || 0 : 0;
            }

            // 2. Оновлюємо документ лайків користувача: видаляємо ID статті з масиву `likedArticleIds`
            // Використовуємо transaction.update, оскільки ми точно знаємо, що документ userLikesDoc існує
            transaction.update(userLikesRef, {
                likedArticleIds: admin.firestore.FieldValue.arrayRemove(articleId) // arrayRemove видаляє всі входження елемента
            });

            // 3. Оновлюємо документ статті: зменшуємо лічильник `likesCount` на 1, лише якщо стаття існує і лічильник > 0
            const currentCount = articleDoc.exists ? articleDoc.data().likesCount || 0 : 0;
            if (articleDoc.exists && currentCount > 0) {
                 transaction.update(articleRef, {
                    likesCount: admin.firestore.FieldValue.increment(-1) // Атомарно зменшує значення поля на 1
                });
                 return currentCount - 1; // Повертаємо очікувану нову кількість
            } else {
                 // Якщо статті немає або лічильник вже 0, повертаємо 0
                 if (!articleDoc.exists) {
                     console.warn(`Спроба розлайкати неіснуючу статтю: ${articleId}, але запис у userLikes був.`);
                 }
                 return 0;
            }
        });

        // Логуємо успішне видалення та відправляємо відповідь
        console.log(`Користувач ${userId} видалив лайк зі статті ${articleId}. Нова кількість лайків: ${newLikesCount}`);
        res.status(200).json({ message: 'Лайк успішно видалено', likesCount: newLikesCount });

    } catch (error) {
        console.error('Помилка транзакції при видаленні вподобання:', error);
        res.status(500).json({ message: error.message || 'Внутрішня помилка сервера при видаленні вподобання' });
    }
});
// ------------------------------------------------------

// --- Маршрут для ДОДАВАННЯ коментаря до статті ---
app.post('/api/comments/:articleId', verifyToken, async (req, res) => {
    const userId = req.user.uid; // ID користувача з токену
    const userEmail = req.user.email; // Email користувача з токену
    const { articleId } = req.params; // ID статті з URL
    const { name, text } = req.body; // Ім'я (опціонально) та текст коментаря з тіла запиту

    // Валідація: текст коментаря не може бути порожнім
    if (!text || !text.trim()) {
        return res.status(400).json({ message: 'Текст коментаря не може бути порожнім' });
    }
    // Використовуємо надане ім'я або 'Анонім', якщо ім'я не вказано чи порожнє
    const commentName = name && name.trim() ? name.trim() : 'Анонім';

    try {
        // Посилання на документ статті
        const articleDocRef = db.collection('articles').doc(articleId);

        // 1. Читаємо поточний документ статті, щоб перевірити її існування та отримати поточні коментарі
        const articleDoc = await articleDocRef.get();
        if (!articleDoc.exists) {
            return res.status(404).json({ message: 'Статтю з вказаним ID не знайдено' });
        }

        // 2. Отримуємо поточний масив коментарів з документа статті (або створюємо порожній, якщо його немає)
        const currentComments = articleDoc.data().comments || [];

        // 3. Створюємо новий об'єкт коментаря
        const newComment = {
            userId: userId,                 // ID користувача, що залишив коментар
            userEmail: userEmail,           // Email користувача (може бути корисним)
            name: commentName,              // Ім'я користувача або "Анонім"
            text: text.trim(),              // Текст коментаря (без зайвих пробілів на початку/кінці)
            createdAt: new Date()           // Час створення коментаря (час сервера Node.js)
            // Примітка: Використання `new Date()` дає час сервера. Для часу Firestore (`FieldValue.serverTimestamp()`)
            // потрібен був би інший підхід, наприклад, запис безпосередньо в Firestore без попереднього читання,
            // або використання `FieldValue.arrayUnion`. Поточний підхід з перезаписом масиву простіший.
        };

        // 4. Додаємо новий коментар до масиву існуючих коментарів
        const updatedComments = [...currentComments, newComment];

        // 5. Оновлюємо поле `comments` у документі статті, перезаписуючи його новим масивом
        await articleDocRef.update({
            comments: updatedComments
        });

        console.log(`Користувач ${userId} додав коментар до статті ${articleId}`);
        // Повертаємо успішну відповідь зі статусом 201 (Created) та доданим коментарем
        res.status(201).json({ message: 'Коментар успішно додано', comment: newComment });

    } catch (error) {
        console.error('Помилка при додаванні коментаря:', error);
        res.status(500).json({ message: 'Внутрішня помилка сервера при додаванні коментаря' });
    }
});
// ------------------------------------------

// --- Роздача статичних файлів збірки React ---
// Вказуємо шлях до папки `build`, де знаходиться готова збірка фронтенду
const buildPath = path.join(__dirname, '../build');
app.use(express.static(buildPath)); // Middleware для роздачі статичних файлів (HTML, CSS, JS, зображення)
// ------------------------------------

// --- Обробка маршрутизації на стороні клієнта (Client-Side Routing) ---
// Усі GET-запити, які не були оброблені попередніми маршрутами (наприклад, /api/*),
// будуть перенаправлені на `index.html`. React Router далі обробить шлях на клієнті.
app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'), (err) => {
      if (err) {
        // Якщо виникає помилка при відправці файлу (наприклад, файл не знайдено)
        res.status(500).send(err);
      }
    });
});
// ---------------------------------

// Визначаємо порт для сервера (змінна середовища PORT або 5000 за замовчуванням)
const PORT = process.env.PORT || 5000;
// Запускаємо сервер
app.listen(PORT, () => {
    console.log(`Сервер успішно запущено та слухає порт ${PORT}`);
});