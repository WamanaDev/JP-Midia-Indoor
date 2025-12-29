// app/api/weather/route.ts
import { NextResponse } from "next/server";

const CACHE_TIME = 1000 * 60 * 5; // 5 minutos
const cache = new Map<string, { data: any; expires: number }>();

/* ================= CITY -> LAT/LON ================= */
const CITIES: Record<string, { lat: number; lon: number }> = {
  "Dubai, AE": { lat: 25.2048, lon: 55.2708 },
  "São Paulo, BR": { lat: -23.5505, lon: -46.6333 },
  "New York, US": { lat: 40.7128, lon: -74.006 },
  "Paris, FR": { lat: 48.8566, lon: 2.3522 },
  "London, UK": { lat: 51.5072, lon: -0.1276 },
};

/* ================= GET ================= */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city");

  if (!city || !CITIES[city]) {
    return NextResponse.json(
      { error: "Cidade não suportada" },
      { status: 400 }
    );
  }

  /* ================= CACHE ================= */
  const cached = cache.get(city);
  if (cached && cached.expires > Date.now()) {
    return NextResponse.json(cached.data);
  }

  const { lat, lon } = CITIES[city];

  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`,
    { next: { revalidate: 300 } }
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: "Erro ao buscar clima" },
      { status: 500 }
    );
  }

  const json = await res.json();

  const data = {
    temperature: json.current_weather.temperature,
    unit: "C",
  };

  cache.set(city, {
    data,
    expires: Date.now() + CACHE_TIME,
  });

  return NextResponse.json(data);
}
