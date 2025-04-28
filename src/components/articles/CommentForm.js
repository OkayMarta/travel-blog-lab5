import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Компонент для створення навігаційних посилань

/**
 * Компонент CommentForm рендерить форму для додавання нового коментаря до статті.
 * Він включає поля для введення імені та тексту коментаря, а також кнопку відправки.
 * Форма та її елементи блокуються, якщо користувач не авторизований.
 *
 * @param {object} props - Пропси компонента.
 * @param {string} props.articleId - ID статті, до якої додається коментар (використовується для унікальних ID полів).
 * @param {function} props.onCommentSubmit - Функція зворотного виклику, що викликається при успішній відправці форми. Передає ID статті та об'єкт з даними коментаря ({ name, text }).
 * @param {boolean} props.isAuth - Прапорець, що вказує, чи авторизований користувач. Визначає, чи активна форма.
 */
function CommentForm({ articleId, onCommentSubmit, isAuth }) {
  // Стан для зберігання імені користувача, введеного в полі
  const [name, setName] = useState('');
  // Стан для зберігання тексту коментаря, введеного в полі
  const [text, setText] = useState('');

  /**
   * Обробник відправки форми.
   * Перевіряє авторизацію користувача та заповненість полів.
   * Якщо все гаразд, викликає функцію onCommentSubmit та очищує поля форми.
   * @param {React.FormEvent<HTMLFormElement>} event - Об'єкт події відправки форми.
   */
  const handleSubmit = (event) => {
    event.preventDefault(); // Запобігаємо стандартній перезавантаженню сторінки при відправці форми

    // Перевірка №1: Чи авторизований користувач?
    if (!isAuth) {
      alert("Будь ласка, увійдіть, щоб залишати коментарі.");
      return; // Припиняємо обробку, якщо користувач не увійшов
    }

    // Перевірка №2: Чи заповнені поля імені та тексту (після видалення зайвих пробілів)?
    if (!name.trim() || !text.trim()) {
      alert('Будь ласка, заповніть ім\'я та текст коментаря.');
      return; // Припиняємо обробку, якщо поля порожні
    }

    // Викликаємо функцію, передану з батьківського компонента,
    // з ID статті та об'єктом даних коментаря
    onCommentSubmit(articleId, { name, text });

    // Очищуємо поля форми після успішної відправки
    setName('');
    setText('');
  };

  // Рендеринг компонента форми
  return (
    <form className="comment-form" onSubmit={handleSubmit}>
       {/* Умовний рендеринг: показуємо повідомлення та посилання на сторінку входу,
           якщо користувач НЕ авторизований */}
       {!isAuth && (
          <p className="auth-required-message" style={{ marginBottom: '15px', color: 'var(--color-text-secondary)' }}>
            Будь ласка, <Link to="/login" style={{ color: 'var(--color-primary)' }}>увійдіть</Link>, щоб залишити коментар.
          </p>
       )}

      {/* Група для поля введення імені */}
      <div className="form-group">
        {/* Мітка поля, пов'язана з input через htmlFor та id */}
        <label htmlFor={`comment-name-${articleId}`}>Ваше ім'я:</label>
        <input
          type="text"
          // Генеруємо унікальний ID для поля, використовуючи articleId
          id={`comment-name-${articleId}`}
          className="comment-name-input"
          placeholder="Ваше ім'я"
          value={name} // Значення поля контролюється станом `name`
          onChange={(e) => setName(e.target.value)} // Оновлюємо стан при зміні значення
          required // Поле є обов'язковим для заповнення (валідація браузера)
          disabled={!isAuth} // Блокуємо поле, якщо користувач не авторизований
        />
      </div>

      {/* Група для поля введення тексту коментаря */}
      <div className="form-group">
        <label htmlFor={`comment-text-${articleId}`}>Ваш коментар:</label>
        <textarea
          id={`comment-text-${articleId}`}
          className="comment-text-input"
          placeholder="Ваш коментар"
          value={text} // Значення поля контролюється станом `text`
          onChange={(e) => setText(e.target.value)} // Оновлюємо стан при зміні значення
          required // Поле є обов'язковим
          rows="3" // Початкова кількість видимих рядків
          disabled={!isAuth} // Блокуємо поле, якщо користувач не авторизований
        ></textarea>
      </div>

      {/* Кнопка відправки форми */}
      <button
          type="submit"
          className="submit-comment-btn"
          disabled={!isAuth} // Блокуємо кнопку, якщо користувач не авторизований
          // Додаємо підказку, яка з'являється при наведенні на заблоковану кнопку
          title={!isAuth ? "Потрібно увійти в систему" : ""}
      >
          Надіслати
      </button>
    </form>
  );
}

export default CommentForm;