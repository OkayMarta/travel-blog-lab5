import React from 'react';
import SignupForm from '../../components/auth/SignupForm'; // Імпортуємо компонент форми реєстрації, який містить логіку та поля форми

/**
 * Компонент SignupPage представляє собою сторінку реєстрації нового користувача.
 * Основне завдання цієї сторінки - відобразити форму реєстрації (`SignupForm`).
 */
function SignupPage() {
  return (
    // Використовуємо div-контейнер з класом `auth-page-container`
    // для застосування загальних стилів (наприклад, центрування, фон, тінь),
    // визначених у файлі `AuthPage.css` або `index.css`.
    <div className="auth-page-container">
      {/* Вставляємо та рендеримо компонент форми реєстрації */}
      <SignupForm />
    </div>
  );
}

// Експортуємо компонент SignupPage для використання в системі маршрутизації (роутингу)
export default SignupPage;