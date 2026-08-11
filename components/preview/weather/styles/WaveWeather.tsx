"use client";

import { useAnimatedValue } from "@/components/preview/shared/useAnimatedValue";

interface WaveWeatherProps {
  value: string;
}

/**
 * A soft "breathing" blob behind the temperature reading — GSAP loops a
 * plain scale/opacity value (`useAnimatedValue`) rather than a CSS
 * keyframe, so the same recipe (yoyo tween, 0.6..1 range) transfers to a
 * React Native Reanimated shared value later.
 */
export function WaveWeather({ value }: WaveWeatherProps) {
  const { scale, opacity } = useAnimatedValue(
    { scale: 1, opacity: 0.35 },
    {
      scale: 1.25,
      opacity: 0.15,
      duration: 1.8,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    },
  );

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <div
        className="absolute w-16 h-16 rounded-full bg-sky-400"
        style={{ transform: `scale(${scale})`, opacity }}
      />

      <div className="relative px-4 py-2 rounded-xl bg-black/30 backdrop-blur-sm">
        <span className="text-lg font-semibold text-white">{value}</span>
      </div>
    </div>
  );
}
