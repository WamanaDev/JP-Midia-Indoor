"use client";

import { createClient } from "@/utils/supabase/client";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { useEffect, useMemo, useRef, useState } from "react";
import { News } from "./news/news";
import { TimeNotOverlay } from "./time/TimeNotOverlay";
import { TimeOverlay } from "./time/TimeOverlay";
import { WeatherNotOverlay } from "./weather/WeatherNotOverlay";
import { WeatherOverlay } from "./weather/WeatherOverlay";
import { NewsOverlay } from "./news/NewsOverlay";
import { loadPdf } from "@/utils/pdf";

// tipos básicos (simplifiquei)
type PlaylistItem = {
  id: string;
  type: "image" | "video" | "news" | "temperature" | "hours" | "document";
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
   * PDF pagination state (type "document")
   * ========================================================= */
  const pdfDocRef = useRef<PDFDocumentProxy | null>(null);
  const pdfCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pdfPageIndex, setPdfPageIndex] = useState(0);
  const [pdfPageCount, setPdfPageCount] = useState(0);

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
   * 3b. PDF: carrega o documento quando o item atual é "document"
   * ========================================================= */
  useEffect(() => {
    const current = rotatingItems[activeIndex];

    setPdfPageIndex(0);
    setPdfPageCount(0);
    pdfDocRef.current?.loadingTask.destroy();
    pdfDocRef.current = null;

    if (current?.type !== "document" || !current.localUri) return;

    let cancelled = false;

    loadPdf(current.localUri)
      .then((pdf) => {
        if (cancelled) {
          pdf.loadingTask.destroy();
          return;
        }
        pdfDocRef.current = pdf;
        setPdfPageCount(pdf.numPages);
      })
      .catch((err) => console.error("Erro ao carregar PDF:", err));

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rotatingItems[activeIndex]?.id]);

  /* =========================================================
   * 3c. PDF: renderiza a página atual no canvas
   * ========================================================= */
  useEffect(() => {
    const pdf = pdfDocRef.current;
    const canvas = pdfCanvasRef.current;
    if (!pdf || !canvas || pdfPageCount === 0) return;

    let cancelled = false;

    (async () => {
      const page = await pdf.getPage(pdfPageIndex + 1);
      if (cancelled) return;

      const container = canvas.parentElement;
      const baseViewport = page.getViewport({ scale: 1 });
      const scale = container
        ? Math.min(
            container.clientWidth / baseViewport.width,
            container.clientHeight / baseViewport.height
          )
        : 1;
      const viewport = page.getViewport({ scale: scale || 1 });

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");
      if (!ctx || cancelled) return;

      await page.render({ canvas, canvasContext: ctx, viewport }).promise;
    })().catch((err) => console.error("Erro ao renderizar página do PDF:", err));

    return () => {
      cancelled = true;
    };
  }, [pdfPageIndex, pdfPageCount]);

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

    if (current.type === "video") {
      return; // avança via onEnded
    }

    // Documento ainda carregando (pdfPageCount === 0): espera a página
    // atual ficar pronta antes de armar o próximo passo — evita
    // "consumir" a primeira página instantaneamente.
    if (current.type === "document" && pdfPageCount === 0) {
      return;
    }

    const hasMorePdfPages =
      current.type === "document" && pdfPageIndex < pdfPageCount - 1;

    const ms = (current.duration_override ?? 8) * 1000;
    const fadeDuration = 400; // ms

    timeoutRef.current = setTimeout(
      () => {
        if (hasMorePdfPages) {
          // Próxima página do mesmo documento, sem fade nem trocar de item
          setPdfPageIndex((i) => i + 1);
          return;
        }

        // começa fade-out
        setVisible(false);

        setTimeout(() => {
          setTick((t) => t + 1);
          // Reseta a página aqui (não só no efeito de carregamento):
          // se este for o único item rotativo, advance() não muda de
          // item (mesmo id), então o efeito de carregamento — que só
          // roda quando o id muda — nunca dispararia de novo, e o PDF
          // ficaria travado na última página.
          setPdfPageIndex(0);
          advance();
          setVisible(true); // fade-in
        }, fadeDuration);
      },
      hasMorePdfPages ? ms : ms - fadeDuration
    );

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [activeIndex, rotatingItems, pdfPageIndex, pdfPageCount]);

  /* =========================================================
   * Render helpers
   * ========================================================= */
  const currentItem =
    rotatingItems.length > 0 ? rotatingItems[activeIndex] : null;

  useEffect(() => {
    return () => {
      pdfDocRef.current?.loadingTask.destroy();
      pdfDocRef.current = null;
    };
  }, []);

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

          {/* DOCUMENT (PDF) */}
          {currentItem.type === "document" && (
            <div className="w-full h-full flex items-center justify-center bg-white">
              <canvas ref={pdfCanvasRef} className="max-w-full max-h-full" />
            </div>
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
      {/* Each overlay positions itself (via config.position) as an     */}
      {/* absolute child of this relative root — they must not wrap in  */}
      {/* fixed-position containers, which would escape this boundary   */}
      {/* and fight the preview modal's own chrome for stacking order.  */}
      {/* ===================== */}
      {newsOverlay.map((item) => (
        <NewsOverlay key={item.id} config={item.config} />
      ))}

      {temperatureOverlay.map((item) => (
        <WeatherOverlay key={item.id} config={item.config} />
      ))}

      {timeOverlay.map((item) => (
        <TimeOverlay key={item.id} config={item.config} />
      ))}
    </div>
  );
}
