import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Supabase environment variables are not configured. Set NEXT_PUBLIC_SUPABASE_URL and either NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY.",
  );
}

const resolvedSupabaseUrl = supabaseUrl;
const resolvedSupabaseKey = supabaseKey;

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    resolvedSupabaseUrl,
    resolvedSupabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const pathname = request.nextUrl.pathname;

  const isProtectedRoute = pathname.startsWith("/dashboard");
  if (!isProtectedRoute) {
    return supabaseResponse;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/signin";
    return NextResponse.redirect(url);
  }

  // These two need to stay reachable even for a past_due user, otherwise
  // they could never see why they're blocked or go fix their payment.
  if (
    pathname === "/dashboard/payment-required" ||
    pathname.startsWith("/dashboard/payment-required/") ||
    pathname === "/dashboard/subscriptions" ||
    pathname.startsWith("/dashboard/subscriptions/")
  ) {
    return supabaseResponse;
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (subscription?.status === "past_due") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard/payment-required";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)$).*)",
  ],
};
