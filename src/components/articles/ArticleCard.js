import React, { useState, useEffect } from 'react';
import CommentForm from './CommentForm';
import CommentList from './CommentList';
import { useAuth } from '../../context/AuthContext';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
if (!API_BASE_URL) {
    // Попередження, якщо змінна середовища для URL API не встановлена
    console.warn("Попередження: REACT_APP_API_BASE_URL не визначено. API-запити можуть не працювати.");
}

/**
 * Компонент ArticleCard відображає одну картку статті.
 * Включає заголовок, дату, кнопку "Подобається" (з функціоналом лайк/розлайк і лічильником),
 * контент (що розгортається), та секцію коментарів.
 *
 * @param {object} props - Пропси компонента.
 * @param {object} props.article - Об'єкт статті з даними (id, title, date, image, text, comments, likesCount).
 * @param {function} props.handleAddComment - Функція для обробки додавання нового коментаря.
 */
function ArticleCard({ article, handleAddComment }) {
    const { currentUser } = useAuth();
    // Ініціалізуємо лічильник лайків початковим значенням з `article.likesCount` або 0
    const [likes, setLikes] = useState(article.likesCount !== undefined ? article.likesCount : 0);
    // Стан: чи вподобана стаття поточним авторизованим користувачем
    const [isLiked, setIsLiked] = useState(false);
    // Стан: чи виконується зараз запит на лайк/розлайк
    const [isLoadingLike, setIsLoadingLike] = useState(false);
    // Стан: чи розгорнуто детальний вміст статті
    const [isExpanded, setIsExpanded] = useState(false);

    // --- Ефект: Завантаження статусу лайка користувача та оновлення лічильника при зміні article.likesCount ---
    useEffect(() => {
        // Синхронізуємо локальний стан лічильника `likes` зі значенням `article.likesCount`,
        // яке може оновитися ззовні (наприклад, після додавання коментаря і перезавантаження даних)
        setLikes(article.likesCount !== undefined ? article.likesCount : 0);

        // Асинхронна функція для отримання статусу лайка поточної статті для поточного користувача
        const fetchLikeStatus = async () => {
            // Якщо користувач не авторизований або URL API не задано, статус лайка не може бути визначений
            if (!currentUser || !API_BASE_URL) {
                setIsLiked(false); // Встановлюємо як "не вподобано"
                return; // Виходимо з функції
            }
            // Не встановлюємо isLoadingLike тут, щоб уникнути миготіння інтерфейсу при кожному оновленні article.likesCount
            try {
                const token = await currentUser.getIdToken(); // Отримуємо токен автентифікації
                // Робимо запит до API для отримання списку ID всіх вподобаних статей користувача
                const response = await fetch(`${API_BASE_URL}/api/likes`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                // Обробляємо можливі помилки відповіді (крім 404 - Not Found, яка означає, що користувач ще нічого не лайкав)
                if (!response.ok && response.status !== 404) {
                   console.error(`Помилка отримання статусу лайків: ${response.status} ${response.statusText}`);
                   setIsLiked(false); // Скидаємо статус лайка при помилці
                   return;
                }
                // Якщо відповідь 404 (документа лайків немає) або успішна відповідь
                if (response.status === 404) {
                    setIsLiked(false); // Користувач ще нічого не лайкав
                } else {
                    const data = await response.json(); // Розбираємо JSON відповіді
                    // Перевіряємо, чи містить масив `likedArticleIds` ID поточної статті
                    setIsLiked(data.likedArticleIds && data.likedArticleIds.includes(article.id));
                }
            } catch (error) {
                console.error("Не вдалося завантажити статус лайка:", error);
                setIsLiked(false); // Скидаємо статус лайка при будь-якій помилці запиту
            }
            // setIsLoadingLike не змінюємо тут, оскільки це фонове завантаження статусу
        };

        fetchLikeStatus(); // Викликаємо функцію завантаження статусу
        // Залежності ефекту: виконується при зміні користувача, ID статті або кількості лайків статті (для синхронізації)
    }, [currentUser, article.id, article.likesCount, API_BASE_URL]);
    // --------------------------------------------

    // --- Обробник кліку на кнопку "Подобається" (лайк / розлайк) ---
    const handleToggleLike = async () => {
        // Перевірка авторизації користувача
        if (!currentUser) {
            alert("Будь ласка, увійдіть в систему, щоб оцінювати статті.");
            return;
        }
        // Запобігаємо повторним клікам під час виконання запиту або якщо API недоступний
        if (isLoadingLike || !API_BASE_URL) return;

        setIsLoadingLike(true); // Встановлюємо індикатор завантаження ПЕРЕД початком запиту
        const currentLikeStatus = isLiked; // Зберігаємо поточний статус лайка для визначення дії та можливого відкату
        // Визначаємо HTTP метод і URL залежно від того, лайкаємо чи розлайкуємо
        const method = currentLikeStatus ? 'DELETE' : 'POST';
        const url = currentLikeStatus ? `${API_BASE_URL}/api/likes/${article.id}` : `${API_BASE_URL}/api/likes`;
        // Тіло запиту потрібне тільки для POST (додавання лайка)
        const body = !currentLikeStatus ? JSON.stringify({ articleId: article.id }) : null;

        // --- Оптимістичне оновлення інтерфейсу ---
        // Оновлюємо стан кнопки та лічильника негайно, не чекаючи відповіді сервера,
        // для кращого користувацького досвіду.
        setIsLiked(!currentLikeStatus);
        setLikes(prevLikes => currentLikeStatus ? Math.max(0, prevLikes - 1) : prevLikes + 1); // Запобігаємо від'ємним значенням лічильника

        try {
            const token = await currentUser.getIdToken(); // Отримуємо токен
            // Виконуємо запит до API
            const response = await fetch(url, {
                method: method,
                headers: {
                    // Додаємо 'Content-Type' тільки якщо є тіло запиту (для POST)
                    ...(body && { 'Content-Type': 'application/json' }),
                    'Authorization': `Bearer ${token}` // Додаємо токен авторизації
                },
                body: body // Додаємо тіло запиту (якщо є)
            });

            // Спробуємо отримати дані з відповіді, навіть якщо статус не OK (може містити повідомлення про помилку)
            const responseData = await response.json().catch(() => null);

            // Перевіряємо, чи відповідь сервера була успішною
            if (!response.ok) {
                 // --- Відкат оптимістичного оновлення ---
                 // Якщо сервер повернув помилку, повертаємо стан UI до попереднього значення
                 setIsLiked(currentLikeStatus);
                 setLikes(prevLikes => currentLikeStatus ? prevLikes + 1 : Math.max(0, prevLikes - 1));

                // Генеруємо помилку для обробки в блоці catch
                throw new Error(responseData?.message || `Помилка ${response.status}`);
            }

             // --- Успішне виконання запиту ---
             // Оновлюємо лічильник лайків значенням, отриманим з відповіді сервера,
             // щоб гарантувати синхронізацію стану UI з базою даних.
             if (responseData && responseData.likesCount !== undefined) {
                  setLikes(responseData.likesCount);
             }

            console.log(`Стаття ${article.id} успішно ${currentLikeStatus ? 'розлайкана' : 'вподобана'}. Актуальна к-сть: ${responseData?.likesCount}`);

        } catch (error) {
            // Обробка помилок (з fetch або викинутих вручну при !response.ok)
            console.error(`Помилка ${currentLikeStatus ? 'видалення' : 'додавання'} лайка:`, error);
            alert(`Не вдалося ${currentLikeStatus ? 'видалити' : 'вподобати'} статтю: ${error.message}`);
            // Відкат UI вже мав відбутися всередині `if (!response.ok)`, але можна додати перевірку тут для надійності.
            // Проте, якщо помилка сталася до перевірки `response.ok` (наприклад, мережева), відкат не відбувся,
            // але й запит до сервера не дійшов, тому стан UI відповідає очікуванням.
        } finally {
            // Завершуємо індикацію завантаження ПІСЛЯ завершення запиту (успішного чи неуспішного)
            setIsLoadingLike(false);
        }
    };
    // ------------------------------------

     // --- Обробник кліку на картку для розгортання / згортання контенту ---
    const handleToggleExpand = (event) => {
        // Перевіряємо, чи клік відбувся на інтерактивному елементі всередині картки (кнопка лайку, форма коментарів, кнопка згортання)
        if (event.target.closest('.like-btn, .comment-form, .collapse-btn')) {
            return; // Якщо так, не змінюємо стан розгортання/згортання картки
        }
        // Перевіряємо, чи клік відбувся на посиланні заголовка
        if (event.target.tagName === 'A' && event.target.closest('.publication-title')) {
            event.preventDefault(); // Забороняємо стандартну поведінку переходу по якорю (#)
            // Розгортання/згортання відбудеться далі
        }
        // Змінюємо стан розгортання/згортання на протилежний
        setIsExpanded(!isExpanded);
    };
    // ----------------------------------------

    // Формування рядка CSS класів для кореневого елемента статті
    const articleClasses = [
        'article-item', // Базовий клас
        isExpanded ? 'article-item--expanded' : '', // Клас для розгорнутого стану
        isLiked ? 'article-item--liked' : '' // Клас для вподобаного стану (можна використовувати для стилізації)
    ].filter(Boolean).join(' '); // Фільтруємо порожні рядки і об'єднуємо

    // Рендеринг компонента
    return (
        <article id={article.id} className={articleClasses} onClick={handleToggleExpand}>
            <div className="publication-header">
                <h3 className="publication-title">
                    {/* Посилання на саму статтю (якір), клік обробляється handleToggleExpand */}
                    <a href={`#${article.id}`} onClick={(e) => e.preventDefault()}>{article.title}</a>
                </h3>
                <p className="publication-date">{article.date}</p>
                <div className="publication-actions">
                    <button
                        className={`like-btn ${isLiked ? 'liked' : ''}`} // Динамічний клас для стилізації кнопки лайка
                        onClick={(e) => {
                            e.stopPropagation(); // Зупиняємо спливання події, щоб не спрацював handleToggleExpand на картці
                            handleToggleLike(); // Викликаємо обробник лайку
                        }}
                        // Кнопка неактивна, якщо користувач не авторизований або йде запит
                        disabled={!currentUser || isLoadingLike}
                        // Динамічний title для підказки користувачу
                        title={!currentUser ? "Увійдіть, щоб оцінити" : (isLiked ? "Натисніть, щоб скасувати вподобання" : "Натисніть, щоб вподобати")}
                    >
                        {/* Текст кнопки залежить від стану завантаження та статусу лайка, показує лічильник */}
                        {isLoadingLike ? '...' : (isLiked ? 'Вподобано' : 'Подобається')} ({likes})
                    </button>
                </div>
            </div>

            {/* Вміст статті, видимий при isExpanded */}
            <div className="publication-content">
                <div className="publication-image">
                    {/* Використовуємо PUBLIC_URL для правильного шляху до зображень у збірці */}
                    <img src={process.env.PUBLIC_URL + article.image} alt={article.alt || article.title} />
                </div>
                <div className="publication-text">
                    {/* Рендеринг тексту: якщо це масив рядків - кожен як параграф, інакше - один параграф */}
                    {Array.isArray(article.text) ? article.text.map((paragraph, index) => <p key={index}>{paragraph}</p>) : <p>{article.text}</p>}
                    {/* Кнопка/посилання для згортання/розгортання */}
                    <a href="#toggle" className="collapse-btn" onClick={(e) => {
                        e.preventDefault(); // Запобігаємо переходу по якорю
                        e.stopPropagation(); // Зупиняємо спливання події до картки
                        setIsExpanded(!isExpanded); // Змінюємо стан розгортання
                    }}>
                        {isExpanded ? 'Згорнути' : 'Розгорнути'}
                    </a>
                </div>
            </div>

            {/* Секція коментарів, завжди видима */}
            <div className="comment-section">
                <h4>Коментарі</h4>
                {/* Форма для додавання нового коментаря */}
                <CommentForm
                    articleId={article.id}
                    onCommentSubmit={handleAddComment} // Передаємо функцію обробки з батьківського компонента
                />
                {/* Список існуючих коментарів */}
                <CommentList comments={article.comments} />
            </div>
        </article>
    );
}

export default ArticleCard;