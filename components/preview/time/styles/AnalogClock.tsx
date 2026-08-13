"use client";

interface AnalogClockProps {
  variant: "analog-minimal" | "analog-neon" | "analog-corporate";
  hourDeg: number;
  minuteDeg: number;
  size?: "sm" | "lg";
}

/**
 * Os 3 mostradores analógicos aprovados (minimal/neon/corporate), num único
 * componente reusado pelo overlay (`size="sm"`) e pela tela cheia
 * (`size="lg"`) — antes eram JSX duplicado quase idêntico nos dois lugares.
 */
export function AnalogClock({ variant, hourDeg, minuteDeg, size = "sm" }: AnalogClockProps) {
  const dim = size === "lg" ? "w-40 h-40" : "w-24 h-24";

  if (variant === "analog-neon") {
    return (
      <div className={`${dim} rounded-full bg-black border border-cyan-400 shadow-[0_0_20px_#22d3ee] relative`}>
        <div
          className="absolute w-1.5 h-[28%] bg-cyan-400 top-[20%] left-1/2 origin-bottom shadow-[0_0_8px_#22d3ee] transition-transform duration-500"
          style={{ transform: `translateX(-50%) rotate(${hourDeg}deg)` }}
        />
        <div
          className="absolute w-1 h-[38%] bg-cyan-300 top-[12%] left-1/2 origin-bottom shadow-[0_0_12px_#67e8f9] transition-transform duration-300"
          style={{ transform: `translateX(-50%) rotate(${minuteDeg}deg)` }}
        />
        <div className="absolute w-2 h-2 bg-cyan-400 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
    );
  }

  if (variant === "analog-corporate") {
    return (
      <div className={`${dim} rounded-full bg-white border border-gray-300 shadow relative`}>
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-[8%] bg-gray-400 top-[4%] left-1/2 origin-bottom"
            style={{ transform: `translateX(-50%) rotate(${i * 30}deg)` }}
          />
        ))}
        <div
          className="absolute w-1.5 h-[28%] bg-gray-700 top-[20%] left-1/2 origin-bottom transition-transform duration-500"
          style={{ transform: `translateX(-50%) rotate(${hourDeg}deg)` }}
        />
        <div
          className="absolute w-1 h-[38%] bg-gray-500 top-[12%] left-1/2 origin-bottom transition-transform duration-300"
          style={{ transform: `translateX(-50%) rotate(${minuteDeg}deg)` }}
        />
        <div className="absolute w-2 h-2 bg-gray-700 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
    );
  }

  // analog-minimal
  return (
    <div className={`${dim} rounded-full border-2 border-white relative`}>
      <div
        className="absolute w-1 h-[28%] bg-white top-[20%] left-1/2 origin-bottom transition-transform duration-500"
        style={{ transform: `translateX(-50%) rotate(${hourDeg}deg)` }}
      />
      <div
        className="absolute w-0.5 h-[38%] bg-white top-[12%] left-1/2 origin-bottom transition-transform duration-300"
        style={{ transform: `translateX(-50%) rotate(${minuteDeg}deg)` }}
      />
      <div className="absolute w-2 h-2 bg-white rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
    </div>
  );
}
