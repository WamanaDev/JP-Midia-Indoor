// app/api/v1/clients/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase.admin";

export async function POST(req: NextRequest) {
  /**
   * 🔐 Autenticação da API
   */
  const auth = req.headers.get("authorization");

  if (auth !== `Bearer ${process.env.API_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  if (!body.name || !body.user_id) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  /**
   * Admin pode inserir sem RLS
   */
  const { error } = await supabaseAdmin.from("clients").insert({
    name: body.name,
    company_name: body.company_name,
    cnpj: body.cnpj,
    user_id: body.user_id,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");

  if (auth !== `Bearer ${process.env.API_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin.from("clients").select("*");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
