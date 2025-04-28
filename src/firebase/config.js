// Імпортуємо необхідні функції з Firebase SDK
import { initializeApp } from "firebase/app"; // Функція для ініціалізації Firebase додатку
import { getAuth } from "firebase/auth";     // Функція для отримання сервісу автентифікації
import { getFirestore } from "firebase/firestore"; // Функція для отримання сервісу Firestore (бази даних)

// Об'єкт конфігурації Firebase.
// Значення завантажуються з змінних середовища (з файлу .env),
// які повинні починатися з префіксу REACT_APP_ за конвенцією Create React App.
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Важлива перевірка: переконуємося, що ключові змінні конфігурації завантажились.
// Це допомагає виявити проблеми з .env файлом на ранньому етапі.
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  // Виводимо повідомлення про помилку в консоль розробника
  console.error("Змінні конфігурації Firebase відсутні! Переконайтеся, що у вас є файл .env та він завантажений коректно.");
  // Генеруємо помилку, щоб зупинити виконання скрипту,
  // оскільки без конфігурації Firebase працювати не буде.
  throw new Error("Конфігурація Firebase відсутня.");
}

// Ініціалізація додатку Firebase з отриманою конфігурацією.
// Це створює екземпляр нашого Firebase проекту в коді.
const app = initializeApp(firebaseConfig);

// Отримання екземпляра сервісу автентифікації Firebase для нашого додатку.
// `auth` буде використовуватися для реєстрації, входу, виходу та керування користувачами.
const auth = getAuth(app);

// Отримання екземпляра сервісу Firestore для нашого додатку.
// `db` буде використовуватися для взаємодії з базою даних Firestore (читання, запис даних).
const db = getFirestore(app);

// Експортуємо ініціалізовані сервіси `auth` та `db`,
// щоб їх можна було імпортувати та використовувати в інших частинах додатку
// (наприклад, у сервісах для роботи з Firestore, компонентах автентифікації тощо).
export { auth, db };