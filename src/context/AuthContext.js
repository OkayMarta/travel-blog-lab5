import React, { createContext, useState, useEffect, useContext } from 'react'; // Функція Firebase для відстеження змін стану автентифікації користувача
import { onAuthStateChanged } from 'firebase/auth'; // Об'єкт `auth` з конфігурації Firebase
import { auth } from '../firebase/config';

// 1. Створення об'єкта Контексту (AuthContext)
// Цей об'єкт буде містити дані про стан автентифікації та методи для роботи з ним.
const AuthContext = createContext();

// 2. Створення кастомного хука `useAuth`
// Цей хук спрощує доступ до даних контексту в компонентах.
// Замість `useContext(AuthContext)` можна буде просто викликати `useAuth()`.
export function useAuth() {
  return useContext(AuthContext);
}

// 3. Створення компонента-Провайдера (AuthProvider)
/**
 * Компонент AuthProvider відповідає за:
 * - Відстеження стану автентифікації користувача за допомогою Firebase `onAuthStateChanged`.
 * - Зберігання інформації про поточного користувача (`currentUser`) у стані.
 * - Надання доступу до `currentUser` всім дочірнім компонентам через React Context API.
 * - Забезпечення того, що дочірні компоненти рендеряться лише після завершення
 *   початкової перевірки стану автентифікації.
 *
 * @param {object} props - Пропси компонента.
 * @param {React.ReactNode} props.children - Дочірні компоненти, які будуть обгорнуті провайдером.
 */
export function AuthProvider({ children }) {
  // Стан для зберігання об'єкта поточного автентифікованого користувача.
  // Початкове значення `null` означає, що користувач не увійшов.
  const [currentUser, setCurrentUser] = useState(null);

  // Стан для відстеження процесу початкової перевірки стану автентифікації.
  // `true` - перевірка триває, `false` - перевірка завершена.
  const [loading, setLoading] = useState(true);

  // useEffect для підписки на зміни стану автентифікації при монтуванні компонента
  useEffect(() => {
    // `onAuthStateChanged` - це слухач Firebase, який спрацьовує щоразу,
    // коли користувач входить, виходить або при початковому завантаженні програми.
    // Він повертає функцію `unsubscribe` для відписки від слухача.
    const unsubscribe = onAuthStateChanged(auth, user => {
      // Коли слухач спрацьовує, він передає об'єкт `user` (якщо користувач увійшов)
      // або `null` (якщо користувач вийшов).

      // Логування зміни стану для відладки
      console.log("Стан автентифікації змінився! Поточний користувач:", user ? user.email : null);

      // Оновлюємо стан `currentUser` отриманим значенням `user`
      setCurrentUser(user);
      // Встановлюємо `loading` в `false`, оскільки початкова перевірка завершена.
      setLoading(false);
    });

    // Функція очищення useEffect: викликається при розмонтуванні компонента AuthProvider.
    // Відписуємося від слухача `onAuthStateChanged`, щоб уникнути витоків пам'яті.
    return unsubscribe;
  }, []); // Порожній масив залежностей гарантує, що ефект запуститься лише один раз при монтуванні.

  // Об'єкт `value`, який буде переданий через контекст.
  // Він містить дані, до яких матимуть доступ дочірні компоненти.
  const value = {
    currentUser, // Поточний користувач (об'єкт User або null)
    // Сюди можна додати інші значення або функції, наприклад, login, logout, signup,
    // якщо вони будуть реалізовані на рівні контексту.
  };

  // Повертаємо компонент Provider з AuthContext.
  // Передаємо об'єкт `value` у пропс `value`.
  // Рендеримо дочірні компоненти (`children`) тільки тоді, коли `loading` стає `false`.
  // Це запобігає рендерингу решти програми до того, як буде відомий точний стан автентифікації.
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}