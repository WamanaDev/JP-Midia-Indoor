"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useMemo, useRef, useState } from "react";
import { News } from "./news/news";
import { TimeNotOverlay } from "./time/TimeNotOverlay";
import { TimeOverlay } from "./time/TimeOverlay";
import { WeatherNotOverlay } from "./weather/WeatherNotOverlay";
import { WeatherOverlay } from "./weather/WeatherOverlay";
import { NewsOverlay } from "./news/NewsOverlay";

// tipos básicos (simplifiquei)
type PlaylistItem = {
  id: string;
  type: "image" | "video" | "news" | "temperature" | "hours";
  order_index: number;
  duration_override?: number | null;
  config?: any;
  media_files?: {
    storage_path?: string;
  };
  localUri?: string;
};

interface PlayerCoreProps {
  playlistId: string;
}

export function PlayerCore({ playlistId }: PlayerCoreProps) {
  const supabase = createClient();
  /* =========================================================
   * State
   * ========================================================= */
  const [loading, setLoading] = useState(true);
  const [playlistItems, setPlaylistItems] = useState<PlaylistItem[]>([]);
  const [cachedPlaylist, setCachedPlaylist] = useState<PlaylistItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [tick, setTick] = useState(0);
  const [visible, setVisible] = useState(true);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  /* =========================================================
   * 1. Load playlist
   * ========================================================= */
  useEffect(() => {
    let alive = true;

    async function loadPlaylist() {
      setLoading(true);

      const { data, error } = await supabase
        .from("playlist_items")
        .select("*, media_files(storage_path)")
        .eq("playlist_id", playlistId)
        .order("order_index", { ascending: true });

      if (!alive) return;

      if (error) {
        console.error("Erro ao carregar playlist:", error);
        setLoading(false);
        return;
      }

      setPlaylistItems(data ?? []);
      setLoading(false);
    }

    loadPlaylist();

    return () => {
      alive = false;
    };
  }, [playlistId]);

  /* =========================================================
   * 2. Cache / preload (web-friendly)
   * ========================================================= */
  useEffect(() => {
    const preload = async () => {
      const result = await Promise.all(
        playlistItems.map(async (item) => {
          if (item.media_files?.storage_path) {
            // aqui você pode transformar em URL pública se precisar
            return {
              ...item,
              localUri: item.media_files.storage_path,
            };
          }
          return item;
        })
      );

      setCachedPlaylist(result);
    };

    if (playlistItems.length > 0) preload();
  }, [playlistItems]);

  /* =========================================================
   * 3. Filtragem (rotating vs overlays)
   * ========================================================= */
  const rotatingItems = useMemo(() => {
    return cachedPlaylist.filter((item) => {
      const cfg = item.config || {};
      if (item.type === "news" && cfg.overlay) return false;
      if (item.type === "temperature" && cfg.overlay) return false;
      if (item.type === "hours" && cfg.overlay) return false;
      return true;
    });
  }, [cachedPlaylist]);

  const temperatureOverlay = useMemo(
    () =>
      cachedPlaylist.filter(
        (x) => x.type === "temperature" && x.config?.overlay
      ),
    [cachedPlaylist]
  );

  const timeOverlay = useMemo(
    () => cachedPlaylist.filter((x) => x.type === "hours" && x.config?.overlay),
    [cachedPlaylist]
  );

  const newsOverlay = useMemo(
    () => cachedPlaylist.filter((x) => x.type === "news" && x.config?.overlay),
    [cachedPlaylist]
  );

  const advance = () => {
    setActiveIndex((prev) => {
      if (rotatingItems.length <= 1) {
        return prev; // mantém índice
      }
      return (prev + 1) % rotatingItems.length;
    });
  };

  /* =========================================================
   * 4. Rotation system
   * ========================================================= */
  useEffect(() => {
    if (rotatingItems.length === 0) return;

    const current = rotatingItems[activeIndex];
    if (!current) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (current.type !== "video") {
      const ms = (current.duration_override ?? 8) * 1000;
      const fadeDuration = 400; // ms

      timeoutRef.current = setTimeout(() => {
        // começa fade-out
        setVisible(false);

        setTimeout(() => {
          setTick((t) => t + 1);
          advance();
          setVisible(true); // fade-in
        }, fadeDuration);
      }, ms - fadeDuration);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [activeIndex, rotatingItems]);

  /* =========================================================
   * Render helpers
   * ========================================================= */
  const currentItem =
    rotatingItems.length > 0 ? rotatingItems[activeIndex] : null;

  /* =========================================================
   * Render
   * ========================================================= */
  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full text-white">
        Carregando…
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* ===================== */}
      {/* ROTATING MEDIA        */}
      {/* ===================== */}
      {currentItem && (
        <div
          key={currentItem.id}
          className={`absolute inset-0 animate-fade     transition-opacity duration-500
    ${visible ? "opacity-100" : "opacity-0"}`}
        >
          {/* IMAGE */}
          {currentItem.type === "image" && currentItem.localUri && (
            <img
              src={currentItem.localUri}
              className="w-full h-full object-cover"
              alt=""
            />
          )}

          {/* VIDEO */}
          {currentItem.type === "video" && currentItem.localUri && (
            <video
              src={currentItem.localUri}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
              onEnded={() => {
                if (rotatingItems.length > 1) {
                  setActiveIndex((prev) => (prev + 1) % rotatingItems.length);
                }
              }}
            />
          )}

          {/* NEWS fullscreen */}
          {currentItem.type === "news" && (
            <News
              key={`${currentItem.id}-${activeIndex}`}
              config={currentItem.config}
            />
          )}

          {currentItem.type === "hours" && (
            <TimeNotOverlay config={currentItem.config} />
          )}

          {currentItem.type === "temperature" && (
            <WeatherNotOverlay config={currentItem.config} />
          )}
        </div>
      )}

      {/* ===================== */}
      {/* OVERLAYS              */}
      {/* ===================== */}
      {newsOverlay.map((item) => (
        <div key={item.id} className="absolute bottom-0 left-0 right-0 z-20">
          <NewsOverlay config={item.config} />
        </div>
      ))}

      {temperatureOverlay.map((item) => (
        <div key={item.id} className="absolute top-4 right-4 z-20 text-white">
          <WeatherOverlay config={item.config} />
        </div>
      ))}

      {timeOverlay.map((item) => (
        <div key={item.id} className="absolute top-4 left-4 z-20 text-white">
          <TimeOverlay config={item.config} />
        </div>
      ))}
    </div>
  );
}
