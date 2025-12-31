"use client";

import { createClient } from "@/utils/supabase/client";
import { useState } from "react";

interface UsageData {
  screens: {
    current: number;
    max: number | null;
    unlimited: boolean;
    percentage: number;
  };
  storage: {
    current_gb: number;
    max_gb: number | null;
    unlimited: boolean;
    percentage: number;
  };
}

export function useCheckLimits() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkScreenLimit = async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      const { data, error: rpcError } = await supabase.rpc(
        "check_screen_limit",
        {
          p_user_id: user.id,
        }
      );

      if (rpcError) {
        throw rpcError;
      }

      return data as boolean;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const checkStorageLimit = async (fileSizeBytes: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      const { data, error: rpcError } = await supabase.rpc(
        "check_storage_limit",
        {
          p_user_id: user.id,
          p_file_size: fileSizeBytes,
        }
      );

      if (rpcError) {
        throw rpcError;
      }

      return data as boolean;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getUserUsage = async (): Promise<UsageData | null> => {
    try {
      setLoading(true);
      setError(null);

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      const { data, error: rpcError } = await supabase.rpc("get_user_usage", {
        p_user_id: user.id,
      });

      if (rpcError) {
        throw rpcError;
      }

      return data as UsageData;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    checkScreenLimit,
    checkStorageLimit,
    getUserUsage,
    loading,
    error,
  };
}
