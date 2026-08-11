"use client";

import { useAnimatedValue } from "@/components/preview/shared/useAnimatedValue";

interface FlipDigitClockProps {
  time: string;
}

/**
 * Every time the displayed time string changes, the whole readout does a
 * quick 3D flip-in (rotateX). Driven by GSAP animating a single number
 * (`flip`) rather than a CSS keyframe, so the same tween recipe can drive
 * a native `transform: [{ rotateX }]` in React Native later.
 */
export function FlipDigitClock({ time }: FlipDigitClockProps) {
  const { flip } = useAnimatedValue(
    { flip: -90 },
    { flip: 0, duration: 0.45, ease: "back.out(1.7)" },
    [time],
  );

  return (
    <div style={{ perspective: 400 }}>
      <div
        className="bg-black px-6 py-3 rounded-xl shadow-xl text-white font-mono text-2xl tabular-nums"
        style={{ transform: `rotateX(${flip}deg)` }}
      >
        {time}
      </div>
    </div>
  );
}
