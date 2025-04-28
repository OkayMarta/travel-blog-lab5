import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Імпортуємо хук useAuth

/**
 * Компонент CommentForm рендерить форму для додавання нового коментаря до статті.
 * Перевіряє авторизацію користувача за допомогою useAuth.
 *
 * @param {object} props - Пропси компонента.
 * @param {string} props.articleId - ID статті, до якої додається коментар.
 * @param {function} props.onCommentSubmit - Функція зворотного виклику для обробки відправки.
 */
function CommentForm({ articleId, onCommentSubmit }) {
    const { currentUser } = useAuth(); // Отримуємо поточного користувача з контексту
    const [name, setName] = useState(''); // Стан для зберігання імені користувача
    const [text, setText] = useState(''); // Стан для зберігання тексту коментаря
    // Стан для відстеження процесу відправки (наприклад, для блокування кнопки)
    const [isSubmitting, setIsSubmitting] = useState(false);

    /**
     * Асинхронний обробник події відправки форми.
     * Перевіряє авторизацію користувача та валідність введених даних.
     * Викликає функцію onCommentSubmit, передану через пропси, для відправки даних.
     * Обробляє стани завантаження та можливі помилки під час відправки.
     * @param {React.FormEvent<HTMLFormElement>} event - Об'єкт події форми.
     */
    const handleSubmit = async (event) => {
        event.preventDefault(); // Запобігаємо стандартній поведінці форми (перезавантаженню сторінки)

        // Перевіряємо, чи користувач авторизований, використовуючи дані з контексту
        if (!currentUser) {
            alert("Будь ласка, увійдіть, щоб залишати коментарі.");
            return; // Зупиняємо виконання, якщо користувач не увійшов
        }

        // Перевіряємо, чи введено текст коментаря (після видалення пробілів на початку та в кінці)
        if (!text.trim()) {
            alert('Будь ласка, заповніть текст коментаря.');
            return; // Зупиняємо виконання, якщо текст порожній
        }

        setIsSubmitting(true); // Встановлюємо стан "відправка триває"
        try {
            // Викликаємо функцію onCommentSubmit, передану з батьківського компонента (ArticleList).
            // Ця функція відповідає за взаємодію з API для збереження коментаря.
            // Передаємо ID статті та об'єкт з даними коментаря (ім'я або "Анонім", якщо ім'я не вказано, та текст).
            await onCommentSubmit(articleId, { name: name.trim() || 'Анонім', text: text.trim() });

            // Очищуємо поля форми ТІЛЬКИ у випадку успішної відправки коментаря (успішного виконання onCommentSubmit)
            setName('');
            setText('');
            console.log("Форма коментарів успішно очищена після відправки.");

        } catch (error) {
            // Обробляємо помилку, яка могла виникнути під час виконання onCommentSubmit (наприклад, помилка мережі або сервера)
            console.error("Помилка під час відправки коментаря (перехоплена в CommentForm):", error);
            // Показуємо повідомлення про помилку користувачу
            alert(`Не вдалося відправити коментар: ${error.message || 'Сталася невідома помилка'}`);
        } finally {
            // Незалежно від того, чи була відправка успішною чи ні, встановлюємо стан "відправка завершена"
            setIsSubmitting(false);
        }
    };

    // Визначаємо, чи повинна форма бути неактивною (disabled)
    // Форма неактивна, якщо користувач не авторизований АБО якщо триває процес відправки
    const isFormDisabled = !currentUser || isSubmitting;

    return (
        <form className="comment-form" onSubmit={handleSubmit}>
            {/* Якщо користувач не авторизований, показуємо повідомлення з посиланням на сторінку входу */}
            {!currentUser && (
                <p className="auth-required-message" style={{ marginBottom: '15px', color: 'var(--color-text-secondary)' }}>
                    Будь ласка, <Link to="/login" style={{ color: 'var(--color-primary)' }}>увійдіть</Link>, щоб залишити коментар.
                </p>
            )}

            {/* Група полів форми для імені */}
            <div className="form-group">
                <label htmlFor={`comment-name-${articleId}`}>Ваше ім'я (необов'язково):</label>
                <input
                    type="text"
                    id={`comment-name-${articleId}`} // Унікальний ID для label зв'язку
                    className="comment-name-input"
                    placeholder="Ваше ім'я"
                    value={name} // Значення поля контролюється станом 'name'
                    onChange={(e) => setName(e.target.value)} // Оновлюємо стан при зміні значення
                    // Поле імені більше не є обов'язковим
                    disabled={isFormDisabled} // Поле неактивне, якщо форма заблокована
                />
            </div>

            {/* Група полів форми для тексту коментаря */}
            <div className="form-group">
                <label htmlFor={`comment-text-${articleId}`}>Ваш коментар:</label>
                <textarea
                    id={`comment-text-${articleId}`} // Унікальний ID для label зв'язку
                    className="comment-text-input"
                    placeholder="Ваш коментар"
                    value={text} // Значення поля контролюється станом 'text'
                    onChange={(e) => setText(e.target.value)} // Оновлюємо стан при зміні значення
                    required // Поле тексту є обов'язковим для заповнення (валідація браузера)
                    rows="3" // Висота текстового поля
                    disabled={isFormDisabled} // Поле неактивне, якщо форма заблокована
                ></textarea>
            </div>

            {/* Кнопка відправки форми */}
            <button
                type="submit"
                className="submit-comment-btn"
                disabled={isFormDisabled} // Кнопка неактивна, якщо форма заблокована
                title={!currentUser ? "Потрібно увійти в систему" : ""} // Підказка для неавторизованих користувачів
            >
                {/* Текст кнопки змінюється залежно від стану відправки */}
                {isSubmitting ? 'Надсилання...' : 'Надіслати'}
            </button>
        </form>
    );
}

export default CommentForm;