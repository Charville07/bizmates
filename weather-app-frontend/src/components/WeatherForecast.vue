<template>
  <div class="weather">
    <div class="container">
      <!-- Left side: Sidebar with City Buttons and Future Features -->
      <div class="sidebar">
        <div class="sidebar-top">
          <h1>Weather Forecast</h1>
          <div class="city-buttons">
            <button @click="fetchWeather('Tokyo')">Tokyo</button>
            <button @click="fetchWeather('Yokohama')">Yokohama</button>
            <button @click="fetchWeather('Kyoto')">Kyoto</button>
            <button @click="fetchWeather('Osaka')">Osaka</button>
            <button @click="fetchWeather('Sapporo')">Sapporo</button>
            <button @click="fetchWeather('Nagoya')">Nagoya</button>
          </div>
        </div>
        <div class="sidebar-bottom">
          <h2>Future Features</h2>
          <!-- Placeholder for future features -->
          <p>This section will be used for future features.</p>
        </div>
      </div>

      <!-- Right side: Weather Cards -->
      <div class="content">
        <div v-if="weatherData">
          <h2>Weather in {{ weatherData.city.name }}</h2>

          <!-- Card for Today's Weather -->
          <div class="card today-card" v-if="todayWeather">
            <h3>Today's Weather</h3>
            <div class="weather-details">
              <img :src="todayWeather.icon" alt="Weather icon" class="weather-icon" />
              <p>Temperature: {{ todayWeather.temp }}°C</p>
              <p>Condition: {{ todayWeather.condition }}</p>
              <p>Humidity: {{ todayWeather.humidity }}%</p>
              <p>Wind Speed: {{ todayWeather.windSpeed }} m/s</p>
              <p>Description: {{ todayWeather.description }}</p>
            </div>
          </div>

          <!-- Cards for Future Days -->
          <div class="cards">
            <div class="card" v-for="(day, index) in futureWeather" :key="index">
              <h3>{{ day.date }}</h3>
              <p>Temperature: {{ day.temp }}°C</p>
              <p>Condition: {{ day.condition }}</p>
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
      todayWeather: {},
      futureWeather: [],
      defaultCity: 'Tokyo' // Default city when no city is specified
    };
  },
  methods: {
    fetchWeather(city) {
      city = city || this.defaultCity; // Use the provided city or default to the default city
      axios.get(`http://localhost:8000/api/weather?city=${city}`)
        .then(response => {
          this.weatherData = response.data;
          this.groupWeatherByDay();
        })
        .catch(error => {
          console.error(error);
        });
    },
    groupWeatherByDay() {
      if (!this.weatherData || !this.weatherData.list) return;

      const days = {};
      const todayDate = new Date().toISOString().split('T')[0]; // Today's date in YYYY-MM-DD format

      this.weatherData.list.forEach(item => {
        const date = new Date(item.dt * 1000); // Convert timestamp to Date
        const day = date.toISOString().split('T')[0]; // Get the date in YYYY-MM-DD format

        if (!days[day]) {
          days[day] = {
            date: date.toDateString(), // Convert date to a readable format
            temp: 0,
            condition: item.weather[0].description,
            humidity: item.main.humidity,
            windSpeed: item.wind.speed,
            icon: `http://openweathermap.org/img/wn/${item.weather[0].icon}.png`, // Weather icon
            count: 0,
            description: item.weather[0].description
          };
        }

        days[day].temp += item.main.temp;
        days[day].count += 1;
      });

      this.groupedWeather = Object.values(days).map(day => ({
        ...day,
        temp: (day.temp / day.count).toFixed(1) // Average temperature
      }));

      // Set today's weather
      this.todayWeather = this.groupedWeather.find(day => day.date === new Date(todayDate).toDateString()) || {};

      // Filter out today's weather from futureWeather
      this.futureWeather = this.groupedWeather.filter(day => day.date !== this.todayWeather.date);
    }
  },
  mounted() {
    this.fetchWeather(this.defaultCity); // Fetch weather for the default city initially
  }
}
</script>








<style scoped>
.weather {
  font-family: Arial, sans-serif;
  padding: 20px;
  display: flex;
}

.container {
  display: flex;
  width: 100%;
}

.sidebar {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  border-right: 1px solid #ddd;
  box-sizing: border-box;
  max-width: 300px; /* Set a maximum width for the sidebar */
}

.sidebar-top {
  flex: 1;
}

.sidebar-bottom {
  flex: 1;
  margin-top: 20px;
}

.city-buttons {
  display: flex;
  flex-direction: column;
}

button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  margin: 5px 0;
  display: block;
  width: 100%;
}

button:hover {
  background-color: #0056b3;
}

h1, h2 {
  color: #333;
}

.content {
  flex: 2;
  padding: 20px;
  box-sizing: border-box;
}

.cards {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  gap: 20px;
}

.card {
  background: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  width: 200px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.card h3 {
  margin: 0;
  font-size: 16px;
}

.card p {
  margin: 5px 0;
}

.today-card {
  background: #e0f7fa;
  border: 1px solid #b2ebf2;
}

.weather-details {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.weather-icon {
  width: 50px;
  height: 50px;
  margin-bottom: 10px;
}
</style>
