// lib/rate-limit.ts
const requests = new Map<string, number[]>();

export function rateLimit(ip: string, limit = 60, windowMs = 60_000) {
  const now = Date.now();
  const timestamps = requests.get(ip) || [];

  const filtered = timestamps.filter((t) => now - t < windowMs);

  if (filtered.length >= limit) return false;

  filtered.push(now);
  requests.set(ip, filtered);

  return true;
}
