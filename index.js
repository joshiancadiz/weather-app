// API key is handled server-side via Vercel serverless function (/api/weather.js) or via localStorage locally.

// Detect if running locally via file:// protocol
const isLocalFile = window.location.protocol === "file:";

const settingsBtn = document.getElementById("settings-btn");
const settingsModal = document.getElementById("settings-modal");
const closeModalBtn = document.getElementById("close-modal-btn");
const saveKeyBtn = document.getElementById("save-key-btn");
const apiKeyInput = document.getElementById("api-key-input");

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

// Configure settings modal behaviors for local testing
if (isLocalFile) {
    // Show settings gear button if opened directly via file://
    settingsBtn.classList.remove("hidden");

    // Pre-populate input with existing key if available
    const savedKey = localStorage.getItem("weather_api_key");
    if (savedKey) {
        apiKeyInput.value = savedKey;
    }

    // Modal click behaviors
    settingsBtn.addEventListener("click", () => {
        settingsModal.classList.remove("hidden");
        apiKeyInput.focus();
    });

    closeModalBtn.addEventListener("click", () => {
        settingsModal.classList.add("hidden");
    });

    window.addEventListener("click", (event) => {
        if (event.target === settingsModal) {
            settingsModal.classList.add("hidden");
        }
    });

    saveKeyBtn.addEventListener("click", () => {
        const key = apiKeyInput.value.trim();
        if (key) {
            localStorage.setItem("weather_api_key", key);
            settingsModal.classList.add("hidden");
            
            // Re-trigger query if a city name is already inputted
            const cityValue = cityInputEl.value.trim();
            if (cityValue) {
                getWeatherData(cityValue);
            }
        } else {
            localStorage.removeItem("weather_api_key");
            settingsModal.classList.add("hidden");
        }
    });
}

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
        let response;
        if (isLocalFile) {
            const localKey = localStorage.getItem("weather_api_key");
            if (!localKey) {
                // Auto-open modal to guide the user visually
                settingsModal.classList.remove("hidden");
                apiKeyInput.focus();
                throw new Error("Local API key is not configured. Enter your OpenWeatherMap API Key in the settings panel (gear icon in the top right) to run weather queries locally.");
            }
            response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityValue)}&appid=${localKey}&units=metric`);
        } else {
            response = await fetch(`/api/weather?city=${encodeURIComponent(cityValue)}`);
        }

        if (!response.ok) {
            let errorMsg = "Unable to retrieve weather. Please try again later.";
            try {
                const errData = await response.json();
                if (errData && errData.error) {
                    errorMsg = errData.error;
                } else if (errData && errData.message) {
                    errorMsg = errData.message;
                }
            } catch (e) {
                // Fallback to default message if not JSON
            }
            throw new Error(errorMsg);
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
