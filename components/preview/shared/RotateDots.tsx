interface RotateDotsProps {
  count: number;
  index: number;
  className?: string;
  accent?: string;
}

/** Indicador de posição na rotação — só aparece quando há mais de uma entrada. */
export function RotateDots({ count, index, className = "", accent = "bg-amber-400" }: RotateDotsProps) {
  if (count <= 1) return null;

  return (
    <div className={`flex gap-1.5 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className={`w-1.5 h-1.5 rounded-full ${i === index ? accent : "bg-white/25"}`} />
      ))}
    </div>
  );
}
