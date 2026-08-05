// lib/format/cnpj.ts

/** Keeps only digits, capped at 14 (a CNPJ's length). */
export function onlyCnpjDigits(value: string): string {
  return value.replace(/\D/g, "").slice(0, 14);
}

/** Formats digits as 00.000.000/0000-00 while the user types. */
export function formatCnpj(value: string): string {
  const digits = onlyCnpjDigits(value);

  let out = digits.slice(0, 2);
  if (digits.length > 2) out += "." + digits.slice(2, 5);
  if (digits.length > 5) out += "." + digits.slice(5, 8);
  if (digits.length > 8) out += "/" + digits.slice(8, 12);
  if (digits.length > 12) out += "-" + digits.slice(12, 14);

  return out;
}

/** Validates the CNPJ check digits (standard mod-11 algorithm). */
export function isValidCnpj(value: string): boolean {
  const digits = onlyCnpjDigits(value);
  if (digits.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(digits)) return false; // all same digit

  const calcCheckDigit = (base: string, weights: number[]) => {
    const sum = base
      .split("")
      .reduce((acc, digit, i) => acc + Number(digit) * weights[i], 0);
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const digit1 = calcCheckDigit(digits.slice(0, 12), weights1);
  const digit2 = calcCheckDigit(digits.slice(0, 12) + digit1, weights2);

  return digits === digits.slice(0, 12) + `${digit1}${digit2}`;
}
