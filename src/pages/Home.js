import React from 'react';
import { Link } from 'react-router-dom';

// Компонент головної сторінки
function Home() {
  return (
    <div> {/* Кореневий елемент */} 
      {/* Секція інформації про блогера */}
      <section className="blogger-info-section">
        <h2>Про мене</h2>
        <div className="blogger-info-content">
          <div className="blogger-text">
            <p>Привіт! Мене звати <strong>Марта</strong>, і я обожнюю подорожувати. В моїх планах – відвідати всі можливі куточки світу, досліджувати нові місця та фіксувати найкращі моменти через об'єктив камери. Я завжди ретельно планую свої поїздки, заздалегідь дізнаюся про цікаві локації та унікальні особливості міст.</p>
            <p>Для мене подорож – це не просто зміна місця, а справжня пригода, де кожен день наповнений новими відкриттями.</p>
            <p>Мені подобається як <em>природа</em>, так і <em>архітектура</em> – люблю милуватися міськими пейзажами, досліджувати вузькі вулички, але й не проти прогулятися серед гір чи вздовж моря. Де я вже встигла побувати, можна побачити у розділі <Link to="/publications">публікацій</Link>, а в розділі <Link to="/articles">статей</Link> я ділюся цікавою інформацією про захопливі місця, які варто відвідати.</p>
            <p>Окрім подорожей, я багато <em>читаю</em>, вивчаю <em>програмування</em>, граю на <em>фортепіано</em> та не уявляю життя без хорошої <em>музики</em>. А ще я величезна фанатка мультсеріалу Аркейн – якщо ви теж, то нам є про що поговорити!</p>
          </div>
          <div className="blogger-photo-container">
            <img
                className="blogger-photo"
                src={process.env.PUBLIC_URL + "/images/profile-photo.jpeg"}
                alt="Фото блогера"
            />
          </div>
        </div>
      </section>

      {/* Секція майбутніх подорожей */}
      <section className="future-travels-section">
        <h2>Куди я планую поїхати</h2>
        <div className="future-travels-list">
          {/* Приклад елементу списку майбутніх подорожей */}
          <div className="travel-item">
            <img src={process.env.PUBLIC_URL + "/images/NYC.jpg"} alt="NYC" />
            <p>Нью-Йорк (США)</p>
          </div>
          <div className="travel-item">
            <img src={process.env.PUBLIC_URL + "/images/edinburgh.jpg"} alt="Edinburgh" />
            <p>Единбург (Шотландія)</p>
          </div>
          <div className="travel-item">
            <img src={process.env.PUBLIC_URL + "/images/moher.jpg"} alt="The_Cliffs_of_Moher" />
            <p>Кліф Могер (Ірландія)</p>
          </div>
          <div className="travel-item">
            <img src={process.env.PUBLIC_URL + "/images/RioDeJaneiro.jpg"} alt="Rio_de_Janeiro" />
            <p>Ріо-де-Жанейро (Бразилія)</p>
          </div>
          <div className="travel-item">
            <img src={process.env.PUBLIC_URL + "/images/lofoten.jpg"} alt="Lofoten" />
            <p>Лофотенські острови (Норвегія)</p>
          </div>
          <div className="travel-item">
            <img src={process.env.PUBLIC_URL + "/images/tokyo.jpg"} alt="Tokyo" />
            <p>Токіо (Японія)</p>
          </div>
          <div className="travel-item">
            <img src={process.env.PUBLIC_URL + "/images/MilfordSound.jpg"} alt="Milford_Sound" />
            <p>Мілфордська затока (Нова Зеландія)</p>
          </div>
          <div className="travel-item">
            <img src={process.env.PUBLIC_URL + "/images/florence.jpg"} alt="Florence" />
            <p>Флоренція (Італія)</p>
          </div>
        </div>
      </section>
    </div>
  );
}

// Експорт компонента за замовчуванням
export default Home;