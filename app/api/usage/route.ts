import { getUserSubscriptionStatus } from "@/lib/stripe/subscription-utils";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// ✅ Cache de 60 segundos
export const revalidate = 60;

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Verificar status da subscription
    const { isActive, isPastDue, subscription, plan } =
      await getUserSubscriptionStatus(user.id);

    // ✅ Se o pagamento está pendente, retornar erro 402
    if (isPastDue) {
      return NextResponse.json(
        {
          error: "Pagamento pendente. Por favor, regularize sua assinatura.",
          isPastDue: true,
          subscription_status: subscription?.status,
        },
        { status: 402 } // 402 Payment Required
      );
    }

    // ✅ Se não está ativo (cancelado, expirado, etc), bloquear acesso
    if (!isActive) {
      return NextResponse.json(
        {
          error: "Assinatura inativa. Por favor, renove sua assinatura.",
          isActive: false,
          subscription_status: subscription?.status,
        },
        { status: 403 } // 403 Forbidden
      );
    }

    // Buscar perfil com plano
    const { data: profile } = await supabase
      .from("profiles")
      .select("bytes_usage")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Contar telas
    const { count: screensCount } = await supabase
      .from("screens")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    // Calcular storage usado
    const storageUsedBytes = profile.bytes_usage || 0;
    const storageUsedGb = storageUsedBytes / (1024 * 1024 * 1024);

    // Limites do plano
    const maxScreens = plan?.max_screens || 1;
    const maxStorageGb = plan?.storage_gb || 1;

    // Verificar se é ilimitado (null = ilimitado)
    const screensUnlimited = maxScreens === null;
    const storageUnlimited = maxStorageGb === null;

    // Calcular percentuais
    const screensPercentage = screensUnlimited
      ? 0
      : ((screensCount || 0) / maxScreens) * 100;

    const storagePercentage = storageUnlimited
      ? 0
      : (storageUsedGb / maxStorageGb) * 100;

    // ✅ IMPORTANTE: Retornar is_past_due e subscription_status
    return NextResponse.json({
      screens: {
        current: screensCount || 0,
        max: screensUnlimited ? null : maxScreens,
        unlimited: screensUnlimited,
        percentage: screensPercentage,
      },
      storage: {
        current_gb: parseFloat(storageUsedGb.toFixed(2)),
        max_gb: storageUnlimited ? null : maxStorageGb,
        unlimited: storageUnlimited,
        percentage: storagePercentage,
      },
      subscription_status: subscription?.status || "none",
      is_active: isActive,
      is_past_due: isPastDue, // ✅ Adicionar aqui
      plan_name: plan?.name || "Freemium",
    });
  } catch (error: any) {
    console.error("Erro ao buscar usage:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao buscar dados de uso" },
      { status: 500 }
    );
  }
}
