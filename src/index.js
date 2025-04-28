import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Імпортуємо основний файл стилів для всього додатку
import App from './App'; // Імпортуємо головний компонент додатку
import { AuthProvider } from './context/AuthContext'; // Імпортуємо компонент-провайдер контексту автентифікації

// Знаходимо кореневий DOM-елемент, куди буде вбудовано React-додаток
// (зазвичай це <div id="root"></div> в public/index.html)
const rootElement = document.getElementById('root');

// Створюємо кореневий вузол React для рендерингу додатку
const root = ReactDOM.createRoot(rootElement);

// Рендеримо додаток у кореневий вузол
root.render(
  // <React.StrictMode> - компонент, що активує додаткові перевірки та попередження для розробки.
  // Він не впливає на продакшн-збірку.
  <React.StrictMode>
    {/* Огортаємо весь додаток (<App />) у AuthProvider. */}
    {/* Це робить дані контексту автентифікації (currentUser) доступними */}
    {/* для всіх компонентів всередині <App /> через хук `useAuth()`. */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);