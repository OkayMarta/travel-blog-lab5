import React from 'react';
import LoginForm from '../../components/auth/LoginForm'; // Імпортуємо компонент форми входу, який містить логіку та поля форми

/**
 * Компонент LoginPage представляє собою сторінку входу користувача.
 * Основне завдання цієї сторінки - відобразити форму входу (`LoginForm`).
 */
function LoginPage() {
  return (
    // Використовуємо div-контейнер з класом `auth-page-container`
    // для застосування загальних стилів (наприклад, центрування, фон, тінь),
    // визначених у файлі `AuthPage.css` або `index.css`.
    <div className="auth-page-container">
      {/* Вставляємо та рендеримо компонент форми входу */}
      <LoginForm />
    </div>
  );
}

// Експортуємо компонент LoginPage для використання в системі маршрутизації (роутингу)
export default LoginPage;