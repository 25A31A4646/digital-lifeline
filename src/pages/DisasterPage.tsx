import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useAppState } from "@/context/AppStateContext";
import type { DisasterType } from "@/context/AppStateContext";
import { isValidCity, CITY_ERROR } from "@/lib/validateCity";
import { getWeatherData } from "@/services/weatherService";

import {
  CloudLightning,
  MapPin,
  Waves,
  Wind,
  Mountain,
} from "lucide-react";

const disasterIcons: Record<string, any> = {
  Flood: Waves,
  Cyclone: Wind,
  Earthquake: Mountain,
};

const DisasterPage = () => {

  const {
    disaster,
    setDisaster,
    addAlert,
  } = useAppState();

  const [city, setCity] = useState(disaster.city || "");
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [useWeatherAPI, setUseWeatherAPI] = useState(false);

  const simulate = useCallback(async () => {

    if (isRunning) return;

    if (!isValidCity(city)) {
      setError(CITY_ERROR);
      return;
    }

    setError(null);
    setIsRunning(true);

    // 🔥 RESET STATE BEFORE EACH RUN (VERY IMPORTANT FIX)
    setDisaster({
      city: "",
      disasterType: "Earthquake",
      riskLevel: "Low",
      active: false,
    });

    let rain = Math.random() * 100;
    let wind = Math.random() * 100;

    // 🌦 WEATHER API
    if (useWeatherAPI) {
      try {
        const weather = await getWeatherData(city);
        rain = weather.rain;
        wind = weather.wind;
      } catch (err) {
        console.log("Weather API failed → fallback");
      }
    }

    // 🧠 DECISION ENGINE
    let finalType: DisasterType | "None" = "None";

    if (wind > 85) finalType = "Cyclone";
    else if (rain > 75) finalType = "Flood";
    else if (!useWeatherAPI) {
      const types: DisasterType[] = ["Flood", "Cyclone", "Earthquake"];
      finalType = types[Math.floor(Math.random() * types.length)];
    }

    // ⏱ simulate processing delay (for UI realism)
    setTimeout(() => {

      setDisaster({
        city,
        disasterType: finalType,
        riskLevel: finalType === "None" ? "Low" : "High",
        active: true,
      });

      if (finalType === "None") {
        addAlert(`✅ No disaster risk in ${city}`);
      } else {
        addAlert(`⚠️ ${finalType} detected in ${city}`);
      }

      setIsRunning(false);

    }, 1000);

  }, [city, isRunning, useWeatherAPI, setDisaster, addAlert]);

  const DIcon =
    disaster.disasterType && disaster.disasterType !== "None"
      ? disasterIcons[disaster.disasterType]
      : CloudLightning;

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-center gap-3">
        <CloudLightning className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">
          Disaster Detection
        </h1>
      </div>

      {/* INPUT */}
      <div className="glass-card rounded-xl p-5 space-y-4">

        <div className="flex gap-3">

          <div className="relative flex-1">

            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter city name..."
              className="w-full pl-10 pr-4 py-2.5 bg-muted rounded-lg"
            />

          </div>

          <button
            onClick={simulate}
            disabled={isRunning}
            className="px-6 py-2.5 bg-primary text-white rounded-lg"
          >
            {isRunning ? "Analyzing..." : "Simulate Disaster"}
          </button>

        </div>

        {/* TOGGLE */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">

          <input
            type="checkbox"
            checked={useWeatherAPI}
            onChange={() => setUseWeatherAPI(!useWeatherAPI)}
          />

          Use Weather API

        </div>

        {error && (
          <p className="text-danger text-sm">{error}</p>
        )}

      </div>

      {/* RESULT (FIXED: ALWAYS CONSISTENT) */}
      {disaster.city && (

        <motion.div className="glass-card p-6 rounded-xl space-y-3">

          <div className="flex items-center gap-3">

            <DIcon className="h-6 w-6 text-danger" />

            <h3 className="font-bold">

              {disaster.disasterType === "None"
                ? "No Disaster Detected"
                : `${disaster.disasterType} Detected`
              }

            </h3>

          </div>

          <p className="text-sm text-muted-foreground">
            City: {disaster.city}
          </p>

          <div className={
            disaster.disasterType === "None"
              ? "text-success font-semibold"
              : "text-danger font-semibold"
          }>

            {disaster.disasterType === "None"
              ? "Weather Normal"
              : "HIGH RISK ACTIVE"
            }

          </div>

        </motion.div>

      )}

    </div>
  );
};

export default DisasterPage;