import React, { useState, useEffect } from 'react';
import ArticleCard from './ArticleCard'; // Компонент для відображення окремої статті
import { getArticles } from '../../firebase/firestoreService'; // Функція для отримання статей з Firestore
import { useAuth } from '../../context/AuthContext'; // Хук для доступу до даних автентифікації

/**
 * Компонент ArticleList відповідає за завантаження, сортування
 * та відображення списку статей.
 */
function ArticleList() {
  // Отримуємо інформацію про поточного користувача з контексту
  const { currentUser } = useAuth();

  // Стан для зберігання списку завантажених статей
  const [articles, setArticles] = useState([]);
  // Стан для відстеження процесу завантаження статей
  const [loading, setLoading] = useState(true);
  // Стан для зберігання можливих помилок під час завантаження
  const [error, setError] = useState(null);
  // Стан для зберігання поточного вибраного методу сортування (за датою)
  const [sortByDate, setSortByDate] = useState('desc'); // 'desc' - спочатку новіші, 'asc' - спочатку старіші

  // Ефект для завантаження статей при першому рендері компонента
  useEffect(() => {
    /**
     * Асинхронна функція для отримання статей з Firestore.
     */
    const fetchArticles = async () => {
      setLoading(true); // Починаємо завантаження
      setError(null);   // Скидаємо попередні помилки
      try {
        // Викликаємо функцію сервісу для отримання статей
        const fetchedArticles = await getArticles();
        // Оновлюємо стан компонента отриманими статтями
        setArticles(fetchedArticles);
      } catch (err) {
        // Обробляємо помилку завантаження
        console.error("Помилка завантаження статей в компоненті:", err);
        setError("Не вдалося завантажити статті. Будь ласка, спробуйте оновити сторінку.");
      } finally {
        // Завершуємо завантаження незалежно від результату
        setLoading(false);
      }
    };
    // Викликаємо функцію завантаження
    fetchArticles();
  }, []); // Порожній масив залежностей означає, що ефект виконається один раз

  /**
   * Обробник зміни значення в випадаючому списку сортування.
   * @param {React.ChangeEvent<HTMLSelectElement>} event - Об'єкт події зміни.
   */
  const handleSortChange = (event) => {
    setSortByDate(event.target.value); // Оновлюємо стан сортування
  };

  /**
   * Обробник додавання нового коментаря.
   * Виконує оптимістичне оновлення UI (додає коментар локально одразу).
   * @param {string} articleId - ID статті, до якої додається коментар.
   * @param {object} newCommentFromForm - Об'єкт з даними нового коментаря ({ name, text }).
   */
  const handleAddComment = async (articleId, newCommentFromForm) => {
    // Перевірка авторизації перед додаванням коментаря
    if (!currentUser) {
      alert("Помилка: Ви повинні увійти, щоб додати коментар.");
      return;
    }

    // Оптимістичне оновлення: додаємо коментар до локального стану `articles`
    // ще до того, як він буде збережений в Firestore.
    setArticles(currentArticles => {
      // Проходимо по поточному списку статей
      return currentArticles.map(article => {
        // Якщо знаходимо потрібну статтю за ID
        if (article.id === articleId) {
          // Перевіряємо, чи існує масив коментарів, якщо ні - створюємо порожній
          const currentComments = Array.isArray(article.comments) ? article.comments : [];
          // Повертаємо оновлений об'єкт статті з доданим новим коментарем
          return {
            ...article,
            comments: [
                ...currentComments,
                // Додаємо дані з форми та ім'я користувача (або "Ви" якщо ім'я не вказано)
                { ...newCommentFromForm, name: newCommentFromForm.name || 'Ви' }
            ]
          };
        }
        // Якщо це не та стаття, повертаємо її без змін
        return article;
      });
    });

    // Логування для відладки (показує, що коментар додано локально)
    console.log('Коментар додано (локально, оптимістично) до статті:', articleId, newCommentFromForm);
    // TODO: В майбутньому тут потрібно викликати функцію addCommentToFirebase з firestoreService.js
    // для реального збереження коментаря в базі даних.
  };

  // Сортування масиву статей перед рендерингом
  const sortedArticles = [...articles].sort((a, b) => {
    try {
      // Перетворюємо рядкові дати (ДД.ММ.РРРР) в об'єкти Date для порівняння
      // Використовуємо optional chaining (?.) та nullish coalescing (|| 0) для безпеки
      const dateA = new Date(a.date?.split('.').reverse().join('-') || 0);
      const dateB = new Date(b.date?.split('.').reverse().join('-') || 0);
      // Якщо дати невалідні, не змінюємо порядок
      if (isNaN(dateA) || isNaN(dateB)) return 0;
      // Порівнюємо дати залежно від вибраного напрямку сортування
      return sortByDate === 'asc' ? dateA - dateB : dateB - dateA;
    } catch (e) {
      // Обробка можливих помилок при парсингу дат
      console.error("Помилка сортування за датою:", e);
      return 0; // Не змінюємо порядок у випадку помилки
    }
  });

  // Умовний рендеринг залежно від стану завантаження та помилок
  // Показуємо повідомлення про завантаження
  if (loading) {
    return <p className="loading-message">Завантаження статей...</p>;
  }

  // Показуємо повідомлення про помилку
  if (error) {
    return <p className="error-message" style={{ color: 'red' }}>{error}</p>;
  }

  // Основний рендеринг компонента
  return (
    <section id="articles" className="articles-section">
      <h2>Статті</h2>
      {/* Елементи керування сортуванням */}
      <div className="sort-controls">
        <label htmlFor="sort-date">Сортувати за датою:</label>
        <select id="sort-date" value={sortByDate} onChange={handleSortChange}>
          <option value="desc">Спочатку новіші</option>
          <option value="asc">Спочатку старіші</option>
        </select>
      </div>
      {/* Список статей */}
      <div className="articles-list">
        {/* Перевіряємо, чи є статті для відображення */}
        {sortedArticles.length > 0 ? (
          // Якщо є, проходимо по відсортованому списку та рендеримо ArticleCard для кожної
          sortedArticles.map(article => (
            <ArticleCard
              key={article.id} // Унікальний ключ для елемента списку
              article={article} // Передаємо дані статті
              handleAddComment={handleAddComment} // Передаємо функцію обробки коментарів
              isAuth={!!currentUser} // Перетворюємо currentUser в boolean (true якщо є, false якщо null) і передаємо
            />
          ))
        ) : (
          // Якщо статей немає, показуємо відповідне повідомлення
          <p>Наразі статей немає.</p>
        )}
      </div>
    </section>
  );
}

export default ArticleList;