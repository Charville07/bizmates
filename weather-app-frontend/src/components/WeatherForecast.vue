<template>
  <div class="app-card">
    <div class="weather">
      <div class="container">
        <div class="sidebar">
          <div class="sidebar-top">
            <h3>Select City</h3>
            <div class="city-buttons">
              <button class="city-button tokyo" @mouseover="onMouseOver" @mouseout="onMouseOut" @click="fetchWeather('Tokyo')" data-text="Tokyo"></button>
              <button class="city-button yokohama" @mouseover="onMouseOver" @mouseout="onMouseOut" @click="fetchWeather('Yokohama')" data-text="Yokohama"></button>
              <button class="city-button kyoto" @mouseover="onMouseOver" @mouseout="onMouseOut" @click="fetchWeather('Kyoto')" data-text="Kyoto"></button>
              <button class="city-button osaka" @mouseover="onMouseOver" @mouseout="onMouseOut" @click="fetchWeather('Osaka')" data-text="Osaka"></button>
              <button class="city-button sapporo" @mouseover="onMouseOver" @mouseout="onMouseOut" @click="fetchWeather('Sapporo')" data-text="Sapporo"></button>
              <button class="city-button nagoya" @mouseover="onMouseOver" @mouseout="onMouseOut" @click="fetchWeather('Nagoya')" data-text="Nagoya"></button>
            </div>
          </div>
        </div>

        <div class="content">
          <div class="card container-card" :style="{ backgroundImage: 'url(' + currentCityBackground + ')' }">
            <div v-if="todayWeather" class="today-card">

              <div class="large-text">
                <h1>{{ selectedCity }}</h1> <!-- Display the city name -->
              </div>

              <div class="weather-details">
                <img :src="todayWeather.icon" alt="Weather icon" class="weather-icon" @error="onImageError" />
                <div class="weather-info">
                  <p><strong>Temperature:</strong> {{ todayWeather.temp }}°C</p>
                  <p><strong>Condition:</strong> {{ todayWeather.condition }}</p>
                  <p><strong>Humidity:</strong> {{ todayWeather.humidity }}%</p>
                  <p><strong>Wind Speed:</strong> {{ todayWeather.windSpeed }} m/s</p>
                  <p><strong>Description:</strong> {{ todayWeather.description }}</p>
                </div>
              </div>

            </div>

            <div v-if="futureWeather.length" class="forecast">
              <div class="forecast-cards">
                <div class="forecast-card" v-for="(day, index) in futureWeather" :key="index">
                  <h2>{{ day.date }}</h2>
                  <p><strong>Temperature:</strong> {{ day.temp }}°C</p>
                  <p><strong>Condition:</strong> {{ day.condition }}</p>
                </div>
              </div>
            </div>
          </div>

          <div v-if="popularPlaces.length" class="card popular-places-card">
            <h3>Popular Places in {{ selectedCity }}</h3>
            <div class="places">
              <div class="place" v-for="place in popularPlaces" :key="place.fsq_id">
                <h4>{{ place.name }}</h4>
                <p><strong>Address:</strong> {{ place.location.address || 'No address available' }}</p>
                <p><strong>Category:</strong> {{ place.categories[0]?.name || 'N/A' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'WeatherForecast',
  data() {
    return {
      weatherData: null,
      groupedWeather: [],
      todayWeather: {
        date: '',
        temp: 'N/A',
        condition: 'N/A',
        humidity: 'N/A',
        windSpeed: 'N/A',
        icon: 'path/to/default-icon.png', // Set a default icon path
        description: 'N/A'
      },
      futureWeather: [],
      popularPlaces: [],
      selectedCity: 'Tokyo',
      defaultCity: 'Tokyo',
      currentCityBackground: ''
    };
  },
  methods: {
    fetchWeather(city) {
      this.selectedCity = city || this.defaultCity;
      // Set the background image based on the selected city
      this.currentCityBackground = this.getCityBackground(city);
      axios.get(`http://localhost:8000/api/weather?city=${this.selectedCity}`)
        .then(response => {
          this.weatherData = response.data;
          this.groupWeatherByDay();
          this.fetchPopularPlaces(this.selectedCity);
        })
        .catch(error => {
          console.error('Error fetching weather:', error);
        });
    },
    fetchPopularPlaces(city) {
      axios.get(`http://localhost:8000/api/places`, { params: { city: city } })
        .then(response => {
          this.popularPlaces = response.data.results || [];
        })
        .catch(error => {
          console.error('Error fetching popular places:', error.response ? error.response.data : error.message);
          this.popularPlaces = [];
        });
    },
    groupWeatherByDay() {
      if (!this.weatherData || !this.weatherData.list) {
        console.log('Weather data is missing or empty:', this.weatherData);
        return;
      }

      const days = {};
      const todayDate = new Date().toISOString().split('T')[0];

      this.weatherData.list.forEach(item => {
        const date = new Date(item.dt * 1000).toISOString().split('T')[0];

        if (!days[date]) {
          days[date] = {
            date: new Date(date).toDateString(),
            temp: 0,
            condition: item.weather[0].description,
            humidity: item.main.humidity,
            windSpeed: item.wind.speed,
            icon: `http://openweathermap.org/img/wn/${item.weather[0].icon}.png`,
            count: 0,
            description: item.weather[0].description
          };
        }

        days[date].temp += item.main.temp;
        days[date].count += 1;
      });

      this.groupedWeather = Object.values(days).map(day => ({
        ...day,
        temp: (day.temp / day.count).toFixed(1)
      }));

      const today = this.groupedWeather.find(day => day.date === new Date(todayDate).toDateString()) || {};
      this.todayWeather = { ...today };
      this.futureWeather = this.groupedWeather.filter(day => day.date !== today.date);
    },
    onMouseOver(event) {
      const buttons = document.querySelectorAll('.city-button');
      buttons.forEach(button => {
        if (button !== event.currentTarget) {
          button.classList.add('blur');
        }
      });
    },
    onMouseOut() {
      const buttons = document.querySelectorAll('.city-button');
      buttons.forEach(button => {
        button.classList.remove('blur');
      });
    },
    getCityBackground(city) {
      const backgrounds = {
        'Tokyo': 'https://mir-s3-cdn-cf.behance.net/project_modules/1400/86136164057543.5acbb22ca2b6f.jpg',
        'Yokohama': 'https://www.gotokyo.org/en/destinations/beyond-tokyo/images/main_pc_yokohama.jpg',
        'Kyoto': 'https://media.digitalnomads.world/wp-content/uploads/2021/09/20115133/kyoto-digital-nomads-1024x684.jpg',
        'Osaka': 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2b/ac/3d/a2/caption.jpg?w=1200&h=-1&s=1&cx=1920&cy=1080&chk=v1_ef5f2a2880fde42a26ac',
        'Sapporo': 'https://a1.cdn.japantravel.com/photo/24758-204485/1200x630!/hokkaido-sapporo-204485.jpg',
        'Nagoya': 'https://realestate-resources.scdn2.secure.raxcdn.com/wp-content/uploads/2016/08/Nagoya-Area-Guide-Real-Estate-Japan.jpg'
      };
      return backgrounds[city] || '';
    },
    onImageError(event) {
      event.target.src = 'path/to/default-icon.png'; // Replace with your default icon path
    }
  },
  mounted() {
    this.fetchWeather(this.defaultCity);
  }
}
</script>

<style scoped>
.app-card {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 90vh;
  padding: 5%;
  padding-top: 2%;
}

.weather {
  display: flex;
  font-family: Arial, sans-serif;
  width: 100%;
  height: 100%;
}

.container {
  display: flex;
  width: 100%;
  height: 100%;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.sidebar {
  width: 300px;
  padding: 20px;
  background: #f4f4f4;
  border-right: 1px solid #ddd;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.sidebar-top {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-bottom: 15%;
}

.sidebar-top h3 {
  margin: 0;
  font-size: 1.2rem;
  margin-bottom: 20px;
}

.city-buttons {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 10px;
}

.city-button {
  position: relative;
  flex: 1;
  margin: 0;
  padding: 20px;
  font-size: 16px;
  color: transparent;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  text-align: center;
  overflow: hidden;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  transition: transform 0.3s, filter 0.3s, color 0.3s;
}

.city-button.tokyo {
  background-image: url('https://mir-s3-cdn-cf.behance.net/project_modules/1400/86136164057543.5acbb22ca2b6f.jpg');
}

.city-button.yokohama {
  background-image: url('https://www.gotokyo.org/en/destinations/beyond-tokyo/images/main_pc_yokohama.jpg');
}

.city-button.kyoto {
  background-image: url('https://media.digitalnomads.world/wp-content/uploads/2021/09/20115133/kyoto-digital-nomads-1024x684.jpg');
}

.city-button.osaka {
  background-image: url('https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2b/ac/3d/a2/caption.jpg?w=1200&h=-1&s=1&cx=1920&cy=1080&chk=v1_ef5f2a2880fde42a26ac');
}

.city-button.sapporo {
  background-image: url('https://a1.cdn.japantravel.com/photo/24758-204485/1200x630!/hokkaido-sapporo-204485.jpg');
}

.city-button.nagoya {
  background-image: url('https://realestate-resources.scdn2.secure.raxcdn.com/wp-content/uploads/2016/08/Nagoya-Area-Guide-Real-Estate-Japan.jpg');
}

.city-button:hover {
  color: #fff;
  transform: scale(1.1);
  filter: none;
}

.city-button.blur {
  filter: blur(4px);
}

.city-button::before {
  content: attr(data-text);
  position: absolute;
  bottom: -100%; /* Start hidden at the bottom */
  left: 0;
  width: 100%;
  text-align: center;
  font-size: 16px;
  color: transparent;
  background-color: rgba(0, 0, 0, 0.6); /* Black background with opacity */
  padding: 10px 0; /* Add some vertical padding */
  border-radius: 3px; /* Rounded corners for the background */
  transition: color 0.3s, background-color 0.3s;
  transform: translateY(100%); /* Start from below */
  opacity: 0;
  z-index: 1; /* Ensure it's above other elements */
}

.city-button:hover::before {
  color: #fff;
  background-color: rgba(0, 0, 0, 0.8); /* Darker black background on hover */
  transform: translateY(0); /* Slide up to visible position */
  opacity: 1;
  bottom: 0; /* Move to the bottom of the button */
}

.city-button:not(:hover)::before {
  opacity: 0; /* Fade out when not hovering */
}

.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.card.container-card {
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin: 20px;
}


.today-card {
  display: flex;
  flex-direction: column; /* Stack children vertically */
  align-items: center;
  margin-bottom: 20px;
  text-align: center;
}


.weather-details {
  background: rgb(23 10 10 / 49%); /* Semi-transparent white */
  border: 0.5px solid rgba(255, 255, 255, 0.5); /* Lighter border to enhance the glass effect */
  display: flex;
  align-items: center; /* Align items vertically centered */
  justify-content: space-evenly; /* Space items evenly */
  width: 100%; /* Full width of the container */
  max-width: 98.9%; /* Limit the width if needed */
  padding: 0.5%;
  backdrop-filter: blur(1.3px); /* Apply blur effect */
  -webkit-backdrop-filter: blur(10px); /* Support for older browsers */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Optional: Add a subtle shadow for depth */
  color:#fff4f4;
  border-radius: 8px; /* Optional: rounded corners */
}

.weather-info {
  display: contents;
}

.weather-icon {
  width: 50px;
  height: 50px;
}

.large-text {
  margin-top: 0%; /* Space between weather details and large text */
}

.large-text h1 {
  font-size: 5rem; /* Adjust size as needed */
  color:#fff4f4;
  text-shadow:
        0.07em 0 black,
        0 0.07em black;
}

.forecast {
  margin-top: 20px;
}

.forecast-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.forecast-card {
  background: rgb(23 10 10 / 49%); /* Semi-transparent white */
  border: 0.5px solid rgba(255, 255, 255, 0.5); /* Lighter border to enhance the glass effect */
  color:#fff4f4;
  text-shadow:
        0.07em 0 black,
        0 0.07em black;
  border-radius: 8px;
  padding: 15px;
  min-width: 150px;
  flex: 1;
  backdrop-filter: blur(1.3px); /* Apply blur effect */
  -webkit-backdrop-filter: blur(10px); /* Support for older browsers */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Optional: Add a subtle shadow for depth */
}

.popular-places-card {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin: 20px;
}

.popular-places-card h3 {
  margin: 0;
}

.places {
  display: flex;
  overflow-x: auto;
  gap: 10px;
  padding: 10px 0;
}

.place {
  background: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  min-width: 200px;
}

.place h3 {
  margin: 0;
  font-size: 18px;
}

.place p {
  margin: 5px 0;
}

.place p strong {
  font-weight: bold;
}
</style>
