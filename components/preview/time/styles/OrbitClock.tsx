"use client";

import { useAnimatedValue } from "@/components/preview/shared/useAnimatedValue";

interface OrbitClockProps {
  time: string;
}

/**
 * A glowing dot orbits a ring around the digital time. The orbit angle is
 * a plain number driven by GSAP (`useAnimatedValue`), turned into a
 * position with basic trig — no DOM manipulation, so the same math can
 * drive a React Native `Animated`/Reanimated value later.
 */
export function OrbitClock({ time }: OrbitClockProps) {
  const { angle } = useAnimatedValue(
    { angle: 0 },
    { angle: 360, duration: 8, repeat: -1, ease: "none" },
  );

  const radius = 42;
  const rad = (angle * Math.PI) / 180;
  const x = Math.cos(rad) * radius;
  const y = Math.sin(rad) * radius;

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <div className="absolute inset-0 rounded-full border border-white/25" />

      <div
        className="absolute w-2.5 h-2.5 rounded-full bg-cyan-300 shadow-[0_0_10px_3px_rgba(34,211,238,0.7)]"
        style={{
          transform: `translate(${x}px, ${y}px)`,
        }}
      />

      <span className="text-lg font-semibold text-white tabular-nums">
        {time}
      </span>
    </div>
  );
}
