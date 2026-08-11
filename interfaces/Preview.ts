export type WeatherLocation = {
  id: string;
  label: string;

  location?: {
    name: string;
    country: string;
    lat: number;
    lon: number;
  };

  unit?: "C" | "F";
};

export type LegacyLocation = {
  city?: string;
};

export type LocationValue = {
  name: string;
  country: string;
  lat: number;
  lon: number;
  timezone?: string;
};

export type ClockConfig = {
  id: string;
  label: string;
  format: "12h" | "24h";
  location?: LocationValue;
};

export type TimeConfig = {
  overlay: boolean;
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "";
  style:
    | "minimal"
    | "badge"
    | "card"
    | "digital"
    | "glass"
    | "flip"
    | "pulse"
    | "analog-minimal"
    | "analog-neon"
    | "analog-corporate"
    | "analog-tech"
    | "analog-dark"
    | "orbit"
    | "flip3d"
    | "sphere";
  layout: "vertical" | "horizontal";
  clocks: ClockConfig[];
};
