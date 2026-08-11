interface UsageBadgeProps {
  label: string;
  current: number;
  /** Omitido = só contagem, sem limite. null = limite existe mas é ilimitado. */
  max?: number | null;
  unit?: string;
  decimals?: number;
  /**
   * Texto pronto pra exibir no lugar de `current` formatado (ex: "3.1 MB"
   * quando `current` é um valor de GB pequeno demais pra aparecer com
   * `decimals` casas). `current`/`max` continuam sendo usados pro cálculo
   * de porcentagem e cor, só a exibição do número atual muda.
   */
  formattedCurrent?: string;
}

export function UsageBadge({
  label,
  current,
  max,
  unit = "",
  decimals = 0,
  formattedCurrent,
}: UsageBadgeProps) {
  const hasLimit = max !== undefined;
  const isUnlimited = hasLimit && max === null;
  const percentage =
    hasLimit && !isUnlimited && (max as number) > 0
      ? (current / (max as number)) * 100
      : 0;

  const colorClasses = !hasLimit
    ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
    : isUnlimited
    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
    : percentage >= 90
    ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
    : percentage >= 80
    ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
    : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400";

  const currentFmt =
    formattedCurrent ?? (decimals > 0 ? current.toFixed(decimals) : current);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${colorClasses}`}
    >
      <span className="font-normal opacity-80">{label}:</span>
      {currentFmt}
      {hasLimit && (isUnlimited ? " / ∞" : ` / ${max}`)}
      {unit && ` ${unit}`}
    </span>
  );
}
