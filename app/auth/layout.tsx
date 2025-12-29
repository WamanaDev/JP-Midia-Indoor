import { ReactNode } from "react";
import { Monitor } from "lucide-react"; // se estiver usando lucide
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#1E3A8A] via-[#1E3A8A] to-[#3B82F6] flex items-center justify-center p-4">
      {/* Background SVG */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-white mb-4">
            <div className="w-12 h-12 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Image src="/icons/Icons/logoquadrada.png" fill alt="JP Mídia" />
            </div>
            <span className="text-2xl font-bold">
              <span className="text-3xl">M</span>
              ídia <span className="text-3xl">I</span>
              ndoor
            </span>
          </div>
        </div>

        {/* Conteúdo da página */}
        {children}
      </div>
    </div>
  );
}
