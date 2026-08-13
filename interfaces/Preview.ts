export type WeatherLocation = {
  id: string;
  label: string;

  location?: {
    name: string;
    country: string;
    lat: number;
    lon: number;
  };

  unit?: "C" | "F";
};

export type LegacyLocation = {
  city?: string;
};

export type LocationValue = {
  name: string;
  country: string;
  lat: number;
  lon: number;
  timezone?: string;
};

export type ClockConfig = {
  id: string;
  label: string;
  format: "12h" | "24h";
  location?: LocationValue;
};

export type Position = "top-left" | "top-right" | "bottom-left" | "bottom-right" | "";

/**
 * Catálogo de "chip" — usado tanto no overlay (canto da tela) quanto no modo
 * tela cheia simples (`layout: "vertical" | "horizontal"`, o chip só fica maior).
 * Compartilhado entre relógio e clima; cada componente decide o ícone/valor.
 */
export type ChipStyleId =
  | "minimal"
  | "badge"
  | "card"
  | "digital"
  | "glass"
  | "pulse"
  | "sphere"
  | "chip-outline"
  | "tag-ticket"
  | "mono-console"
  | "neon-breathe"
  | "brand-strip"
  | "paper-tag"
  | "led-strip"
  | "ribbon-corner"
  | "viewfinder-corners"
  | "icon-tight";

export type TimeStyleId =
  | ChipStyleId
  | "flip"
  | "flip3d"
  | "analog-minimal"
  | "analog-neon"
  | "analog-corporate";

export type WeatherStyleId = ChipStyleId | "neon" | "corporate" | "tech" | "dark" | "gauge";

/**
 * Templates de tela cheia "ricos" (só fazem sentido com `overlay: false`).
 * Substituem o modo "chip repetido" quando o usuário escolhe um template.
 * Cada id só existe pra rodar OU pra mostrar todos juntos — a hora/valor
 * do template determina em qual dos dois `layout` ele deve ser usado.
 */
export type TimeRotateTemplateId =
  | "airport-split"
  | "transit-board"
  | "boarding-pass"
  | "stadium-scoreboard"
  | "subway-panel"
  | "neon-marquee"
  | "terminal-readout"
  | "data-wall";

export type TimeTogetherTemplateId =
  | "departure-table"
  | "ribbon-stack"
  | "clock-wall"
  | "glass-panels"
  | "timeline-row"
  | "corporate-lobby"
  | "transit-multiboard";

export type TimeFullscreenTemplateId = TimeRotateTemplateId | TimeTogetherTemplateId;

export type TimeConfig = {
  overlay: boolean;
  position: Position;
  style: TimeStyleId;
  /** "rotate" é novo: revezar um relógio por vez em tela cheia (como já acontece no overlay). */
  layout: "vertical" | "horizontal" | "rotate";
  /** Opcional: template de tela cheia rico. Só usado quando overlay=false. Ausente = comportamento atual (chip repetido). */
  fullscreenStyle?: TimeFullscreenTemplateId;
  clocks: ClockConfig[];
};

export type WeatherRotateTemplateId =
  | "billboard-spot"
  | "control-room"
  | "retail-promo"
  | "weather-station-hero"
  | "corporate-brief"
  | "sunrise-gradient"
  | "horizon-line";

export type WeatherTogetherTemplateId =
  | "grid-mosaic"
  | "dashboard-tiles"
  | "honeycomb"
  | "weather-strip-multi"
  | "split-duo"
  | "badge-cloud"
  | "globe-row";

export type WeatherFullscreenTemplateId = WeatherRotateTemplateId | WeatherTogetherTemplateId;

export type WeatherConfig = {
  overlay: boolean;
  position: Position;
  style: WeatherStyleId;
  layout: "vertical" | "horizontal" | "rotate";
  fullscreenStyle?: WeatherFullscreenTemplateId;
  locations: WeatherLocation[];
};

export type NewsItem = {
  title: string;
  description: string;
  link: string;
  image?: string;
  source: string;
};

/** Estilo compacto do overlay de notícia (canto/rodapé). */
export type NewsOverlayStyleId =
  | "news-ticker-chip"
  | "news-marquee"
  | "news-mini-card"
  | "news-alert-strip"
  | "news-qr-corner";

export type NewsRotateTemplateId =
  | "broadcast-lower-third"
  | "magazine-cover"
  | "news-hero-banner"
  | "gallery-frame"
  | "polaroid-frame"
  | "news-split-qr"
  | "news-caption-card"
  | "news-dossier"
  | "news-anchor-desk";

export type NewsTogetherTemplateId =
  | "filmstrip-row"
  | "ledger-rows"
  | "carousel-fan"
  | "info-strip-bottom"
  | "newsroom-grid"
  | "archive-cards"
  | "news-wall-qr"
  | "news-digest-list";

export type NewsFullscreenTemplateId = NewsRotateTemplateId | NewsTogetherTemplateId;

export type NewsConfig = {
  overlay: boolean;
  /** Só usado quando overlay=true. Ausente = visual atual (fixo por fonte, G1/Metrópole). */
  style?: NewsOverlayStyleId;
  /** Só usado quando overlay=false. Ausente = visual atual (fixo por fonte, G1/Metrópole). */
  fullscreenStyle?: NewsFullscreenTemplateId;
  /** ms reais de exibição no overlay = interval * 2000 (ver docs/media-player-spec.md §3.3). */
  interval?: number;
  news: Record<string, string[]>;
};
