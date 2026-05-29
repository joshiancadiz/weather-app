// API key is handled server-side via Vercel serverless function (/api/weather.js)

const weatherDataEl = document.getElementById("weather-data");
const cityInputEl = document.getElementById("city-input");
const formEl = document.querySelector(".search-form");
const submitBtn = document.getElementById("search-btn");
const locationBtn = document.getElementById("location-btn");

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

locationBtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
        showError("Geolocation is not supported by your browser.");
        return;
    }

    // Set UI to loading state immediately
    errorContainerEl.classList.add("hidden");
    weatherDataEl.classList.add("hidden");
    loaderEl.classList.remove("hidden");
    
    cityInputEl.disabled = true;
    submitBtn.disabled = true;
    locationBtn.disabled = true;
    cityInputEl.value = "";

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            getWeatherData({ lat, lon });
        },
        (error) => {
            let errMsg = "Unable to retrieve your location.";
            if (error.code === error.PERMISSION_DENIED) {
                errMsg = "Location access denied. Please check your browser location permissions.";
            } else if (error.code === error.POSITION_UNAVAILABLE) {
                errMsg = "Location information is unavailable.";
            } else if (error.code === error.TIMEOUT) {
                errMsg = "Location request timed out. Please try again.";
            }
            showError(errMsg);
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
});

function showError(message) {
    updateBackgroundTheme("default");
    errorTextEl.textContent = message;
    loaderEl.classList.add("hidden");
    errorContainerEl.classList.remove("hidden");
    
    cityInputEl.disabled = false;
    submitBtn.disabled = false;
    locationBtn.disabled = false;
    cityInputEl.focus();
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

async function getWeatherData(query) {
    errorContainerEl.classList.add("hidden");
    weatherDataEl.classList.add("hidden");
    loaderEl.classList.remove("hidden");

    cityInputEl.disabled = true;
    submitBtn.disabled = true;
    locationBtn.disabled = true;

    try {
        let url;
        if (typeof query === "string") {
            url = `/api/weather?city=${encodeURIComponent(query)}`;
        } else {
            url = `/api/weather?lat=${query.lat}&lon=${query.lon}`;
        }

        const response = await fetch(url);

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
        locationBtn.disabled = false;

        cityInputEl.focus();
    }
}
