const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const BASE_URL = import.meta.env.VITE_WEATHER_BASE_URL;

export const getWeatherData = async (city: string) => {
  try {
    const response = await fetch(
      `${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`
    );

    if (!response.ok) {
      throw new Error("Weather API request failed");
    }

    const data = await response.json();

    return {
      city: data.name,
      temp: data.main.temp,
      wind: data.wind.speed,
      rain: data.rain?.["1h"] || 0,
      condition: data.weather[0].main,
    };
  } catch (error) {
    console.error("Weather API Error:", error);
    throw error;
  }
};