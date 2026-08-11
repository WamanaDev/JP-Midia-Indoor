"use client";

import { LimitReachedModal } from "@/components/dashboard/LimitReachedModal";
import { UsageBadge } from "@/components/dashboard/UsageBadge";
import { useCheckLimits } from "@/hooks/useCheckLimits";
import { Client } from "@/interfaces/Clients";
import { Playlist } from "@/interfaces/Playlists";
import { Screen as ScreenProps } from "@/interfaces/Screens";
import { Plus, Users } from "lucide-react";
import { useState } from "react";
import { ScreenCard } from "./ScreenCard";
import { ScreenForm } from "./ScreenForm";

interface Props {
  screens: ScreenProps[] | null;
  clients: Client[] | null;
  playlists: Playlist[] | null;
  currentScreens: number;
  maxScreens: number | null;
}

export function Screens({
  screens,
  clients,
  playlists,
  currentScreens,
  maxScreens,
}: Props) {
  const [editingScreen, setEditingScreen] = useState<ScreenProps | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [usageData, setUsageData] = useState<any>(null);

  const { checkScreenLimit, getUserUsage, loading } = useCheckLimits();

  const handleCreateScreen = async () => {
    // Verificar se pode criar mais telas
    const canCreate = await checkScreenLimit();

    if (!canCreate) {
      // Buscar dados de uso para mostrar no modal
      const usage = await getUserUsage();
      setUsageData(usage);
      setShowLimitModal(true);
      return;
    }

    // Se pode criar, mostrar o formulário
    setEditingScreen(null);
    setShowForm(true);
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Telas</h2>
          <p className="text-gray-500">Gerencie suas telas</p>
        </div>

        <button
          onClick={handleCreateScreen}
          disabled={loading}
          className="cursor-pointer flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Verificando...
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Cadastrar tela
            </>
          )}
        </button>
      </header>

      <UsageBadge label="Telas" current={currentScreens} max={maxScreens} />

      {/* Modal de Limite Atingido */}
      {usageData && (
        <LimitReachedModal
          isOpen={showLimitModal}
          onClose={() => setShowLimitModal(false)}
          limitType="screens"
          currentUsage={usageData.screens.current}
          maxUsage={usageData.screens.max}
        />
      )}

      {showForm && (
        <ScreenForm
          screen={editingScreen ?? undefined}
          clients={clients}
          playlists={playlists}
          onCancel={() => setShowForm(false)}
        />
      )}

      {!screens || screens.length === 0 ? (
        <div className="text-center p-12 border rounded-xl">
          <Users className="mx-auto w-12 h-12 text-gray-400" />
          <p className="mt-4 text-gray-500">Nenhuma tela cadastrada</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {screens &&
            screens.map((screen) => (
              <ScreenCard
                key={screen.id}
                screen={screen}
                onEdit={(screen) => {
                  setEditingScreen(screen);
                  setShowForm(true);
                }}
              />
            ))}
        </div>
      )}
    </div>
  );
}
