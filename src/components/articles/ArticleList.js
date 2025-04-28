// src/components/articles/ArticleList.js
import React, { useState, useEffect } from 'react';
import ArticleCard from './ArticleCard';
import { getArticles } from '../../firebase/firestoreService'; // Сервіс для отримання статей
import { useAuth } from '../../context/AuthContext';

// Отримуємо базовий URL API зі змінних середовища
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function ArticleList() {
    const { currentUser } = useAuth(); // Отримуємо поточного користувача з контексту
    const [articles, setArticles] = useState([]); // Стан для збереження списку статей
    const [loading, setLoading] = useState(true); // Стан індикатора завантаження
    const [error, setError] = useState(null); // Стан для збереження повідомлень про помилки
    const [sortByDate, setSortByDate] = useState('desc'); // Стан для напрямку сортування ('desc' - спадання, 'asc' - зростання)

    // Ефект для початкового завантаження списку статей при монтуванні компонента
    useEffect(() => {
        const fetchArticles = async () => {
            setLoading(true); // Починаємо завантаження
            setError(null); // Скидаємо попередні помилки
            try {
                // Запитуємо статті за допомогою сервісу
                const fetchedArticles = await getArticles();
                setArticles(fetchedArticles); // Зберігаємо отримані статті у стані
            } catch (err) {
                console.error("Помилка завантаження статей:", err);
                setError("Не вдалося завантажити статті."); // Встановлюємо повідомлення про помилку
            } finally {
                setLoading(false); // Завершуємо завантаження (успішне чи ні)
            }
        };
        fetchArticles(); // Викликаємо функцію завантаження
    }, []); // Порожній масив залежностей означає, що ефект виконається один раз при монтуванні

    // Обробник зміни напрямку сортування
    const handleSortChange = (event) => {
        setSortByDate(event.target.value);
    };

    // Функція для обробки додавання нового коментаря через API
    const handleAddComment = async (articleId, commentData) => {
        // Перевірка авторизації (додаткова, оскільки основна перевірка має бути в CommentForm або при відправці)
        if (!currentUser || !API_BASE_URL) {
            console.error("Спроба додати коментар без авторизації або API URL.");
            // Викидаємо помилку, яка буде оброблена в компоненті CommentForm (відображення alert)
            throw new Error("Потрібна авторизація для додавання коментарів.");
        }

        try {
            const token = await currentUser.getIdToken(); // Отримуємо Firebase ID токен користувача

            // Відправляємо POST-запит на бекенд для додавання коментаря
            const response = await fetch(`${API_BASE_URL}/api/comments/${articleId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Вказуємо тип контенту
                    'Authorization': `Bearer ${token}` // Додаємо токен авторизації
                },
                body: JSON.stringify(commentData) // Надсилаємо дані коментаря (name, text) у форматі JSON
            });

            // Перевіряємо, чи запит був успішним
            if (!response.ok) {
                // Якщо є помилка, намагаємося отримати тіло відповіді з повідомленням про помилку
                const errorData = await response.json().catch(() => ({ message: `Помилка сервера ${response.status}` }));
                // Викидаємо помилку з повідомленням від сервера або загальним повідомленням
                throw new Error(errorData.message || `Помилка ${response.status}`);
            }

            // Успіх! Отримуємо збережений коментар з відповіді бекенду (має містити поле 'comment')
            const { comment: savedComment } = await response.json();

            // Оновлюємо локальний стан articles ПІСЛЯ успішної відповіді від сервера
            // Це надійніший підхід, ніж оптимістичне оновлення, бо гарантує консистентність даних
            setArticles(currentArticles => {
                // Проходимо по всіх статтях у стані
                return currentArticles.map(article => {
                    // Знаходимо потрібну статтю за ID
                    if (article.id === articleId) {
                        // Додаємо новий коментар (повернутий сервером) до існуючого масиву коментарів статті
                        const updatedComments = [...(article.comments || []), savedComment];
                        // Повертаємо оновлений об'єкт статті
                        return { ...article, comments: updatedComments };
                    }
                    // Для інших статей повертаємо їх без змін
                    return article;
                });
            });

            console.log('Коментар успішно додано через бекенд:', savedComment);
            // Повертати нічого не потрібно, оскільки оновлення стану відбувається тут

        } catch (error) {
            console.error("Помилка відправки коментаря на бекенд:", error);
            // Перекидаємо помилку далі, щоб її міг обробити компонент CommentForm (наприклад, показати alert користувачу)
            throw error;
        }
    };

    // Логіка сортування статей
    const sortedArticles = [...articles].sort((a, b) => {
         try {
            // Перетворюємо дати у форматі 'DD.MM.YYYY' в об'єкти Date для порівняння
            // Використовуємо `?.` для безпечного доступу та `|| 0` для обробки можливих `undefined`
            const dateA = new Date(a.date?.split('.').reverse().join('-') || 0);
            const dateB = new Date(b.date?.split('.').reverse().join('-') || 0);
            // Якщо дата некоректна, вважаємо елементи рівними
            if (isNaN(dateA) || isNaN(dateB)) return 0;
            // Порівнюємо дати залежно від обраного напрямку сортування
            return sortByDate === 'asc' ? dateA - dateB : dateB - dateA;
        } catch (e) {
            // Обробка можливих помилок під час парсингу дати
            console.error("Помилка сортування за датою:", e);
            return 0; // Вважаємо елементи рівними при помилці
        }
    });

    // Умовний рендеринг залежно від стану завантаження та помилок
    if (loading) return <p className="loading-message">Завантаження статей...</p>;
    if (error) return <p className="error-message" style={{ color: 'red' }}>{error}</p>;

    // Рендеринг списку статей
    return (
        <section id="articles" className="articles-section">
            <h2>Статті</h2>
            {/* Контрол для вибору сортування */}
            <div className="sort-controls">
                 <label htmlFor="sort-date">Сортувати за датою:</label>
                 <select id="sort-date" value={sortByDate} onChange={handleSortChange}>
                     <option value="desc">Спочатку новіші</option>
                     <option value="asc">Спочатку старіші</option>
                 </select>
             </div>
            {/* Контейнер для списку карток статей */}
            <div className="articles-list">
                {sortedArticles.length > 0 ? (
                    // Якщо статті є, відображаємо їх за допомогою ArticleCard
                    sortedArticles.map(article => (
                        <ArticleCard
                            key={article.id} // Унікальний ключ для елемента списку
                            article={article} // Передаємо дані статті
                            handleAddComment={handleAddComment} // Передаємо функцію для додавання коментарів
                        />
                    ))
                ) : (
                    // Якщо статей немає, відображаємо повідомлення
                    <p>Наразі статей немає.</p>
                )}
            </div>
        </section>
    );
}

export default ArticleList;