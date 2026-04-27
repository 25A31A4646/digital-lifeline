export type RiskLevel = "Low" | "Medium" | "High";

export type DisasterType = "Flood" | "Cyclone" | "Storm" | "None";

export interface RiskResult {
  risk: RiskLevel;
  disaster: DisasterType;
  score: number;
}

export function calculateDisasterRisk(
  rain: number,
  wind: number,
  temp: number
): RiskResult {

  let score = 0;

  // 🌧 Rain impact
  if (rain > 80) score += 50;
  else if (rain > 50) score += 30;
  else if (rain > 30) score += 15;

  // 🌬 Wind impact
  if (wind > 90) score += 50;
  else if (wind > 60) score += 30;
  else if (wind > 40) score += 15;

  // 🌡 Temperature extreme (optional signal)
  if (temp > 40) score += 10;

  // 🎯 Risk classification
  let risk: RiskLevel = "Low";
  let disaster: DisasterType = "None";

  if (score >= 80) {
    risk = "High";
    disaster = rain > wind ? "Flood" : "Cyclone";
  } 
  else if (score >= 40) {
    risk = "Medium";
    disaster = "Storm";
  }

  return { risk, disaster, score };
}