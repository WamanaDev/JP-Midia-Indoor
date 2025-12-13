// lib/auth.ts
import { NextRequest } from "next/server";

export function authenticateApi(req: NextRequest) {
  const auth = req.headers.get("authorization");

  if (auth !== `Bearer ${process.env.API_KEY}`) {
    return null;
  }

  return { id: "api-user" }; // ou escopo customizado
}
