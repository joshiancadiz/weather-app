# 🌤 Weather App

A simple weather application built with pure HTML, CSS, and JavaScript. It fetches real-time weather data using the OpenWeatherMap API and displays the current weather of a searched city.

---

## ✨ Features

- Search weather by city name
- Displays temperature, weather condition, humidity, and wind speed
- Responsive and clean UI

---

## 🛠 Technologies Used

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

| Technology | Purpose |
|---|---|
| HTML | Structure and markup |
| CSS | Styling and responsive layout |
| JavaScript | Logic and API integration |
| OpenWeatherMap API | Real-time weather data |

---

## 🚀 Getting Started

### Prerequisites

- A free API key from [OpenWeatherMap](https://openweathermap.org/api)

### Setup

1. Clone the repository:

```bash
git clone https://github.com/joshiancadiz/weather-app.git
cd weather-app
```

2. Open `script.js` and replace the placeholder with your API key:

```js
const key = "YOUR_API_KEY_HERE";
```

3. Open `index.html` in your browser and you're good to go.

---

## 🌐 API Reference

This project uses the [OpenWeatherMap Current Weather API](https://openweathermap.org/current).

**Endpoint:**

```
GET https://api.openweathermap.org/data/2.5/weather?q={city}&appid={key}&units=metric
```

**Example Request:**

```js
`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityValue)}&appid=${key}&units=metric`
```

**Example Response:**

```json
{
  "name": "Manila",
  "main": {
    "temp": 31.5,
    "humidity": 74
  },
  "weather": [
    { "description": "few clouds" }
  ],
  "wind": {
    "speed": 5.2
  }
}
```

---

## 📄 License

This project is licensed under the MIT License.

---

> Built by [Joshua Ian Cadiz](https://github.com/joshiancadiz)
