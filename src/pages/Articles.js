import React from 'react';
import ArticleList from '../components/articles/ArticleList'; // Імпорт компоненту списку статей

// Компонент сторінки "Статті"
function ArticlesPage() { // Функція компонента
  return (
    // Рендеримо компонент ArticleList
    <ArticleList />
  );
}

// Експорт компонента за замовчуванням
export default ArticlesPage;
