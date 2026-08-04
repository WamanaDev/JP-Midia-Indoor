import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  if (error) {
    const params = new URLSearchParams({ error: "oauth" });

    if (errorDescription) {
      params.set("message", errorDescription);
    }

    return NextResponse.redirect(`${origin}/auth/signin?${params.toString()}`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/signin?error=oauth`);
  }

  try {
    const supabase = await createClient();
    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error("OAuth exchange error:", exchangeError);
      return NextResponse.redirect(`${origin}/auth/signin?error=oauth`);
    }

    return NextResponse.redirect(`${origin}/dashboard`);
  } catch (err) {
    console.error("OAuth callback failed:", err);
    return NextResponse.redirect(`${origin}/auth/signin?error=oauth`);
  }
}
