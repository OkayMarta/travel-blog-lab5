import React from 'react';

/**
 * Компонент для відображення списку коментарів до статті.
 *
 * @param {object} props - Пропси компонента.
 * @param {Array<object>} props.comments - Масив об'єктів коментарів.
 *                                        Кожен об'єкт повинен мати властивості 'name' (необов'язково) та 'text'.
 */
function CommentList({ comments }) {
  // 1. Фільтруємо масив `comments`, щоб переконатися, що працюємо тільки з валідними даними.
  // Залишаємо тільки ті елементи, які:
  // - є об'єктами (виключаємо null, undefined, примітиви)
  // - мають властивість 'text', і ця властивість не є порожнім рядком після видалення пробілів.
  const validComments = Array.isArray(comments)
    ? comments.filter(comment => comment && typeof comment === 'object' && comment.text && String(comment.text).trim() !== '')
    : []; // Якщо `comments` не є масивом (наприклад, undefined), ініціалізуємо порожнім масивом.

  // 2. Перевіряємо, чи залишилися валідні коментарі після фільтрації.
  if (validComments.length === 0) {
    // Якщо валідних коментарів немає, відображаємо відповідне повідомлення.
    return <p>Коментарів ще немає.</p>;
  }

  // 3. Рендеримо список тільки з валідних коментарів.
  return (
    <div className="comments-list">
      {validComments.map((comment, index) => (
        // Використовуємо `index` як ключ (`key`).
        // ВАЖЛИВО: Якщо коментарі отримуватимуть унікальний ID з бекенду (наприклад, `comment.id`),
        // краще використовувати його як ключ для кращої продуктивності та стабільності: `key={comment.id}`.
        <div className="comment-item" key={index}>
          {/* Відображаємо ім'я коментатора або "Анонім", якщо ім'я відсутнє */}
          <p className="comment-author">{comment.name || 'Анонім'}</p>
          {/* Відображаємо текст коментаря */}
          <p className="comment-text">{comment.text}</p>
        </div>
      ))}
    </div>
  );
}

export default CommentList;