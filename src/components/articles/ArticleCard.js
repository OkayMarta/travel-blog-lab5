import React, { useState } from 'react';
import CommentForm from './CommentForm'; // Компонент форми для додавання коментарів
import CommentList from './CommentList'; // Компонент для відображення списку коментарів
import { useAuth } from '../../context/AuthContext'; // Хук для доступу до даних автентифікації

/**
 * Компонент ArticleCard відображає одну картку статті.
 * Включає заголовок, дату, кнопку "Подобається", контент (що розгортається),
 * та секцію коментарів.
 *
 * @param {object} props - Пропси компонента.
 * @param {object} props.article - Об'єкт статті з даними (id, title, date, image, text, comments, initialLikes).
 * @param {function} props.handleAddComment - Функція для обробки додавання нового коментаря (передається з батьківського компонента).
 * @param {boolean} props.isAuth - Прапорець, що вказує, чи авторизований користувач.
 */
function ArticleCard({ article, handleAddComment, isAuth }) {
  // Отримуємо інформацію про поточного користувача з контексту
  const { currentUser } = useAuth();

  // Локальний стан для керування кількістю лайків
  const [likes, setLikes] = useState(article.initialLikes || 0);
  // Локальний стан для відстеження, чи лайкнув поточний користувач статтю
  const [isLiked, setIsLiked] = useState(false);
  // Локальний стан для керування розгортанням/згортанням контенту статті
  const [isExpanded, setIsExpanded] = useState(false);

  /**
   * Обробник кліку на кнопку "Подобається".
   * Перевіряє авторизацію користувача та оновлює локальний стан лайків.
   */
  const handleLikeClick = () => {
    // Перевірка: тільки авторизовані користувачі можуть ставити лайки
    if (!currentUser) {
      alert("Будь ласка, увійдіть в систему, щоб ставити лайки.");
      return; // Припиняємо виконання функції
    }

    // Оновлення локального стану лайків (без збереження на сервері на даному етапі)
    if (isLiked) {
      setLikes(likes - 1); // Зменшуємо кількість лайків
    } else {
      setLikes(likes + 1); // Збільшуємо кількість лайків
    }
    setIsLiked(!isLiked); // Перемикаємо стан "лайкнуто" / "не лайкнуто"

    // TODO: В майбутньому тут потрібно додати виклик функції для збереження лайка в Firestore.
  };

  /**
   * Обробник кліку на картку статті для розгортання/згортання контенту.
   * Запобігає розгортанню при кліку на інтерактивні елементи (кнопка лайку, форма коментарів).
   * @param {React.SyntheticEvent} event - Об'єкт події кліку.
   */
  const handleToggleExpand = (event) => {
    // Ігноруємо кліки на кнопку "Подобається" та елементи форми коментарів, щоб вони не розгортали статтю
    if (event.target.closest('.like-btn') || event.target.closest('.comment-form')) {
      return;
    }
    // Запобігаємо стандартній поведінці посилання в заголовку (перехід по #) при кліку для розгортання
    if (event.target.tagName === 'A' && event.target.closest('.publication-title')) {
      event.preventDefault();
    }
    // Перемикаємо стан розгортання
    setIsExpanded(!isExpanded);
  };

  // Формування рядка CSS-класів для картки на основі її стану
  const articleClasses = [
    'article-item', // Базовий клас
    isExpanded ? 'article-item--expanded' : '', // Клас для розгорнутої статті
    isLiked ? 'article-item--liked' : '' // Клас для лайкнутої статті
  ].filter(Boolean).join(' '); // Фільтруємо порожні рядки та об'єднуємо

  // Рендеринг компонента
  return (
    // Вішаємо обробник розгортання на весь елемент <article>
    <article id={article.id} className={articleClasses} onClick={handleToggleExpand}>
      {/* Шапка статті */}
      <div className="publication-header">
        <h3 className="publication-title">
          {/* Посилання-якір для навігації, але його дія приглушується в handleToggleExpand */}
          <a href={`#${article.id}`}>{article.title}</a>
        </h3>
        <p className="publication-date">{article.date}</p>
        {/* Контейнер для кнопок дій */}
        <div className="publication-actions">
          {/* Кнопка "Подобається" */}
          <button
            className={`like-btn ${isLiked ? 'liked' : ''}`} // Динамічні класи для стилізації стану "лайкнуто"
            data-article-id={article.id} // Зберігаємо ID статті (може знадобитись для запитів)
            onClick={handleLikeClick} // Обробник кліку
            disabled={!currentUser} // Блокуємо кнопку, якщо користувач не авторизований
            title={!currentUser ? "Увійдіть, щоб ставити лайки" : ""} // Підказка для заблокованої кнопки
          >
            {/* Текст кнопки змінюється залежно від стану isLiked */}
            {isLiked ? 'Вподобано' : 'Подобається'} ({likes}) {/* Показуємо кількість лайків */}
          </button>
        </div>
      </div>

      {/* Основний контент статті (прихований за замовчуванням) */}
      <div className="publication-content">
        {/* Зображення статті */}
        <div className="publication-image">
          <img src={process.env.PUBLIC_URL + article.image} alt={article.alt || article.title} />
        </div>
        {/* Текст статті */}
        <div className="publication-text">
          {/* Рендеримо параграфи тексту */}
          {article.text.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
           {/* Посилання-кнопка для згортання/розгортання (дублює функціонал кліку на шапку) */}
           <a href="#toggle" className="collapse-btn">
              {isExpanded ? 'Згорнути' : 'Розгорнути'}
          </a>
        </div>
      </div>

      {/* Секція коментарів (прихована за замовчуванням) */}
      <div className="comment-section">
        <h4>Коментарі</h4>
        {/* Форма додавання коментаря */}
        <CommentForm
            articleId={article.id} // Передаємо ID статті
            onCommentSubmit={handleAddComment} // Передаємо функцію обробки
            isAuth={isAuth} // Передаємо статус авторизації
        />
        {/* Список коментарів */}
        <CommentList comments={article.comments} /> {/* Передаємо масив коментарів */}
      </div>
    </article>
  );
}

export default ArticleCard;