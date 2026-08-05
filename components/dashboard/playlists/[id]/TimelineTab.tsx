"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

import { PlaylistItemForm, PlaylistItems } from "@/interfaces/Playlists";
import { MEDIA_CATEGORIES, MediaItem } from "./media.config";
import {
  createPlaylistItem,
  deletePlaylistItem,
  movePlaylistItemDown,
  movePlaylistItemUp,
  updatePlaylistItem,
} from "@/app/dashboard/playlists/[id]/actions";

import { WeatherForm } from "./forms/FormWheater";
import { NewsForm } from "./forms/FormNews";
import { Media } from "@/interfaces/Medias";
import { ImageForm } from "./forms/FormImage";
import { VideoForm } from "./forms/FormVideo";
import { PlaylistItemCard } from "./PlaylistItemCard";
import { TimeForm } from "./forms/FormHours";

/* ================= REGISTRY ================= */

const FORM_REGISTRY = {
  temperature: WeatherForm,
  news: NewsForm,
  image: ImageForm,
  video: VideoForm,
  hours: TimeForm,
};

interface Props {
  items: PlaylistItems[];
  images: Media[] | null;
  videos: Media[] | null;
}

/* ============================================ */

export default function TimelineTab({ items, images, videos }: Props) {
  const params = useParams();
  const playlistId = params.id as string;

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  const [formData, setFormData] = useState<PlaylistItemForm | null>(null);
  const [error, setError] = useState<string | null>(null);

  const errorMessage = (err: unknown) =>
    err instanceof Error ? err.message : "Ocorreu um erro inesperado";

  /* ============== SUBMIT ================= */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData) return;
    setError(null);
    try {
      if (formData.id) {
        await updatePlaylistItem(formData.id, formData);
      } else {
        await createPlaylistItem(playlistId, formData);
      }
      setModalOpen(false);
      setSelectedMedia(null);
      setFormData(null);
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const handleMoveUp = async (item: PlaylistItems) => {
    setError(null);
    try {
      await movePlaylistItemUp(playlistId, item.id);
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const handleMoveDown = async (item: PlaylistItems) => {
    setError(null);
    try {
      await movePlaylistItemDown(playlistId, item.id);
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const handleDelete = async (item: PlaylistItems) => {
    if (!confirm("Tem certeza que deseja remover este item da playlist?")) {
      return;
    }
    setError(null);
    try {
      await deletePlaylistItem(item);
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  /* ============== SELECT MEDIA ================= */

  const handleSelectMedia = (media: MediaItem) => {
    setSelectedMedia(media);

    setFormData({
      playlist_id: playlistId,
      type: media.type,
      media_file_id: null,
      order_index: items.length,
      duration_override: null,
      start_view: null,
      end_view: null,
      config: {},
    });
  };

  const Form = selectedMedia
    ? FORM_REGISTRY[selectedMedia.type as keyof typeof FORM_REGISTRY]
    : null;

  /* ============================================ */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Timeline da Playlist</h3>

        <button
          onClick={() => {
            setModalOpen(true);
            setSelectedMedia(null);
            setFormData(null);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          + Adicionar mídia
        </button>
      </div>

      {/* Erro */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start justify-between gap-3">
          <p className="text-sm text-red-800">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800 text-sm font-medium shrink-0"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Empty */}
      {items.length === 0 && (
        <div className="border border-dashed rounded-xl p-12 text-center text-gray-500">
          Nenhuma mídia na playlist.
        </div>
      )}

      {/* Items */}
      {items.map((item) => (
        <div key={item.id}>
          <PlaylistItemCard
            playlistItem={item}
            max={items.length}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
            onDelete={handleDelete}
            onEdit={(itemToEdit) => {
              const media = MEDIA_CATEGORIES.flatMap((c) => c.items).find(
                (i) => i.type === itemToEdit.type
              );

              if (!media) return;

              setModalOpen(true);

              setSelectedMedia(media);

              setFormData({
                id: itemToEdit.id,
                playlist_id: playlistId,
                type: itemToEdit.type,
                media_file_id: itemToEdit.media_file_id,
                order_index: itemToEdit.order_index,
                duration_override: itemToEdit.duration_override,
                start_view: itemToEdit.start_view,
                end_view: itemToEdit.end_view,
                config: itemToEdit.config || {},
              });
            }}
          />
        </div>
      ))}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/90"
            onClick={() => setModalOpen(false)}
          />

          {/* Modal */}
          <div
            className="
        relative
        w-full h-full
        md:h-auto md:max-w-7xl
        md:max-h-[85vh]
        bg-white dark:bg-gray-900
        md:rounded-xl
        shadow-xl
        border border-gray-200 dark:border-gray-700
        p-4 md:p-6
        overflow-y-auto
      "
          >
            {/* ================= HEADER ================= */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedMedia
                  ? `Adicionar ${selectedMedia.label}`
                  : "Adicionar mídia"}
              </h3>

              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            {/* ================= CONTENT ================= */}
            {selectedMedia === null ? (
              <div className="space-y-8">
                {MEDIA_CATEGORIES.map((category) => (
                  <div key={category.id} className="space-y-3">
                    <h4 className="text-sm font-semibold uppercase text-gray-500">
                      {category.label}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {category.items.map((item) => {
                        const Icon = item.icon;

                        return (
                          <button
                            key={item.type}
                            onClick={() => handleSelectMedia(item)}
                            className="
                        cursor-pointer
                        flex items-center gap-3 p-4
                        bg-white dark:bg-gray-800
                        border border-gray-200 dark:border-gray-700
                        rounded-xl
                        hover:bg-gray-50 dark:hover:bg-gray-800
                        transition
                      "
                          >
                            <Icon className={item.color} />

                            <span className="font-medium text-gray-900 dark:text-white">
                              {item.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* ===== FORM DINÂMICO ===== */}
                {Form && formData && (
                  <Form
                    images={images}
                    videos={videos}
                    value={formData}
                    onChange={(data) =>
                      setFormData((prev) =>
                        prev
                          ? {
                              ...prev,
                              ...data,
                              config: {
                                ...prev.config,
                                ...data.config,
                              },
                            }
                          : prev
                      )
                    }
                  />
                )}

                {/* ================= FOOTER ================= */}
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                  {formData && formData.id ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMedia(null);
                        setFormData(null);
                        setModalOpen(false);
                      }}
                      className="cursor-pointer
                px-4 py-2
                text-gray-700 dark:text-gray-300
                hover:text-gray-900 dark:hover:text-white
              "
                    >
                      Cancelar
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMedia(null);
                          setFormData(null);
                        }}
                        className="
                px-4 py-2
                text-gray-700 dark:text-gray-300
                hover:text-gray-900 dark:hover:text-white cursor-pointer
              "
                      >
                        Voltar
                      </button>
                    </>
                  )}

                  <button
                    type="submit"
                    className="cursor-pointer
                px-6 py-2
                bg-blue-600 hover:bg-blue-700
                text-white
                rounded-lg
                transition
              "
                  >
                    {formData && formData.id ? (
                      <span>Editar Item</span>
                    ) : (
                      <span>Adicionar à playlist</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
