"use client";

import { sendAlertAction } from "@/app/dashboard/alerts/actions";
import { EmergencyAlert } from "@/interfaces/Alerts";
import { AlertCircle, CheckCircle2, Siren, Tv } from "lucide-react";
import { useActionState, useMemo, useRef, useState } from "react";
import { AlertCard } from "./AlertCard";

interface ScreenOption {
  id: string;
  name: string;
  location: string | null;
  is_active: boolean;
}

interface Props {
  screens: ScreenOption[];
  initialAlerts: EmergencyAlert[];
}

const DURATIONS = [
  { minutes: 1, label: "1 minuto" },
  { minutes: 5, label: "5 minutos" },
  { minutes: 10, label: "10 minutos" },
  { minutes: 30, label: "30 minutos" },
  { minutes: 60, label: "1 hora" },
];

export function Alerts({ screens, initialAlerts }: Props) {
  const [state, formAction, isPending] = useActionState(sendAlertAction, {
    error: null,
  });
  const [selectedScreens, setSelectedScreens] = useState<string[]>([]);
  const [expiredBatches, setExpiredBatches] = useState<string[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  const toggleScreen = (id: string) => {
    setSelectedScreens((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const allSelected = screens.length > 0 && selectedScreens.length === screens.length;

  const activeGroups = useMemo(() => {
    const map = new Map<string, EmergencyAlert[]>();
    for (const alert of initialAlerts) {
      if (expiredBatches.includes(alert.batch_id)) continue;
      const list = map.get(alert.batch_id) ?? [];
      list.push(alert);
      map.set(alert.batch_id, list);
    }
    return [...map.values()];
  }, [initialAlerts, expiredBatches]);

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold flex items-center gap-3">
          <Siren className="w-8 h-8 text-red-600" />
          Alerta de emergência
        </h2>
        <p className="text-gray-500">
          Manda uma mensagem em tela cheia, por cima de qualquer conteúdo, pras telas que você
          escolher.
        </p>
      </header>

      {activeGroups.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Alertas ativos agora
          </h3>
          {activeGroups.map((group) => (
            <AlertCard
              key={group[0].batch_id}
              batchId={group[0].batch_id}
              message={group[0].message}
              expiresAt={group[0].expires_at}
              screenNames={group.map((a) => a.screen?.name ?? "Tela")}
              onExpire={(batchId) =>
                setExpiredBatches((prev) => (prev.includes(batchId) ? prev : [...prev, batchId]))
              }
            />
          ))}
        </div>
      )}

      <div className="bg-white dark:bg-[#1F2937] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-xl font-bold text-[#111827] dark:text-white mb-6">Novo alerta</h3>

        {state.error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-800 dark:text-red-300">{state.error}</p>
          </div>
        )}

        {state.success && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
            <p className="text-sm text-green-800 dark:text-green-300">
              Alerta enviado. As telas selecionadas devem exibi-lo em instantes.
            </p>
          </div>
        )}

        <form
          ref={formRef}
          action={(formData) => {
            formAction(formData);
            setSelectedScreens([]);
            formRef.current?.reset();
          }}
          className="space-y-5"
        >
          <div>
            <label className="block text-sm font-medium mb-2">Mensagem</label>
            <textarea
              name="message"
              required
              rows={3}
              placeholder="Ex: Loja fechada por manutenção, retornamos às 14h."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white dark:bg-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Duração na tela</label>
            <select
              name="duration"
              defaultValue={5}
              className="w-full md:w-64 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            >
              {DURATIONS.map((d) => (
                <option key={d.minutes} value={d.minutes}>
                  {d.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              O alerta some sozinho depois desse tempo — mas dá pra encerrar antes, na lista
              acima.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Telas</label>
              {screens.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setSelectedScreens(allSelected ? [] : screens.map((s) => s.id))
                  }
                  className="cursor-pointer text-xs font-semibold text-red-600 dark:text-red-400 hover:underline"
                >
                  {allSelected ? "Limpar seleção" : "Selecionar todas"}
                </button>
              )}
            </div>

            {screens.length === 0 ? (
              <div className="text-center p-8 border border-dashed rounded-xl text-gray-500">
                <Tv className="mx-auto w-8 h-8 text-gray-400 mb-2" />
                Nenhuma tela cadastrada ainda.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
                {screens.map((screen) => (
                  <label
                    key={screen.id}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedScreens.includes(screen.id)
                        ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    <input
                      type="checkbox"
                      name="screen_ids"
                      value={screen.id}
                      checked={selectedScreens.includes(screen.id)}
                      onChange={() => toggleScreen(screen.id)}
                      className="w-4 h-4 accent-red-600"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#111827] dark:text-white truncate">
                        {screen.name}
                      </p>
                      {screen.location && (
                        <p className="text-xs text-gray-500 truncate">{screen.location}</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending || screens.length === 0}
            className="cursor-pointer flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Siren className="w-5 h-5" />
            {isPending ? "Enviando..." : "Disparar alerta"}
          </button>
        </form>
      </div>
    </div>
  );
}
