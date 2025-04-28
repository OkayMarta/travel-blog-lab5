import React, { useState, useEffect, useRef } from 'react'; // Компоненти NavLink (для стилізації активного посилання) та Link з react-router-dom
import { NavLink, useNavigate } from 'react-router-dom'; // Хук для доступу до даних автентифікації
import { useAuth } from '../../context/AuthContext'; // Функція Firebase для виходу з системи
import { signOut } from 'firebase/auth'; // Об'єкт `auth` з конфігурації Firebase
import { auth } from '../../firebase/config';

/**
 * Компонент Navigation відповідає за відображення навігаційного меню сайту.
 * Він адаптується до різних розмірів екрану, показуючи стандартне меню
 * на десктопах та меню-гамбургер на мобільних пристроях.
 * Також відображає різні пункти меню залежно від статусу автентифікації користувача.
 */
function Navigation() {
  const { currentUser } = useAuth(); // Отримуємо поточного користувача з контексту
  const navigate = useNavigate(); // Хук для навігації
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Стан для контролю видимості мобільного меню (гамбургера)
  const navRef = useRef(null); // Ref для доступу до DOM-елемента навігації (<nav>) - використовується для закриття меню при кліку поза ним

  /**
   * Функція для визначення CSS-класу активного посилання NavLink.
   * @param {object} props - Пропси, що передаються NavLink.
   * @param {boolean} props.isActive - Прапорець, що вказує, чи активне посилання.
   * @returns {string} - Повертає клас 'active' для активного посилання, інакше порожній рядок.
   */
  const getNavLinkClass = ({ isActive }) => {
    return isActive ? 'active' : '';
  };

  /**
   * Перемикає стан видимості мобільного меню (відкриває/закриває).
   */
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  /**
   * Обробник кліку миші на документі.
   * Закриває мобільне меню, якщо клік відбувся поза елементом навігації.
   * @param {MouseEvent} event - Об'єкт події кліку миші.
   */
  const handleClickOutside = (event) => {
      // Перевіряємо, чи існує navRef.current, чи клік був не всередині <nav> і чи меню відкрите
      if (navRef.current && !navRef.current.contains(event.target) && isMobileMenuOpen) {
          // Якщо всі умови виконані, закриваємо меню
          setIsMobileMenuOpen(false);
      }
  };

  /**
   * Обробник кліку на посилання NavLink.
   * Закриває мобільне меню при кліку на посилання, якщо воно відкрите (тільки на мобільних).
   */
  const handleNavLinkClick = () => {
      // Перевіряємо ширину вікна, щоб дія виконувалась тільки на мобільних пристроях
      if (window.innerWidth <= 768) {
          setIsMobileMenuOpen(false);
      }
  };

  /**
   * Асинхронний обробник для виходу користувача з системи.
   * Викликає Firebase `signOut`, закриває мобільне меню та перенаправляє на головну сторінку.
   */
  const handleLogout = async () => {
    try {
      // Викликаємо функцію Firebase для виходу
      await signOut(auth);
      console.log("Користувач успішно вийшов");
      // Закриваємо мобільне меню (якщо воно було відкрите)
      setIsMobileMenuOpen(false);
      // Перенаправляємо на головну сторінку
      navigate('/');
    } catch (error) {
      // Обробляємо можливі помилки при виході
      console.error("Помилка виходу:", error);
    }
  };

  // Ефект для додавання та видалення слухачів подій
  useEffect(() => {
    /**
     * Обробник зміни розміру вікна браузера.
     * Автоматично закриває мобільне меню при переході до десктопної версії.
     */
    const handleResize = () => {
      // Якщо ширина вікна стала більшою за 768px (умовна межа моб. версії)
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false); // Закриваємо меню
      }
    };

    // Додаємо слухач зміни розміру вікна
    window.addEventListener('resize', handleResize);
    // Додаємо слухач кліку миші на весь документ для закриття меню при кліку поза ним
    document.addEventListener('mousedown', handleClickOutside);

    // Функція очищення, яка викликається при розмонтуванні компонента
    return () => {
        // Видаляємо слухачі, щоб уникнути витоків пам'яті
        window.removeEventListener('resize', handleResize);
        document.removeEventListener('mousedown', handleClickOutside);
    };
  // Залежність `isMobileMenuOpen` потрібна для `handleClickOutside`,
  // щоб він коректно працював зі станом меню.
  }, [isMobileMenuOpen]);

  // Рендеринг компонента навігації
  return (
    // Прив'язуємо ref до DOM-елемента <nav>
    <nav className="navigation" ref={navRef}>
      {/* Кнопка-гамбургер для мобільної версії */}
      <button
         // Динамічно додаємо клас 'open' для анімації кнопки в хрестик
         className={`hamburger-button ${isMobileMenuOpen ? 'open' : ''}`}
         onClick={toggleMobileMenu} // Обробник кліку для відкриття/закриття меню
         aria-label="Toggle navigation" // Атрибут доступності: опис кнопки
         aria-expanded={isMobileMenuOpen} // Атрибут доступності: вказує, чи розгорнуто меню
      >
        {/* Три лінії гамбургера */}
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Список посилань навігації */}
      {/* Динамічно додаємо клас 'open' для показу/приховування та анімації випадаючого меню */}
      <ul className={isMobileMenuOpen ? 'open' : ''}>
         {/* Група основних навігаційних посилань */}
         <div className="nav-group-main">
            {/* Використовуємо NavLink для автоматичної стилізації активного посилання */}
            <li><NavLink to="/" className={getNavLinkClass} onClick={handleNavLinkClick}>Головна</NavLink></li>
            <li><NavLink to="/publications" className={getNavLinkClass} onClick={handleNavLinkClick}>Публікації</NavLink></li>
            <li><NavLink to="/articles" className={getNavLinkClass} onClick={handleNavLinkClick}>Статті</NavLink></li>
         </div>

        {/* Група посилань/елементів, пов'язаних з автентифікацією */}
        <div className="nav-group-auth">
          {/* Умовний рендеринг: показуємо різні елементи залежно від того, чи увійшов користувач */}
          {currentUser ? (
            // Якщо користувач увійшов:
            <>
              {/* Привітання користувача */}
              <li className="user-greeting" style={{ color: 'var(--color-text-secondary)' }}>
                {/* Виводимо email користувача */}
                Привіт, {currentUser.email}!
              </li>
              {/* Кнопка виходу */}
              <li>
                <button onClick={handleLogout} className="nav-button logout-button">
                  Вийти
                </button>
              </li>
            </>
          ) : (
            // Якщо користувач не увійшов:
            <>
              {/* Посилання на сторінку входу */}
              <li><NavLink to="/login" className={getNavLinkClass} onClick={handleNavLinkClick}>Увійти</NavLink></li>
              {/* Посилання на сторінку реєстрації */}
              <li><NavLink to="/signup" className={getNavLinkClass} onClick={handleNavLinkClick}>Зареєструватися</NavLink></li>
            </>
          )}
        </div>
      </ul>
    </nav>
  );
}

export default Navigation;