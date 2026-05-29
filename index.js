let apikey = "";

async function loadApiKey() {
    if (apikey) return apikey;
    try {
        const response = await fetch(".env");
        if (response.ok) {
            const text = await response.text();
            const match = text.match(/API_KEY\s*=\s*(.*)/);
            if (match && match[1]) {
                apikey = match[1].trim().replace(/['"]/g, "");
            }
        }
    } catch (error) {
        console.error("Error loading .env file:", error);
    }
    return apikey;
}

loadApiKey();

const weatherDataEl = document.getElementById("weather-data");
const cityInputEl = document.getElementById("city-input");
const formEl = document.querySelector(".search-form");
const submitBtn = document.getElementById("search-btn");

const loaderEl = document.getElementById("loader");
const errorContainerEl = document.getElementById("error-container");
const errorTextEl = document.getElementById("error-text");

const cityNameEl = document.getElementById("city-name");
const currentDateEl = document.getElementById("current-date");
const weatherIconEl = document.getElementById("weather-icon");
const tempEl = document.getElementById("temperature");
const descEl = document.getElementById("weather-description");

const feelsLikeEl = document.getElementById("feels-like");
const humidityEl = document.getElementById("humidity");
const windSpeedEl = document.getElementById("wind-speed");

const backgroundClasses = [
    "weather-default",
    "weather-clear",
    "weather-clouds",
    "weather-rain",
    "weather-drizzle",
    "weather-snow",
    "weather-thunderstorm",
    "weather-mist",
    "weather-fog",
    "weather-haze"
];

formEl.addEventListener("submit", (event) => {
    event.preventDefault();
    const cityValue = cityInputEl.value.trim();

    if (cityValue) {
        getWeatherData(cityValue);
    }
});

function updateBackgroundTheme(weatherMain) {
    const condition = weatherMain ? weatherMain.toLowerCase() : "default";

    backgroundClasses.forEach(cls => document.body.classList.remove(cls));

    if (condition.includes("clear")) {
        document.body.classList.add("weather-clear");
    } else if (condition.includes("cloud")) {
        document.body.classList.add("weather-clouds");
    } else if (condition.includes("rain")) {
        document.body.classList.add("weather-rain");
    } else if (condition.includes("drizzle")) {
        document.body.classList.add("weather-drizzle");
    } else if (condition.includes("snow")) {
        document.body.classList.add("weather-snow");
    } else if (condition.includes("thunderstorm")) {
        document.body.classList.add("weather-thunderstorm");
    } else if (["mist", "fog", "haze", "smoke", "dust", "sand", "ash", "squall", "tornado"].includes(condition)) {
        document.body.classList.add("weather-mist");
    } else {
        document.body.classList.add("weather-default");
    }
}

function getFormattedDate() {
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
}

async function getWeatherData(cityValue) {
    errorContainerEl.classList.add("hidden");
    weatherDataEl.classList.add("hidden");
    loaderEl.classList.remove("hidden");

    cityInputEl.disabled = true;
    submitBtn.disabled = true;

    try {
        const key = await loadApiKey();
        if (!key) {
            throw new Error("Weather API Key is not configured. Please add API_KEY=your_key in the .env file.");
        }
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityValue)}&appid=${key}&units=metric`);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error("City not found. Please double check the spelling and try again.");
            } else {
                throw new Error("Unable to retrieve weather. Please try again later.");
            }
        }

        const data = await response.json();

        const temperature = Math.round(data.main.temp);
        const description = data.weather[0].description;
        const icon = data.weather[0].icon;
        const weatherMain = data.weather[0].main;

        const feelsLike = Math.round(data.main.feels_like);
        const humidity = data.main.humidity;
        const windSpeed = data.wind.speed;

        cityNameEl.textContent = `${data.name}, ${data.sys.country}`;
        currentDateEl.textContent = getFormattedDate();

        weatherIconEl.innerHTML = `<img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}">`;
        tempEl.textContent = `${temperature}°C`;
        descEl.textContent = description;

        feelsLikeEl.textContent = `${feelsLike}°C`;
        humidityEl.textContent = `${humidity}%`;
        windSpeedEl.textContent = `${windSpeed} m/s`;

        updateBackgroundTheme(weatherMain);

        loaderEl.classList.add("hidden");
        weatherDataEl.classList.remove("hidden");

    } catch (error) {
        updateBackgroundTheme("default");

        errorTextEl.textContent = error.message || "An unexpected network error occurred.";

        loaderEl.classList.add("hidden");
        errorContainerEl.classList.remove("hidden");
    } finally {
        cityInputEl.disabled = false;
        submitBtn.disabled = false;

        cityInputEl.focus();
    }
}
