import { useState } from "react";
import { motion } from "framer-motion";
import { useAppState } from "@/context/AppStateContext";
import { isValidCity, CITY_ERROR } from "@/lib/validateCity";
import { getWeatherData } from "@/services/weatherService";

import {
  CloudRain,
  Wind,
  Thermometer,
  MapPin,
  Cloud,
} from "lucide-react";

type Risk = "Low" | "Medium" | "High";
type Disaster = "Flood" | "Cyclone" | "Storm" | "None";

interface WeatherReading {
  id: string;
  city: string;
  rain: number;
  wind: number;
  temp: number;
  risk: Risk;
  disaster: Disaster;
  source: "API";
  time: Date;
}

const calculateRisk = (
  rain: number,
  wind: number
): { risk: Risk; disaster: Disaster } => {
  if (wind >= 80) return { risk: "High", disaster: "Cyclone" };
  if (rain >= 80 && wind >= 50) return { risk: "High", disaster: "Storm" };
  if (rain >= 70) return { risk: "Medium", disaster: "Flood" };
  if (wind >= 50) return { risk: "Medium", disaster: "Storm" };
  return { risk: "Low", disaster: "None" };
};

const WeatherRiskPage = () => {
  const { addAlert, setDisaster } = useAppState();

  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState<WeatherReading | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async () => {
    if (loading) return;

    if (!isValidCity(city)) {
      setError(CITY_ERROR);
      setCurrent(null);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const data = await getWeatherData(city);

      const { risk, disaster } = calculateRisk(
        data.rain,
        data.wind
      );

      // ✅ FIXED AI LOGIC (now consistent)
      let aiPrediction: Disaster = "None";

      if (data.wind > 85) {
        aiPrediction = "Cyclone";
      } else if (data.rain > 75 && data.wind > 60) {
        aiPrediction = "Storm";
      } else if (data.rain > 75) {
        aiPrediction = "Flood";
      }

      const finalDisaster: Disaster =
        aiPrediction !== "None" ? aiPrediction : disaster;

      const reading: WeatherReading = {
        id: crypto.randomUUID(),
        city: data.city,
        rain: data.rain,
        wind: data.wind,
        temp: data.temp,
        risk,
        disaster: finalDisaster,
        source: "API",
        time: new Date(),
      };

      setCurrent(reading);

      // 🚨 CONNECT TO DISASTER SYSTEM
      if (risk === "High") {
        setDisaster({
          city,
          disasterType: finalDisaster,
          riskLevel: "High",
          active: true,
        });

        addAlert(`🚨 HIGH RISK ${finalDisaster} predicted for ${city}`);
      } else if (risk === "Medium") {
        addAlert(`⚠️ Medium risk ${finalDisaster} forecast for ${city}`);
      }
    } catch (err) {
      console.error(err);
      setError("Weather API failed. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-center gap-3">
        <CloudRain className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">
          Weather Risk Engine
        </h1>
      </div>

      {/* INPUT */}
      <div className="glass-card rounded-xl p-5 space-y-4">

        <div className="flex flex-col sm:flex-row gap-3">

          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-3 h-4 w-4" />

            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter city name..."
              className="w-full pl-10 pr-4 py-2.5 bg-muted rounded-lg"
            />
          </div>

          <button
            onClick={fetchWeather}
            disabled={loading || !isValidCity(city)}
            className="px-6 py-2.5 bg-primary text-white rounded-lg"
          >
            {loading ? "Fetching..." : "Fetch Weather"}
          </button>

        </div>

        {error && (
          <p className="text-danger text-sm">{error}</p>
        )}

      </div>

      {/* RESULTS */}
      {current && (
        <motion.div className="grid md:grid-cols-3 gap-4">

          <div className="glass-card p-4">
            <p>Rain: {current.rain} mm</p>
          </div>

          <div className="glass-card p-4">
            <p>Wind: {current.wind} km/h</p>
          </div>

          <div className="glass-card p-4">
            <p>Temp: {current.temp} °C</p>
          </div>

        </motion.div>
      )}

    </div>
  );
};

export default WeatherRiskPage;