import {
  Sun,
  Moon,
  CloudSun,
  CloudMoon,
  Cloud,
  CloudFog,
  CloudRain,
  CloudLightning,
  CloudSnow,
  type LucideIcon,
} from "lucide-react";

export type WeatherCondition =
  | "clear"
  | "partly"
  | "cloudy"
  | "fog"
  | "rain"
  | "storm"
  | "snow";

/**
 * Códigos WMO retornados pelo `current_weather.weathercode` da Open-Meteo.
 * https://open-meteo.com/en/docs (seção "WMO Weather interpretation codes")
 */
export function conditionFromCode(
  code: number | null | undefined
): WeatherCondition {
  if (code == null) return "clear";
  if (code === 0) return "clear";
  if (code === 1 || code === 2) return "partly";
  if (code === 3) return "cloudy";
  if (code === 45 || code === 48) return "fog";
  if (code >= 51 && code <= 67) return "rain";
  if (code >= 71 && code <= 77) return "snow";
  if (code >= 80 && code <= 82) return "rain";
  if (code >= 85 && code <= 86) return "snow";
  if (code >= 95) return "storm";
  return "cloudy";
}

export function weatherIcon(
  condition: WeatherCondition,
  isDay: boolean
): LucideIcon {
  switch (condition) {
    case "clear":
      return isDay ? Sun : Moon;
    case "partly":
      return isDay ? CloudSun : CloudMoon;
    case "cloudy":
      return Cloud;
    case "fog":
      return CloudFog;
    case "rain":
      return CloudRain;
    case "storm":
      return CloudLightning;
    case "snow":
      return CloudSnow;
  }
}

/** Dia/noite a partir da hora local, usado como fallback quando a API não informa `isDay`. */
export function dayPartFromDate(date: Date): "day" | "night" {
  const h = date.getHours();
  return h >= 6 && h < 18 ? "day" : "night";
}
