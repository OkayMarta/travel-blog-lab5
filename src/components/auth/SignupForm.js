import React, { useState } from 'react'; // Імпортуємо функцію Firebase для створення нового користувача з email та паролем
import { createUserWithEmailAndPassword } from 'firebase/auth'; // Імпортуємо об'єкт `auth` з конфігурації Firebase
import { auth } from '../../firebase/config'; // Імпортуємо хук для навігації та компонент Link для посилань
import { useNavigate, Link } from 'react-router-dom';

/**
 * Компонент SignupForm відображає форму для реєстрації нового користувача
 * за допомогою email та пароля.
 */
function SignupForm() {
  const [email, setEmail] = useState(''); // Стан для зберігання введеного email
  const [password, setPassword] = useState(''); // Стан для зберігання введеного пароля
  const [error, setError] = useState(null); // Стан для зберігання повідомлень про помилки під час реєстрації
  const [loading, setLoading] = useState(false); // Стан для відстеження процесу реєстрації (для блокування кнопки)
  const navigate = useNavigate(); // Хук для програмної навігації після успішної реєстрації

  /**
   * Асинхронний обробник відправки форми реєстрації.
   * Викликає Firebase `createUserWithEmailAndPassword` для створення нового користувача.
   * Обробляє можливі помилки та перенаправляє на головну сторінку у разі успіху.
   * @param {React.FormEvent<HTMLFormElement>} event - Об'єкт події відправки форми.
   */
  const handleSignup = async (event) => {
    event.preventDefault(); // Запобігаємо стандартній поведінці форми
    setError(null); // Скидаємо попередні помилки
    setLoading(true); // Починаємо процес реєстрації

    try {
      // Викликаємо функцію Firebase для створення користувача
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Логуємо успішне створення користувача (для відладки)
      console.log("Користувача створено успішно:", userCredential.user);
      // Перенаправляємо користувача на головну сторінку
      navigate('/');
    } catch (err) {
      // Обробляємо помилки реєстрації
      console.error("Помилка реєстрації:", err);
       // Перевіряємо код помилки Firebase для надання більш конкретних повідомлень
      if (err.code === 'auth/email-already-in-use') {
          setError('Цей email вже використовується.');
      } else if (err.code === 'auth/weak-password') {
          setError('Пароль занадто слабкий (потрібно щонайменше 6 символів).');
      } else {
          // Якщо помилка невідома, показуємо загальне повідомлення
          setError('Не вдалося зареєструватися. Спробуйте ще раз.');
      }
    } finally {
      // Завершуємо процес реєстрації незалежно від результату
      setLoading(false);
    }
  };

   /**
    * Тимчасова функція-заглушка для обробки реєстрації/входу через Google.
    * На даний момент показує сповіщення про нереалізований функціонал.
    */
   const handleGoogleSignIn = () => {
      alert("Вхід через Google ще не реалізовано.");
      // TODO: Додати реальну логіку Firebase Google Sign-In.
  };

  // Рендеринг форми
  return (
    // Додаємо клас для стилізації та обробник onSubmit
    <form onSubmit={handleSignup} className="auth-form">
      <h3>Реєстрація</h3> {/* Заголовок форми */}

      {/* Група для поля Email */}
      <div className="form-group">
        <label htmlFor="signup-email">Email</label>
        <input
          type="email"
          id="signup-email" // ID для зв'язку з label
          value={email} // Контрольований компонент
          onChange={(e) => setEmail(e.target.value)} // Оновлення стану email
          required // Обов'язкове поле
          placeholder="Ваш email" // Підказка у полі
          className="auth-input" // Клас для стилізації
        />
      </div>

      {/* Група для поля Пароль */}
      <div className="form-group">
        <label htmlFor="signup-password">Пароль</label>
        <input
          type="password"
          id="signup-password"
          value={password} // Контрольований компонент
          onChange={(e) => setPassword(e.target.value)} // Оновлення стану пароля
          required // Обов'язкове поле
          minLength="6" // Мінімальна довжина пароля (валідація браузера)
          placeholder="Мінімум 6 символів" // Підказка щодо вимог до пароля
          className="auth-input"
        />
      </div>

      {/* Відображення повідомлення про помилку, якщо воно є */}
      {error && <p className="auth-error">{error}</p>}

      {/* Кнопка відправки форми */}
      <button type="submit" disabled={loading} className="auth-button">
        {/* Зміна тексту кнопки залежно від стану завантаження */}
        {loading ? 'Реєстрація...' : 'Зареєструватися'}
      </button>

      {/* Посилання для переходу на сторінку входу, якщо користувач вже має акаунт */}
      <p className="auth-switch-link">
        Вже є акаунт? <Link to="/login">Увійти</Link>
      </p>

      {/* Роздільник та кнопка Google Sign-In (поки що неактивна) */}
      {/*
      <div className="auth-separator">або</div>
      <button type="button" onClick={handleGoogleSignIn} className="google-signin-button">
          <span className="google-icon"></span> Зареєструватися через Google
      </button>
      */}
    </form>
  );
}

export default SignupForm;