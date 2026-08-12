"use client";

import {
  upsertScreenAction,
  checkDeviceCode,
} from "@/app/dashboard/screens/actions";
import { Client } from "@/interfaces/Clients";
import { Playlist } from "@/interfaces/Playlists";
import { Screen } from "@/interfaces/Screens";
import { AlertCircle } from "lucide-react";
import { useActionState, useState } from "react";

interface ScreenFormProps {
  screen?: Screen; // edição
  clients: Client[] | null;
  playlists: Playlist[] | null;
  onCancel?: () => void;
}

export function ScreenForm({
  screen,
  clients,
  playlists,
  onCancel,
}: ScreenFormProps) {
  const isEditing = Boolean(screen?.id);
  const [step, setStep] = useState(1);
  const [code, setCode] = useState("");
  const [vinculation, setVinculation] = useState(false);
  const [error, setError] = useState("");
  const [state, formAction, isPending] = useActionState(upsertScreenAction, {
    error: null,
  });

  const handleCheckCode = async () => {
    if (!code.trim()) {
      setError("Informe o código de vinculação");
      return;
    }

    setError("");
    setVinculation(true);

    try {
      const result = await checkDeviceCode(code);

      if (!result.success) {
        setError(result.error);
        return;
      }

      setStep(2);
    } catch {
      setError("Erro inesperado ao validar o código");
    } finally {
      setVinculation(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#1F2937] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-xl font-bold text-[#111827] dark:text-white mb-6">
        {isEditing ? "Editar Dispositivo" : "Novo Dispositivo"}
      </h3>

      {state.error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-800 dark:text-red-300">
            {state.error}
          </p>
        </div>
      )}

      {!isEditing && step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#111827] dark:text-white">
              Código
            </label>
            {error && <span className="text-xs text-red-400">{error}</span>}
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleCheckCode();
                }
              }}
              required
              className={`mt-2 uppercase w-full px-4 py-2 border ${
                error
                  ? `border-red-400`
                  : `border-gray-300 dark:border-gray-600`
              } rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none bg-white dark:bg-gray-800 text-[#111827] dark:text-white`}
              placeholder="Código de vinculação"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              disabled={vinculation || !code.trim()}
              onClick={handleCheckCode}
              className="px-6 py-2 bg-[#3B82F6] text-white font-semibold rounded-lg hover:bg-[#1E3A8A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {vinculation ? "Vinculando" : "Vincular"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {(isEditing || step === 2) && (
        <form className="space-y-4" action={formAction}>
          {isEditing && <input type="hidden" name="id" value={screen!.id} />}
            {!isEditing && <input type="hidden" name="code" value={code} />}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nome */}
              <div>
                <label className="block text-sm font-medium mb-2">Nome</label>
                <input
                  name="name"
                  defaultValue={screen?.name ?? ""}
                  required
                  placeholder="Apelido do dispositivo"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#3B82F6] outline-none bg-white dark:bg-gray-800"
                />
              </div>

              {/* Localização */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Localização
                </label>
                <input
                  name="location"
                  defaultValue={screen?.location ?? ""}
                  required
                  placeholder="Ex: Recepção"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#3B82F6] outline-none bg-white dark:bg-gray-800"
                />
              </div>

              {/* Cliente */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Cliente
                </label>
                <select
                  name="client_id"
                  defaultValue={screen?.client_id ?? ""}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                >
                  {!clients || clients.length === 0 ? (
                    <option>Cadastre um cliente antes</option>
                  ) : (
                    <>
                      <option value="">Selecione um cliente</option>
                      {clients.map((client) => (
                        <option
                          key={client.id}
                          value={client.id}
                          selected={screen && client.id === screen.client_id}
                        >
                          {client.name} — {client.company_name}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              {/* Playlist */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Playlist
                </label>
                <select
                  name="playlist_id"
                  defaultValue={screen?.playlist_id ?? ""}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                >
                  {!playlists || playlists.length === 0 ? (
                    <option value="">
                      Cadastre uma playlist para vincular
                    </option>
                  ) : (
                    <>
                      <option value="">Selecione uma playlist</option>
                      {playlists.map((playlist) => (
                        <option
                          key={playlist.id}
                          value={playlist.id}
                          selected={
                            screen && playlist.id === screen.playlist_id
                          }
                        >
                          {playlist.name}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>
            </div>

            {/* Ativo */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="is_active"
                defaultChecked={screen?.is_active ?? true}
                className="w-5 h-5"
              />
              <label className="text-sm font-medium">Dispositivo ativo</label>
            </div>

            {/* Ações */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isPending}
                className="cursor-pointer px-6 py-2 bg-[#3B82F6] text-white font-semibold rounded-lg hover:bg-[#1E3A8A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? "Salvando..." : isEditing ? "Atualizar" : "Criar"}
              </button>

              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="cursor-pointer px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
              )}
            </div>
        </form>
      )}
    </div>
  );
}
