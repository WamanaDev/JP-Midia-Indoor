"use client";

import { useAnimatedValue } from "@/components/preview/shared/useAnimatedValue";

interface GaugeWeatherProps {
  value: string;
  /** Raw temperature in Celsius, used only to position the gauge arc. */
  celsius: number | null;
  size?: "sm" | "lg";
}

const MIN_C = -10;
const MAX_C = 45;
const RADIUS = 34;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Circular gauge showing the temperature as an arc. The fill percentage is
 * a plain number animated by GSAP (`useAnimatedValue`) into an SVG
 * `stroke-dashoffset` — `react-native-svg` exposes the same Circle/
 * strokeDashoffset API, so this maps over to React Native almost as-is.
 */
export function GaugeWeather({ value, celsius, size = "sm" }: GaugeWeatherProps) {
  const clamped =
    celsius === null
      ? 0
      : Math.min(1, Math.max(0, (celsius - MIN_C) / (MAX_C - MIN_C)));

  const { progress } = useAnimatedValue(
    { progress: 0 },
    { progress: clamped, duration: 0.8, ease: "power2.out" },
    [clamped],
  );

  const offset = CIRCUMFERENCE * (1 - progress);
  const px = size === "lg" ? 180 : 96;

  return (
    <div className="relative flex items-center justify-center" style={{ width: px, height: px }}>
      <svg width={px} height={px} viewBox="0 0 96 96" className="-rotate-90">
        <circle
          cx={48}
          cy={48}
          r={RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={6}
        />
        <circle
          cx={48}
          cy={48}
          r={RADIUS}
          fill="none"
          stroke="#facc15"
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
        />
      </svg>

      <span className={`absolute font-semibold text-white ${size === "lg" ? "text-3xl" : "text-lg"}`}>
        {value}
      </span>
    </div>
  );
}
