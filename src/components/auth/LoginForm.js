import React, { useState } from 'react'; // Імпортуємо функцію Firebase для входу за допомогою email та пароля
import { signInWithEmailAndPassword } from 'firebase/auth'; // Імпортуємо об'єкт `auth` з конфігурації Firebase
import { auth } from '../../firebase/config'; // Імпортуємо хук для навігації та компонент Link для посилань
import { useNavigate, Link } from 'react-router-dom';

/**
 * Компонент LoginForm відображає форму для входу користувача
 * за допомогою email та пароля.
 */
function LoginForm() {
  const [email, setEmail] = useState(''); // Стан для зберігання введеного email
  const [password, setPassword] = useState(''); // Стан для зберігання введеного пароля
  const [error, setError] = useState(null); // Стан для зберігання повідомлень про помилки під час входу
  const [loading, setLoading] = useState(false); // Стан для відстеження процесу входу (для блокування кнопки)
  const navigate = useNavigate(); // Хук для програмної навігації після успішного входу

  /**
   * Асинхронний обробник відправки форми входу.
   * Викликає Firebase `signInWithEmailAndPassword` для автентифікації користувача.
   * Обробляє можливі помилки та перенаправляє на головну сторінку у разі успіху.
   * @param {React.FormEvent<HTMLFormElement>} event - Об'єкт події відправки форми.
   */
  const handleLogin = async (event) => {
    event.preventDefault(); // Запобігаємо стандартній поведінці форми
    setError(null); // Скидаємо попередні помилки
    setLoading(true); // Починаємо процес входу

    try {
      // Викликаємо функцію Firebase для входу
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Логуємо успішний вхід (для відладки)
      console.log("Користувач успішно увійшов:", userCredential.user);
      // Перенаправляємо користувача на головну сторінку
      navigate('/');
    } catch (err) {
      // Обробляємо помилки автентифікації
      console.error("Помилка входу:", err);
      // Перевіряємо код помилки Firebase для надання більш конкретного повідомлення
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
         setError('Невірний email або пароль.');
      } else {
         // Якщо помилка невідома, показуємо загальне повідомлення
         setError('Не вдалося увійти. Перевірте дані та спробуйте ще раз.');
      }
    } finally {
      // Завершуємо процес входу незалежно від результату
      setLoading(false);
    }
  };

  /**
   * Тимчасова функція-заглушка для обробки входу через Google.
   * На даний момент показує сповіщення про нереалізований функціонал.
   */
  const handleGoogleSignIn = () => {
      alert("Вхід через Google ще не реалізовано.");
      // TODO: Додати реальну логіку Firebase Google Sign-In.
  };

  // Рендеринг форми
  return (
    // Додаємо клас для стилізації та обробник onSubmit
    <form onSubmit={handleLogin} className="auth-form">
      <h3>Вхід</h3> {/* Заголовок форми */}

      {/* Група для поля Email */}
      <div className="form-group">
        <label htmlFor="login-email">Email</label>
        <input
          type="email"
          id="login-email" // ID для зв'язку з label
          value={email} // Контрольований компонент
          onChange={(e) => setEmail(e.target.value)} // Оновлення стану email
          required // Обов'язкове поле
          placeholder="Ваш email" // Підказка у полі
          className="auth-input" // Клас для стилізації
        />
      </div>

      {/* Група для поля Пароль */}
      <div className="form-group">
        <label htmlFor="login-password">Пароль</label>
        <input
          type="password"
          id="login-password"
          value={password} // Контрольований компонент
          onChange={(e) => setPassword(e.target.value)} // Оновлення стану пароля
          required // Обов'язкове поле
          placeholder="Ваш пароль" // Підказка у полі
          className="auth-input"
        />
      </div>

      {/* Відображення повідомлення про помилку, якщо воно є */}
      {error && <p className="auth-error">{error}</p>}

      {/* Кнопка відправки форми */}
      <button type="submit" disabled={loading} className="auth-button">
        {/* Зміна тексту кнопки залежно від стану завантаження */}
        {loading ? 'Вхід...' : 'Увійти'}
      </button>

      {/* Посилання для переходу на сторінку реєстрації */}
      <p className="auth-switch-link">
        Немає акаунту? <Link to="/signup">Зареєструватися</Link>
      </p>

      {/* Роздільник та кнопка Google Sign-In (поки що неактивна) */}
      {/*
      <div className="auth-separator">або</div>
      <button type="button" onClick={handleGoogleSignIn} className="google-signin-button">
          <span className="google-icon"></span> Увійти через Google
      </button>
      */}
    </form>
  );
}

export default LoginForm;