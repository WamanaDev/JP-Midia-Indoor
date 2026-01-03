import { useEffect, useState } from "react";

interface UsageLimits {
  screens: {
    current: number;
    max: number | null;
    canCreate: boolean;
    unlimited: boolean;
  };
  storage: {
    current_gb: number;
    max_gb: number | null;
    canUpload: (fileSizeBytes: number) => boolean;
    unlimited: boolean;
  };
  loading: boolean;
}

export function useUsageLimits(): UsageLimits {
  const [limits, setLimits] = useState<UsageLimits>({
    screens: {
      current: 0,
      max: null,
      canCreate: true,
      unlimited: true,
    },
    storage: {
      current_gb: 0,
      max_gb: null,
      canUpload: () => true,
      unlimited: true,
    },
    loading: true,
  });

  useEffect(() => {
    const fetchLimits = async () => {
      try {
        const response = await fetch("/api/usage");
        if (response.ok) {
          const data = await response.json();

          const canCreateScreen =
            data.screens.unlimited || data.screens.current < data.screens.max;

          const canUpload = (fileSizeBytes: number) => {
            if (data.storage.unlimited) return true;
            const fileSizeGB = fileSizeBytes / 1024 ** 3;
            return data.storage.current_gb + fileSizeGB <= data.storage.max_gb;
          };

          setLimits({
            screens: {
              current: data.screens.current,
              max: data.screens.max,
              canCreate: canCreateScreen,
              unlimited: data.screens.unlimited,
            },
            storage: {
              current_gb: data.storage.current_gb,
              max_gb: data.storage.max_gb,
              canUpload,
              unlimited: data.storage.unlimited,
            },
            loading: false,
          });
        }
      } catch (error) {
        console.error("Erro ao buscar limites:", error);
        setLimits((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchLimits();
    const interval = setInterval(fetchLimits, 10000); // Atualizar a cada 10s
    return () => clearInterval(interval);
  }, []);

  return limits;
}
