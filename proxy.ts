import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const pathname = request.nextUrl.pathname;

  // CRÍTICO: Se já está na página de pagamento pendente, NÃO redirecionar
  if (
    pathname === "/dashboard/payment-required" ||
    pathname.startsWith("/dashboard/payment-required/")
  ) {
    return supabaseResponse;
  }

  // Se está na página de subscriptions, permitir
  if (
    pathname === "/dashboard/subscriptions" ||
    pathname.startsWith("/dashboard/subscriptions/")
  ) {
    return supabaseResponse;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Rotas protegidas que requerem autenticação
  const protectedRoutes = ["/dashboard"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/signin";
    return NextResponse.redirect(url);
  }

  // Se usuário está autenticado, verificar status da assinatura
  if (user && isProtectedRoute) {
    // Buscar subscription
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("status, cancel_at_period_end")
      .eq("user_id", user.id)
      .single();

    // Se pagamento está pendente (past_due), redirecionar para página de bloqueio
    if (subscription?.status === "past_due") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard/payment-required";
      return NextResponse.redirect(url);
    }

    // Verificar limites apenas se não estiver em past_due
    if (subscription?.status === "active" || !subscription) {
      // Rotas que criam telas
      const screenCreationRoutes = ["/dashboard/screens/new", "/api/screens"];

      if (
        screenCreationRoutes.some((route) => pathname.startsWith(route)) &&
        request.method === "POST"
      ) {
        // Buscar plano do usuário
        const { data: profile } = await supabase
          .from("profiles")
          .select("plan_id")
          .eq("id", user.id)
          .single();

        if (profile?.plan_id) {
          // Buscar detalhes do plano
          const { data: plan } = await supabase
            .from("plans")
            .select("max_screens")
            .eq("id", profile.plan_id)
            .single();

          // Contar telas do usuário
          const { count: screenCount } = await supabase
            .from("screens")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id);

          const maxScreens = plan?.max_screens;

          // Se tem limite e atingiu, bloquear
          if (
            maxScreens !== null &&
            screenCount !== null &&
            screenCount >= maxScreens
          ) {
            return NextResponse.json(
              {
                error: "Limite de telas atingido",
                message: `Você atingiu o limite de ${maxScreens} telas do seu plano. Faça upgrade para criar mais telas.`,
                upgradeUrl: "/pricing",
              },
              { status: 403 }
            );
          }
        }
      }

      // Rotas de upload de mídia
      const uploadRoutes = ["/dashboard/medias/upload", "/api/medias/upload"];

      if (
        uploadRoutes.some((route) => pathname.startsWith(route)) &&
        request.method === "POST"
      ) {
        // Buscar plano do usuário
        const { data: profile } = await supabase
          .from("profiles")
          .select("plan_id")
          .eq("id", user.id)
          .single();

        if (profile?.plan_id) {
          // Buscar detalhes do plano
          const { data: plan } = await supabase
            .from("plans")
            .select("storage_gb")
            .eq("id", profile.plan_id)
            .single();

          // Buscar uso atual de storage
          const { data: usageData } = await supabase.rpc("get_user_usage", {
            p_user_id: user.id,
          });

          const maxStorageGB = plan?.storage_gb;
          const currentStorageGB = usageData?.storage?.current_gb || 0;

          // Verificar tamanho do arquivo no header
          const contentLength = request.headers.get("content-length");
          const fileSizeGB = contentLength
            ? parseInt(contentLength) / (1024 * 1024 * 1024)
            : 0;

          // Se tem limite e vai ultrapassar, bloquear
          if (
            maxStorageGB !== null &&
            currentStorageGB + fileSizeGB > maxStorageGB
          ) {
            return NextResponse.json(
              {
                error: "Limite de armazenamento atingido",
                message: `Você atingiu o limite de ${maxStorageGB}GB do seu plano. Faça upgrade para mais armazenamento.`,
                upgradeUrl: "/pricing",
              },
              { status: 403 }
            );
          }
        }
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)$).*)",
  ],
};
