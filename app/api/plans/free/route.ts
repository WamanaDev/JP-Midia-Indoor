import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Buscar plano gratuito pelo nome "Free" E price null
    const { data: plan, error } = await supabase
      .from("plans")
      .select("*")
      .eq("name", "Free")
      .is("price", null)
      .single();

    if (error || !plan) {
      console.error("❌ Plano gratuito não encontrado:", error);
      return NextResponse.json(
        { error: "Plano gratuito não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ plan });
  } catch (error: any) {
    console.error("❌ Erro ao buscar plano gratuito:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
