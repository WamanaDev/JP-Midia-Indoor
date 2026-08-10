// lib/format/cnpj.ts

/**
 * Keeps only valid CNPJ characters, capped at 14.
 * Since the 2026 Receita Federal rollout, the first 12 positions (the
 * "base") accept digits or uppercase letters; the last 2 (the check
 * digits) are always numeric.
 */
export function onlyCnpjChars(value: string): string {
  const alnum = value.toUpperCase().replace(/[^0-9A-Z]/g, "");
  const base = alnum.slice(0, 12);
  const checkDigits = alnum.slice(12, 14).replace(/[^0-9]/g, "");
  return (base + checkDigits).slice(0, 14);
}

/** Formats as 00.000.000/0000-00 while the user types (alphanumeric-aware). */
export function formatCnpj(value: string): string {
  const chars = onlyCnpjChars(value);

  let out = chars.slice(0, 2);
  if (chars.length > 2) out += "." + chars.slice(2, 5);
  if (chars.length > 5) out += "." + chars.slice(5, 8);
  if (chars.length > 8) out += "/" + chars.slice(8, 12);
  if (chars.length > 12) out += "-" + chars.slice(12, 14);

  return out;
}

/** Numeric value of a CNPJ character per Receita Federal's alphanumeric rule ('0'-'9' -> 0-9, 'A'-'Z' -> 17-42). */
function cnpjCharValue(char: string): number {
  return char.charCodeAt(0) - 48;
}

/** Validates the CNPJ check digits (mod-11 algorithm over character values). */
export function isValidCnpj(value: string): boolean {
  const chars = onlyCnpjChars(value);
  if (chars.length !== 14) return false;
  if (/^(.)\1{13}$/.test(chars)) return false; // all same character

  const calcCheckDigit = (base: string, weights: number[]) => {
    const sum = base
      .split("")
      .reduce((acc, char, i) => acc + cnpjCharValue(char) * weights[i], 0);
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const base = chars.slice(0, 12);
  const digit1 = calcCheckDigit(base, weights1);
  const digit2 = calcCheckDigit(base + digit1, weights2);

  return chars.slice(12) === `${digit1}${digit2}`;
}
