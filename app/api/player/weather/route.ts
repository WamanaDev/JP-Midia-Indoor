// app/api/weather/route.ts
import { getClientIp } from "@/lib/get-client-ip";
import { rateLimit } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  if (!rateLimit(getClientIp(req))) {
    return NextResponse.json(
      { error: "Muitas requisições, tente novamente em instantes" },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(req.url);

  const lat = Number(searchParams.get("lat"));
  const lon = Number(searchParams.get("lon"));

  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    return NextResponse.json(
      { error: "Localização inválida" },
      { status: 400 }
    );
  }

  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`,
    {
      next: { revalidate: 300 }, // 5 minutos
    }
  );

  const json = await res.json();

  return NextResponse.json({
    temperature: json.current_weather?.temperature ?? null,
    unit: "C",
    weathercode: json.current_weather?.weathercode ?? null,
    isDay: json.current_weather?.is_day === 1,
  });
}
