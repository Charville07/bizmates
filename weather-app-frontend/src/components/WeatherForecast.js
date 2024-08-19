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