// app/api/geocoding/route.ts
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
  const query = searchParams.get("q");

  if (!query || query.length < 3) {
    return NextResponse.json({ results: [] });
  }

  const normalized = query
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");

  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      normalized
    )}&count=8&language=pt&format=json`,
    {
      next: { revalidate: 60 * 60 * 24 }, // 24h
    }
  );

  const json = await res.json();

  const results =
    json.results?.map((r: any) => ({
      name: r.name,
      country: r.country_code,
      lat: r.latitude,
      lon: r.longitude,
      timezone: r.timezone,
      label: `${r.name}, ${r.country_code}`,
    })) ?? [];

  return NextResponse.json({ results });
}
