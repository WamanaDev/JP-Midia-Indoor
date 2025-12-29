"use client";

import { createClient } from "@/utils/supabase/client";
import { Chrome, MessageCircle } from "lucide-react";

export default function SocialAuth() {
  const supabase = createClient();

  const signIn = async (provider: "google" | "discord") => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="space-y-3">
      <button
        onClick={() => signIn("google")}
        className="cursor-pointer w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-3 bg-white hover:bg-gray-50 transition"
      >
        <Chrome className="w-5 h-5" />
        <span className="font-medium text-gray-700">Entrar com Google</span>
      </button>
    </div>
  );
}
