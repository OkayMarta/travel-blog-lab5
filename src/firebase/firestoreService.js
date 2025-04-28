import { db, auth } from './config'; // Імпортуємо екземпляри Firestore (db) та Auth (auth) з файлу конфігурації
// Імпортуємо необхідні функції Firestore для роботи з даними
import {
    collection,      // Для отримання посилання на колекцію
    getDocs,         // Для отримання всіх документів з колекції/запиту
    query,           // Для створення запитів до Firestore
    orderBy,         // Для сортування результатів запиту
    doc,             // Для отримання посилання на конкретний документ за ID
    updateDoc,       // Для оновлення існуючого документа
    arrayUnion,      // Для додавання елементів до поля-масиву без дублікатів
    serverTimestamp  // Для отримання мітки часу сервера Firestore
  } from 'firebase/firestore';

// --- Отримання Статей ---

// Створюємо постійне посилання на колекцію 'articles' в Firestore.
// Це оптимізує код, не створюючи посилання щоразу при виклику функції.
const articlesCollectionRef = collection(db, 'articles');

/**
 * Асинхронна функція для отримання всіх статей з колекції 'articles' у Firestore.
 * @returns {Promise<Array<object>>} Проміс, що повертає масив об'єктів статей.
 * Кожен об'єкт містить дані документа та його ID. У разі помилки повертає порожній масив.
 */
export const getArticles = async () => {
  console.log("Спроба отримати статті з Firestore..."); // Лог для відладки
  try {
    // Створюємо запит до колекції 'articles'.
    // Можна додати сортування, наприклад, за полем 'createdAt' в порядку спадання:
    // const articlesQuery = query(articlesCollectionRef, orderBy("createdAt", "desc"));
    // Наразі отримуємо документи без певного порядку (Firestore може повернути в будь-якому порядку)
    const articlesQuery = query(articlesCollectionRef);

    // Виконуємо запит та отримуємо знімок результатів (querySnapshot)
    const querySnapshot = await getDocs(articlesQuery);

    // Перетворюємо querySnapshot у масив об'єктів статей.
    // Для кожного документа (doc) отримуємо його дані (doc.data())
    // та додаємо його унікальний ID (doc.id).
    const articles = querySnapshot.docs.map(doc => ({
      ...doc.data(), // Розгортаємо всі поля документа
      id: doc.id      // Додаємо поле 'id'
    }));

    console.log("Отримані статті:", articles); // Лог для відладки
    return articles; // Повертаємо масив статей

  } catch (error) {
    // Обробляємо помилки, що могли виникнути під час запиту
    console.error("Помилка отримання статей: ", error);
    return []; // Повертаємо порожній масив у разі помилки
  }
};

// --- Додавання Коментаря ---

/**
 * Асинхронна функція для додавання нового коментаря до конкретної статті у Firestore.
 * @param {string} articleId - ID документа статті, до якої додається коментар.
 * @param {object} commentData - Об'єкт з даними коментаря (наприклад, { name: 'Ім'я', text: 'Текст коментаря' }).
 * @returns {Promise<object>} Проміс, що повертає об'єкт збереженого коментаря (з доданими userId, userEmail, createdAt).
 * @throws {Error} Кидає помилку, якщо користувач не авторизований або виникає помилка Firestore.
 */
export const addCommentToFirebase = async (articleId, commentData) => {
  // Перевірка авторизації: користувач повинен бути залогінений, щоб коментувати.
  // Хоча ця перевірка зазвичай є і в UI, додаємо її тут як додатковий рівень захисту.
  if (!auth.currentUser) {
    console.error("Спроба додати коментар без авторизації.");
    throw new Error("Користувач повинен увійти, щоб залишити коментар.");
  }

  // Отримуємо посилання на конкретний документ статті в Firestore за її ID.
  const articleDocRef = doc(db, "articles", articleId);

  try {
    // Готуємо об'єкт коментаря для збереження в Firestore.
    const commentToSave = {
      ...commentData,                 // Включаємо дані, що прийшли з форми (name, text)
      userId: auth.currentUser.uid,   // Додаємо ID поточного користувача
      userEmail: auth.currentUser.email, // Додаємо email користувача (для зручності відображення)
      createdAt: serverTimestamp()    // Додаємо мітку часу сервера Firestore
    };

    // Оновлюємо документ статті.
    // Використовуємо `arrayUnion` для додавання `commentToSave` до масиву `comments`.
    // `arrayUnion` гарантує, що ідентичні об'єкти не будуть додані повторно.
    await updateDoc(articleDocRef, {
      comments: arrayUnion(commentToSave)
    });

    console.log(`Firestore: Коментар додано до статті ${articleId}`); // Лог успішного додавання

    // Повертаємо об'єкт коментаря, який був (або буде) збережений.
    // Це може бути корисно для "оптимістичного" оновлення UI,
    // хоча мітка часу `createdAt` буде заповнена сервером трохи пізніше.
    // Повертаємо з клієнтською міткою часу для негайного відображення.
    return { ...commentToSave, createdAt: new Date() };

  } catch (error) {
    // Обробляємо помилки, що могли виникнути під час оновлення документа
    console.error(`Firestore: Помилка додавання коментаря до статті ${articleId}: `, error);
    throw error; // Перекидаємо помилку далі, щоб її можна було обробити у викликаючому коді
  }
};

// --- (Заготовка) Оновлення Лайків ---
/*
// Приклад можливої функції для оновлення лайків (потребує доопрацювання)
export const updateArticleLikes = async (articleId, userId) => {
  if (!userId) throw new Error("Потрібен ID користувача для встановлення лайку.");

  const articleDocRef = doc(db, "articles", articleId);

  // Потенційна логіка для лайків (може вимагати транзакцій):
  // 1. Прочитати поточний стан документа статті (getDoc).
  // 2. Перевірити, чи масив `likedBy` (якщо такий є) містить `userId`.
  // 3. Якщо містить:
  //    - Видалити `userId` з `likedBy` (використовуючи `arrayRemove`).
  //    - Зменшити лічильник `likesCount` (використовуючи `increment(-1)`).
  // 4. Якщо не містить:
  //    - Додати `userId` до `likedBy` (використовуючи `arrayUnion`).
  //    - Збільшити лічильник `likesCount` (використовуючи `increment(1)`).
  // 5. Виконати оновлення документа (`updateDoc`) з розрахованими змінами.
  //    Для надійності (особливо при одночасному доступі) краще використовувати транзакції Firestore (`runTransaction`).

  console.log(`Заглушка для оновлення лайків статті ${articleId} користувачем ${userId}`);
};
*/