# 🌍 Мій Блог про Подорожі (travel-blog-lab5)

Це мій навчальний проект - блог про подорожі, створений за допомогою React. Він дозволяє переглядати статті, публікації, а зареєстрованим користувачам - залишати коментарі та ставити "лайки" статтям.

## 🚀 Жива Версія (Live Demo)

Ви можете переглянути розгорнутий проект тут:
**[https://6839b70f8942b97d140307a3--travel-blog-lab5.netlify.app/](https://6839b70f8942b97d140307a3--travel-blog-lab5.netlify.app/)**

## 📸 Скріншот Головної Сторінки
[Головна сторінка блогу](screenshots/images/screenshot-main.png)

## ✨ Особливості (Features)

*   **Перегляд статей:** Динамічно завантажувані статті з бази даних Firestore.
*   **Аутентифікація користувачів:** Реєстрація та вхід за допомогою Firebase Authentication (email/пароль).
*   **Система "лайків":** Авторизовані користувачі можуть ставити та знімати "лайки" статтям. Кількість лайків оновлюється в реальному часі.
*   **Додавання коментарів:** Авторизовані користувачі можуть залишати коментарі до статей.
*   **Сортування статей:** Можливість сортувати статті за датою (новіші/старіші).
*   **Адаптивна навігація:** Меню адаптується для зручного використання на мобільних пристроях та десктопах.
*   **Статичні сторінки:**
    *   "Про мене" (Головна) - з інформацією про автора та планами на майбутні подорожі.
    *   "Публікації" - з прикладами фото-публікацій.
*   **Взаємодія з API:** Бекенд на Node.js/Express для обробки лайків та коментарів, інтегрований з Firebase Admin SDK.

## 🛠️ Технологічний Стек (Tech Stack)

### Фронтенд:
*   **React (v19)**: JavaScript бібліотека для побудови користувацьких інтерфейсів.
    *   **React Router (v7)**: Для маршрутизації на стороні клієнта.
    *   **React Context API**: Для управління станом автентифікації.
*   **CSS**: Кастомні стилі для візуального оформлення (без використання UI бібліотек).
*   **ESLint**: Для підтримки якості коду.

### Бекенд та База Даних:
*   **Firebase Authentication**: Для управління автентифікацією користувачів.
*   **Firebase Firestore**: NoSQL база даних для зберігання статей, коментарів та інформації про лайки користувачів.
*   **Node.js + Express.js**: Для створення REST API (ендпоінти для лайків та коментарів).
*   **Firebase Admin SDK**: Для взаємодії з сервісами Firebase з боку сервера (в Node.js/Express додатку).

### Розгортання (Deployment):
*   **Netlify**: Для хостингу та розгортання фронтенд React-додатку.
*   **Render**: Для хостингу та розгортання бекенд Node.js/Express API.

## 📁 Структура Проекту (Основні Директорії)

```
travel-blog-lab5/
├── backend/ # Код Node.js/Express серверу
│ ├── .env # Змінні середовища для бекенду
│ ├── package.json
│ ├── server.js # Головний файл серверу
│ └── serviceAccountKey.json # Ключ для Firebase Admin SDK (має бути в .gitignore!)
├── public/ # Статичні файли для React-додатку
│ ├── images/
│ └── index.html
├── src/ # Вихідний код React-додатку
│ ├── App.js # Головний компонент додатку
│ ├── index.js # Точка входу React-додатку
│ ├── index.css # Глобальні стилі
│ ├── components/ # Перевикористовувані UI компоненти
│ │ ├── articles/
│ │ ├── auth/
│ │ └── layout/
│ ├── context/ # React Context (AuthContext)
│ ├── firebase/ # Конфігурація та сервіси Firebase (config.js, firestoreService.js)
│ └── pages/ # Компоненти сторінок
├── .env # Змінні середовища для фронтенду (Firebase ключі)
├── package.json # Залежності та скрипти для фронтенду
└── README.md # Цей файл
```


## ⚙️ Встановлення та Запуск Локально (Setup and Local Run)

### Передумови:
*   Node.js (версія 16+ рекомендована)
*   npm (зазвичай встановлюється разом з Node.js)
*   Firebase акаунт та створений проект з налаштованими Authentication та Firestore.

### Кроки для Фронтенду:
1.  **Клонуйте репозиторій:**
    ```bash
    git clone https://github.com/OkayMarta/travel-blog-lab5.git
    ```
2.  **Перейдіть у директорію проекту:**
    ```bash
    cd travel-blog-lab5
    ```
3.  **Встановіть залежності:**
    ```bash
    npm install
    ```
4.  **Створіть файл `.env`** у корені проекту (`travel-blog-lab5/.env`) та додайте ваші Firebase конфігураційні ключі та URL бекенду:
    ```env
    REACT_APP_FIREBASE_API_KEY=ВАШ_API_KEY
    REACT_APP_FIREBASE_AUTH_DOMAIN=ВАШ_AUTH_DOMAIN
    REACT_APP_FIREBASE_PROJECT_ID=ВАШ_PROJECT_ID
    REACT_APP_FIREBASE_STORAGE_BUCKET=ВАШ_STORAGE_BUCKET
    REACT_APP_FIREBASE_MESSAGING_SENDER_ID=ВАШ_MESSAGING_SENDER_ID
    REACT_APP_FIREBASE_APP_ID=ВАШ_APP_ID
    REACT_APP_API_BASE_URL=http://localhost:5000 # URL вашого локального або розгорнутого бекенду
    ```
5.  **Запустіть додаток:**
    ```bash
    npm start
    ```
    Додаток буде доступний за адресою `http://localhost:3000`.

### Кроки для Бекенду (якщо запускаєте локально):
1.  **Перейдіть у директорію `backend`:**
    ```bash
    cd backend
    ```
2.  **Встановіть залежності:**
    ```bash
    npm install
    ```
3.  **Створіть файл `.env`** у директорії `backend` (`travel-blog-lab5/backend/.env`):
    ```env
    PORT=5000
    SERVICE_ACCOUNT_KEY_PATH=./serviceAccountKey.json
    # Якщо ви передаєте ключ сервісного акаунту через змінну середовища (рекомендовано для Render):
    # FIREBASE_SERVICE_ACCOUNT_KEY_JSON_BASE64=ВМІСТ_ФАЙЛУ_KEY_JSON_У_BASE64
    ```
4.  **Переконайтесь, що файл `serviceAccountKey.json`** (завантажений з Firebase Console) знаходиться у директорії `backend` (або шлях до нього вказано правильно у `SERVICE_ACCOUNT_KEY_PATH`). **ВАЖЛИВО:** Додайте `backend/serviceAccountKey.json` до вашого файлу `.gitignore`, щоб випадково не завантажити його у публічний репозиторій!
5.  **Запустіть бекенд сервер:**
    ```bash
    node server.js
    # Або, якщо у вас є скрипт "start" в backend/package.json:
    # npm start
    ```
    Сервер запуститься на порті, вказаному у змінній `PORT` (за замовчуванням 5000).

## 📜 Доступні Скрипти (Available Scripts)

У директорії проекту (фронтенд):
*   `npm start`: Запускає додаток у режимі розробки.
*   `npm run build`: Збирає додаток для продакшену у папку `build`.
*   `npm test`: Запускає тести.
*   `npm run eject`: Виймає конфігурацію Create React App (одностороння операція).

У директорії `/backend`:
*   `npm test` (заглушка, можна розширити): `echo "Error: no test specified" && exit 1`
*   Для запуску сервера: `node server.js` (або налаштуйте `npm start`).

## 👤 Автор

*   **Окілка Марта Юріївна** - [OkayMarta](https://github.com/OkayMarta) .