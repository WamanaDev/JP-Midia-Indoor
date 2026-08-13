// forms/NewsForm.tsx
"use client";

import { MediaFormProps } from "@/interfaces/Medias";
import {
  Building2,
  Cpu,
  Flag,
  Gavel,
  Globe,
  Globe2,
  GraduationCap,
  Landmark,
  Leaf,
  LucideIcon,
  MapPin,
  Microscope,
  Newspaper,
  PawPrint,
  Popcorn,
  Shield,
  Star,
  Trophy,
  Wallet,
} from "lucide-react";
import { ReactNode, useState } from "react";
import { OverlayToggle } from "./shared/OverlayToggle";
import { StylePicker, StyleOption } from "./shared/StylePicker";
import { NewsOverlayStyleId } from "@/components/preview/news/styles/registry";
import { NewsFullscreenTemplateId } from "@/interfaces/Preview";

type NewsConfig = Record<string, string[]>;

interface PlaylistConfig {
  overlay: boolean;
  news: NewsConfig;
  /** Só usado quando overlay=true. Ausente = visual atual (fixo por fonte). */
  style?: NewsOverlayStyleId;
  /** Só usado quando overlay=false. Ausente = visual atual (fixo por fonte). */
  fullscreenStyle?: NewsFullscreenTemplateId;
}

const SAMPLE_TITLE = "Prefeitura anuncia obras na Av. Central";

const NEWS_STYLES: StyleOption[] = [
  {
    id: "news-ticker-chip",
    label: "Chip de notícia",
    preview: (
      <div className="flex items-center gap-2 bg-black/75 rounded-md px-3 py-1.5 max-w-full">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-none" />
        <span className="text-white text-xs font-semibold truncate">{SAMPLE_TITLE}</span>
      </div>
    ),
  },
  {
    id: "news-marquee",
    label: "Manchete corrida",
    preview: (
      <div className="flex items-center gap-2 bg-black/75 rounded-md px-3 py-1.5 max-w-full overflow-hidden">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-none" />
        <span className="text-white text-xs font-semibold whitespace-nowrap">{SAMPLE_TITLE}</span>
      </div>
    ),
  },
  {
    id: "news-mini-card",
    label: "Mini card",
    preview: (
      <div className="flex items-center gap-2 bg-white rounded-lg shadow px-2 py-1.5 max-w-full">
        <span className="w-8 h-8 rounded-lg flex-none bg-gradient-to-br from-amber-500 to-amber-800" />
        <span className="text-neutral-900 text-xs font-semibold line-clamp-2">{SAMPLE_TITLE}</span>
      </div>
    ),
  },
  {
    id: "news-alert-strip",
    label: "Alerta",
    preview: (
      <div className="flex flex-col gap-0.5 bg-neutral-950 border-l-4 border-red-500 rounded-r-lg px-3 py-1.5 max-w-full">
        <span className="text-red-400 text-[9px] font-mono uppercase tracking-wider">Última hora</span>
        <span className="text-white text-xs font-semibold truncate">{SAMPLE_TITLE}</span>
      </div>
    ),
  },
  {
    id: "news-qr-corner",
    label: "QR discreto",
    preview: (
      <div className="flex items-center gap-2 bg-black/75 rounded-lg px-2 py-1.5 max-w-full">
        <span className="w-7 h-7 rounded bg-white grid grid-cols-3 gap-px p-0.5 flex-none">
          {[...Array(9)].map((_, i) => (
            <span key={i} className={i % 2 === 0 ? "bg-neutral-900" : "bg-white"} />
          ))}
        </span>
        <span className="text-white text-xs font-semibold truncate">{SAMPLE_TITLE}</span>
      </div>
    ),
  },
];

const FULLSCREEN_TEMPLATES: StyleOption[] = [
  {
    id: "",
    label: "Nenhum (visual atual)",
    preview: <div className="text-white text-[10px] px-2 text-center">Visual fixo por fonte</div>,
  },
  {
    id: "broadcast-lower-third",
    label: "Barra Telejornal",
    preview: (
      <div className="w-full h-full bg-neutral-950 flex items-end">
        <div className="w-full bg-amber-500 text-neutral-950 text-[9px] font-bold px-2 py-1 truncate">
          {SAMPLE_TITLE}
        </div>
      </div>
    ),
  },
  {
    id: "magazine-cover",
    label: "Capa de Revista",
    preview: (
      <div className="w-full h-full bg-[#f4f2ec] flex items-center justify-center px-2">
        <span className="font-serif text-neutral-900 text-[10px] text-center">{SAMPLE_TITLE}</span>
      </div>
    ),
  },
  {
    id: "news-hero-banner",
    label: "Banner Breaking News",
    preview: (
      <div className="w-full h-full bg-gradient-to-t from-black to-neutral-800 flex items-end p-2">
        <span className="text-white text-[9px] font-bold truncate">{SAMPLE_TITLE}</span>
      </div>
    ),
  },
  {
    id: "gallery-frame",
    label: "Moldura de Galeria",
    preview: (
      <div className="w-full h-full bg-[#efece4] flex items-center justify-center px-2">
        <span className="font-serif text-neutral-800 text-[9px] text-center">{SAMPLE_TITLE}</span>
      </div>
    ),
  },
  {
    id: "polaroid-frame",
    label: "Polaroid",
    preview: (
      <div className="w-full h-full bg-[#e9e6de] flex items-center justify-center">
        <div className="bg-white shadow px-2 py-2 -rotate-3">
          <div className="w-10 h-6 bg-amber-500 mb-1" />
          <span className="text-neutral-900 text-[8px]">Obras...</span>
        </div>
      </div>
    ),
  },
  {
    id: "news-split-qr",
    label: "Split com QR",
    preview: (
      <div className="w-full h-full flex">
        <div className="flex-1 bg-purple-900" />
        <div className="flex-1 bg-neutral-950 flex items-center justify-center">
          <span className="text-white text-[8px] px-1">Obras...</span>
        </div>
      </div>
    ),
  },
  {
    id: "news-caption-card",
    label: "Legenda Editorial",
    preview: (
      <div className="w-full h-full bg-neutral-950 flex items-center justify-center px-2">
        <span className="font-serif italic text-white text-[9px] text-center">&ldquo;{SAMPLE_TITLE}&rdquo;</span>
      </div>
    ),
  },
  {
    id: "news-dossier",
    label: "Dossiê",
    preview: (
      <div className="w-full h-full bg-[#efece4] flex items-center justify-center px-2">
        <span className="font-serif text-neutral-900 text-[9px] text-center">{SAMPLE_TITLE}</span>
      </div>
    ),
  },
  {
    id: "news-anchor-desk",
    label: "Bancada",
    preview: (
      <div className="w-full h-full bg-neutral-950 flex items-end">
        <div className="w-full px-2 py-1">
          <span className="text-white text-[9px] font-bold block truncate">{SAMPLE_TITLE}</span>
          <span className="text-white/50 text-[7px] block truncate">Prefeitura confirma início...</span>
        </div>
      </div>
    ),
  },
  {
    id: "filmstrip-row",
    label: "Fita de Filme",
    preview: (
      <div className="w-full h-full bg-neutral-950 flex">
        <div className="flex-1 px-1 py-1 text-white text-[7px] leading-tight line-clamp-3">{SAMPLE_TITLE}</div>
        <div className="flex-1 px-1 py-1 border-l border-dotted border-white/25 text-white text-[7px] leading-tight line-clamp-3">
          Feira de artesanato agita o centro
        </div>
      </div>
    ),
  },
  {
    id: "ledger-rows",
    label: "Linhas de Jornal",
    preview: (
      <div className="w-full h-full bg-[#f4f2ec] flex flex-col justify-center gap-1 px-2">
        <span className="text-neutral-900 text-[8px] font-serif border-t border-neutral-400/50 pt-1">{SAMPLE_TITLE}</span>
        <span className="text-neutral-900 text-[8px] font-serif border-t border-neutral-400/50 pt-1">Nova ciclovia inaugurada</span>
      </div>
    ),
  },
  {
    id: "carousel-fan",
    label: "Leque",
    preview: (
      <div className="relative w-full h-full bg-neutral-950 flex items-center justify-center">
        <div className="absolute w-16 h-10 bg-white rounded shadow -rotate-6" />
        <div className="absolute w-16 h-10 bg-white rounded shadow translate-x-2 rotate-6 z-10" />
      </div>
    ),
  },
  {
    id: "info-strip-bottom",
    label: "Faixa Inferior",
    preview: (
      <div className="w-full h-full bg-neutral-800 flex items-end">
        <div className="w-full flex bg-black/60">
          <span className="flex-1 text-white text-[7px] px-1 py-1 truncate">{SAMPLE_TITLE}</span>
          <span className="flex-1 text-white text-[7px] px-1 py-1 border-l border-white/15 truncate">Ciclovia</span>
        </div>
      </div>
    ),
  },
  {
    id: "newsroom-grid",
    label: "Parede de Redação",
    preview: (
      <div className="w-full h-full flex gap-0.5">
        <div className="flex-1 bg-[#12151c] border-t-4 border-amber-500 text-white text-[7px] px-1 py-1 line-clamp-3">
          {SAMPLE_TITLE}
        </div>
        <div className="flex-1 bg-[#12151c] border-t-4 border-teal-400 text-white text-[7px] px-1 py-1 line-clamp-3">
          Ciclovia inaugurada
        </div>
      </div>
    ),
  },
  {
    id: "archive-cards",
    label: "Fichário",
    preview: (
      <div className="w-full h-full bg-[#e9e6de] flex flex-col items-center justify-center gap-1">
        <span className="bg-white shadow px-2 py-0.5 text-neutral-900 text-[8px] -translate-x-1">{SAMPLE_TITLE}</span>
        <span className="bg-white shadow px-2 py-0.5 text-neutral-900 text-[8px] translate-x-1">Ciclovia</span>
      </div>
    ),
  },
  {
    id: "news-wall-qr",
    label: "Mural com QR",
    preview: (
      <div className="w-full h-full flex gap-1 p-1">
        <div className="flex-1 bg-[#12151c] rounded p-1 flex flex-col gap-1">
          <span className="text-white text-[7px] line-clamp-2">{SAMPLE_TITLE}</span>
          <span className="w-3 h-3 bg-white rounded-sm" />
        </div>
      </div>
    ),
  },
  {
    id: "news-digest-list",
    label: "Resumo do Dia",
    preview: (
      <div className="w-full h-full bg-[#f4f2ec] flex flex-col justify-center gap-1 px-2">
        <span className="text-neutral-900 text-[8px] font-semibold">{SAMPLE_TITLE}</span>
        <span className="text-neutral-600 text-[7px] line-clamp-1">Início previsto para o mês que vem</span>
      </div>
    ),
  },
];
/* ================= DATA ================= */

type Feed = {
  name: string;
  url: string;
  icon: LucideIcon;
  color: string;
};

type Provider = {
  name: string;
  color: string;
  icon: ReactNode;
  feeds: Feed[];
};

const G1: Feed[] = [
  /* ===== GERAL ===== */
  {
    name: "Brasil",
    url: "https://g1.globo.com/dynamo/brasil/rss2.xml",
    icon: Flag,
    color: "from-gray-500 to-gray-600",
  },
  {
    name: "Carros (Autoesporte)",
    url: "https://g1.globo.com/dynamo/carros/rss2.xml",
    icon: Building2,
    color: "from-slate-400 to-slate-500",
  },
  {
    name: "Ciência e Saúde",
    url: "https://g1.globo.com/dynamo/ciencia-e-saude/rss2.xml",
    icon: Microscope,
    color: "from-sky-400 to-sky-500",
  },
  {
    name: "Concursos e Emprego",
    url: "https://g1.globo.com/dynamo/concursos-e-emprego/rss2.xml",
    icon: Gavel,
    color: "from-zinc-500 to-zinc-600",
  },
  {
    name: "Economia",
    url: "https://g1.globo.com/dynamo/economia/rss2.xml",
    icon: Wallet,
    color: "from-yellow-400 to-yellow-500",
  },
  {
    name: "Educação",
    url: "https://g1.globo.com/dynamo/educacao/rss2.xml",
    icon: GraduationCap,
    color: "from-indigo-400 to-indigo-500",
  },
  {
    name: "Loterias",
    url: "https://g1.globo.com/dynamo/loterias/rss2.xml",
    icon: Trophy,
    color: "from-green-500 to-green-600",
  },
  {
    name: "Mundo",
    url: "https://g1.globo.com/dynamo/mundo/rss2.xml",
    icon: Globe,
    color: "from-blue-400 to-blue-500",
  },
  {
    name: "Música",
    url: "https://g1.globo.com/dynamo/musica/rss2.xml",
    icon: Popcorn,
    color: "from-purple-400 to-purple-500",
  },
  {
    name: "Natureza",
    url: "https://g1.globo.com/dynamo/natureza/rss2.xml",
    icon: Leaf,
    color: "from-green-400 to-green-500",
  },
  {
    name: "Planeta Bizarro",
    url: "https://g1.globo.com/dynamo/planeta-bizarro/rss2.xml",
    icon: PawPrint,
    color: "from-orange-400 to-orange-500",
  },
  {
    name: "Política",
    url: "https://g1.globo.com/dynamo/politica/mensalao/rss2.xml",
    icon: Landmark,
    color: "from-red-500 to-red-600",
  },
  {
    name: "Pop & Arte",
    url: "https://g1.globo.com/dynamo/pop-arte/rss2.xml",
    icon: Star,
    color: "from-pink-400 to-pink-500",
  },
  {
    name: "Tecnologia e Games",
    url: "https://g1.globo.com/dynamo/tecnologia/rss2.xml",
    icon: Cpu,
    color: "from-cyan-400 to-cyan-500",
  },
  {
    name: "Turismo e Viagem",
    url: "https://g1.globo.com/dynamo/turismo-e-viagem/rss2.xml",
    icon: MapPin,
    color: "from-emerald-400 to-emerald-500",
  },
  {
    name: "VC no G1",
    url: "https://g1.globo.com/dynamo/vc-no-g1/rss2.xml",
    icon: Newspaper,
    color: "from-gray-400 to-gray-500",
  },

  /* ===== REGIÕES ===== */
  {
    name: "Acre",
    url: "https://g1.globo.com/dynamo/ac/acre/rss2.xml",
    icon: MapPin,
    color: "from-green-600 to-green-700",
  },
  {
    name: "Alagoas",
    url: "https://g1.globo.com/dynamo/al/alagoas/rss2.xml",
    icon: MapPin,
    color: "from-red-400 to-red-500",
  },
  {
    name: "Amapá",
    url: "https://g1.globo.com/dynamo/ap/amapa/rss2.xml",
    icon: MapPin,
    color: "from-yellow-400 to-yellow-500",
  },
  {
    name: "Amazonas",
    url: "https://g1.globo.com/dynamo/am/amazonas/rss2.xml",
    icon: MapPin,
    color: "from-green-500 to-green-600",
  },
  {
    name: "Bahia",
    url: "https://g1.globo.com/dynamo/bahia/rss2.xml",
    icon: MapPin,
    color: "from-yellow-500 to-yellow-600",
  },
  {
    name: "Ceará",
    url: "https://g1.globo.com/dynamo/ceara/rss2.xml",
    icon: MapPin,
    color: "from-blue-400 to-blue-500",
  },
  {
    name: "Distrito Federal",
    url: "https://g1.globo.com/dynamo/distrito-federal/rss2.xml",
    icon: MapPin,
    color: "from-indigo-400 to-indigo-500",
  },
  {
    name: "Espírito Santo",
    url: "https://g1.globo.com/dynamo/espirito-santo/rss2.xml",
    icon: MapPin,
    color: "from-teal-400 to-teal-500",
  },
  {
    name: "Goiás",
    url: "https://g1.globo.com/dynamo/goias/rss2.xml",
    icon: MapPin,
    color: "from-emerald-400 to-emerald-500",
  },
  {
    name: "Maranhão",
    url: "https://g1.globo.com/dynamo/ma/maranhao/rss2.xml",
    icon: MapPin,
    color: "from-lime-400 to-lime-500",
  },
  {
    name: "Mato Grosso",
    url: "https://g1.globo.com/dynamo/mato-grosso/rss2.xml",
    icon: MapPin,
    color: "from-green-700 to-green-800",
  },
  {
    name: "Mato Grosso do Sul",
    url: "https://g1.globo.com/dynamo/mato-grosso-do-sul/rss2.xml",
    icon: MapPin,
    color: "from-green-600 to-green-700",
  },
  {
    name: "Minas Gerais",
    url: "https://g1.globo.com/dynamo/minas-gerais/rss2.xml",
    icon: MapPin,
    color: "from-amber-400 to-amber-500",
  },

  {
    name: "MG – Centro-Oeste",
    url: "https://g1.globo.com/dynamo/mg/centro-oeste/rss2.xml",
    icon: MapPin,
    color: "from-amber-500 to-amber-600",
  },
  {
    name: "MG – Grande Minas",
    url: "https://g1.globo.com/dynamo/mg/grande-minas/rss2.xml",
    icon: MapPin,
    color: "from-amber-600 to-amber-700",
  },
  {
    name: "MG – Sul de Minas",
    url: "https://g1.globo.com/dynamo/mg/sul-de-minas/rss2.xml",
    icon: MapPin,
    color: "from-amber-700 to-amber-800",
  },
  {
    name: "MG – Triângulo Mineiro",
    url: "https://g1.globo.com/dynamo/minas-gerais/triangulo-mineiro/rss2.xml",
    icon: MapPin,
    color: "from-amber-800 to-amber-900",
  },
  {
    name: "MG – Vales de MG",
    url: "https://g1.globo.com/dynamo/mg/vales-mg/rss2.xml",
    icon: MapPin,
    color: "from-amber-500 to-amber-700",
  },
  {
    name: "MG – Zona da Mata",
    url: "https://g1.globo.com/dynamo/mg/zona-da-mata/rss2.xml",
    icon: MapPin,
    color: "from-amber-400 to-amber-600",
  },

  {
    name: "Pará",
    url: "https://g1.globo.com/dynamo/pa/para/rss2.xml",
    icon: MapPin,
    color: "from-green-500 to-green-600",
  },
  {
    name: "Paraíba",
    url: "https://g1.globo.com/dynamo/pb/paraiba/rss2.xml",
    icon: MapPin,
    color: "from-red-500 to-red-600",
  },
  {
    name: "Paraná",
    url: "https://g1.globo.com/dynamo/pr/parana/rss2.xml",
    icon: MapPin,
    color: "from-teal-500 to-teal-600",
  },

  {
    name: "PR – Campos Gerais e Sul",
    url: "https://g1.globo.com/dynamo/pr/campos-gerais-sul/rss2.xml",
    icon: MapPin,
    color: "from-teal-600 to-teal-700",
  },
  {
    name: "PR – Oeste e Sudoeste",
    url: "https://g1.globo.com/dynamo/pr/oeste-sudoeste/rss2.xml",
    icon: MapPin,
    color: "from-teal-700 to-teal-800",
  },
  {
    name: "PR – Norte e Noroeste",
    url: "https://g1.globo.com/dynamo/pr/norte-noroeste/rss2.xml",
    icon: MapPin,
    color: "from-teal-800 to-teal-900",
  },

  {
    name: "Pernambuco",
    url: "https://g1.globo.com/dynamo/pernambuco/rss2.xml",
    icon: MapPin,
    color: "from-orange-400 to-orange-500",
  },
  {
    name: "PE – Caruaru e Região",
    url: "https://g1.globo.com/dynamo/pe/caruaru-regiao/rss2.xml",
    icon: MapPin,
    color: "from-orange-500 to-orange-600",
  },
  {
    name: "PE – Petrolina e Região",
    url: "https://g1.globo.com/dynamo/pe/petrolina-regiao/rss2.xml",
    icon: MapPin,
    color: "from-orange-600 to-orange-700",
  },

  {
    name: "Rio de Janeiro",
    url: "https://g1.globo.com/dynamo/rio-de-janeiro/rss2.xml",
    icon: MapPin,
    color: "from-blue-500 to-blue-600",
  },
  {
    name: "RJ – Região Serrana",
    url: "https://g1.globo.com/dynamo/rj/regiao-serrana/rss2.xml",
    icon: MapPin,
    color: "from-blue-600 to-blue-700",
  },
  {
    name: "RJ – Região dos Lagos",
    url: "https://g1.globo.com/dynamo/rj/regiao-dos-lagos/rss2.xml",
    icon: MapPin,
    color: "from-blue-700 to-blue-800",
  },
  {
    name: "RJ – Norte Fluminense",
    url: "https://g1.globo.com/dynamo/rj/norte-fluminense/rss2.xml",
    icon: MapPin,
    color: "from-blue-800 to-blue-900",
  },
  {
    name: "RJ – Sul e Costa Verde",
    url: "https://g1.globo.com/dynamo/rj/sul-do-rio-costa-verde/rss2.xml",
    icon: MapPin,
    color: "from-blue-900 to-blue-950",
  },

  {
    name: "Rio Grande do Norte",
    url: "https://g1.globo.com/dynamo/rn/rio-grande-do-norte/rss2.xml",
    icon: MapPin,
    color: "from-rose-400 to-rose-500",
  },
  {
    name: "Rio Grande do Sul",
    url: "https://g1.globo.com/dynamo/rs/rio-grande-do-sul/rss2.xml",
    icon: MapPin,
    color: "from-green-500 to-green-600",
  },
  {
    name: "Rondônia",
    url: "https://g1.globo.com/dynamo/ro/rondonia/rss2.xml",
    icon: MapPin,
    color: "from-lime-500 to-lime-600",
  },
  {
    name: "Roraima",
    url: "https://g1.globo.com/dynamo/rr/roraima/rss2.xml",
    icon: MapPin,
    color: "from-lime-600 to-lime-700",
  },
  {
    name: "Santa Catarina",
    url: "https://g1.globo.com/dynamo/sc/santa-catarina/rss2.xml",
    icon: MapPin,
    color: "from-cyan-400 to-cyan-500",
  },
  {
    name: "São Paulo",
    url: "https://g1.globo.com/dynamo/sao-paulo/rss2.xml",
    icon: MapPin,
    color: "from-red-500 to-red-600",
  },

  {
    name: "SP – Bauru e Marília",
    url: "https://g1.globo.com/dynamo/sp/bauru-marilia/rss2.xml",
    icon: MapPin,
    color: "from-red-600 to-red-700",
  },
  {
    name: "SP – Campinas e Região",
    url: "https://g1.globo.com/dynamo/sp/campinas-regiao/rss2.xml",
    icon: MapPin,
    color: "from-red-700 to-red-800",
  },
  {
    name: "SP – Itapetininga e Região",
    url: "https://g1.globo.com/dynamo/sao-paulo/itapetininga-regiao/rss2.xml",
    icon: MapPin,
    color: "from-red-800 to-red-900",
  },
  {
    name: "SP – Mogi das Cruzes e Suzano",
    url: "https://g1.globo.com/dynamo/sp/mogi-das-cruzes-suzano/rss2.xml",
    icon: MapPin,
    color: "from-red-900 to-red-950",
  },
  {
    name: "SP – Piracicaba e Região",
    url: "https://g1.globo.com/dynamo/sp/piracicaba-regiao/rss2.xml",
    icon: MapPin,
    color: "from-rose-500 to-rose-600",
  },
  {
    name: "SP – Prudente e Região",
    url: "https://g1.globo.com/dynamo/sp/presidente-prudente-regiao/rss2.xml",
    icon: MapPin,
    color: "from-rose-600 to-rose-700",
  },
  {
    name: "SP – Ribeirão Preto e Franca",
    url: "https://g1.globo.com/dynamo/sp/ribeirao-preto-franca/rss2.xml",
    icon: MapPin,
    color: "from-rose-700 to-rose-800",
  },
  {
    name: "SP – Rio Preto e Araçatuba",
    url: "https://g1.globo.com/dynamo/sao-paulo/sao-jose-do-rio-preto-aracatuba/rss2.xml",
    icon: MapPin,
    color: "from-rose-800 to-rose-900",
  },
  {
    name: "SP – Santos e Região",
    url: "https://g1.globo.com/dynamo/sp/santos-regiao/rss2.xml",
    icon: MapPin,
    color: "from-sky-500 to-sky-600",
  },
  {
    name: "SP – São Carlos e Araraquara",
    url: "https://g1.globo.com/dynamo/sp/sao-carlos-regiao/rss2.xml",
    icon: MapPin,
    color: "from-sky-600 to-sky-700",
  },
  {
    name: "SP – Sorocaba e Jundiaí",
    url: "https://g1.globo.com/dynamo/sao-paulo/sorocaba-jundiai/rss2.xml",
    icon: MapPin,
    color: "from-sky-700 to-sky-800",
  },
  {
    name: "SP – Vale do Paraíba e Região",
    url: "https://g1.globo.com/dynamo/sp/vale-do-paraiba-regiao/rss2.xml",
    icon: MapPin,
    color: "from-sky-800 to-sky-900",
  },

  {
    name: "Sergipe",
    url: "https://g1.globo.com/dynamo/se/sergipe/rss2.xml",
    icon: MapPin,
    color: "from-indigo-400 to-indigo-500",
  },
  {
    name: "Tocantins",
    url: "https://g1.globo.com/dynamo/to/tocantins/rss2.xml",
    icon: MapPin,
    color: "from-lime-400 to-lime-500",
  },
];

const METROPOLE = [
  {
    name: "Últimas Notícias",
    url: "https://metropoleonline.com.br/rss/latest-posts",
    icon: Newspaper,
    color: "from-gray-500 to-gray-600",
  },
  {
    name: "Cidades",
    url: "https://metropoleonline.com.br/rss/category/cidades",
    icon: Building2,
    color: "from-slate-500 to-slate-600",
  },
  {
    name: "Cajamar",
    url: "https://metropoleonline.com.br/rss/category/cajamar",
    icon: MapPin,
    color: "from-emerald-400 to-emerald-500",
  },
  {
    name: "Franco da Rocha",
    url: "https://metropoleonline.com.br/rss/category/franco-da-rocha",
    icon: MapPin,
    color: "from-emerald-500 to-emerald-600",
  },
  {
    name: "Francisco Morato",
    url: "https://metropoleonline.com.br/rss/category/francisco-morato",
    icon: MapPin,
    color: "from-emerald-600 to-emerald-700",
  },
  {
    name: "Caieiras",
    url: "https://metropoleonline.com.br/rss/category/caieiras",
    icon: MapPin,
    color: "from-green-500 to-green-600",
  },
  {
    name: "Santana de Parnaíba",
    url: "https://metropoleonline.com.br/rss/category/santana-de-parnaiba",
    icon: MapPin,
    color: "from-green-600 to-green-700",
  },
  {
    name: "Barueri",
    url: "https://metropoleonline.com.br/rss/category/barueri",
    icon: MapPin,
    color: "from-teal-500 to-teal-600",
  },
  {
    name: "Jundiaí",
    url: "https://metropoleonline.com.br/rss/category/jundiai",
    icon: MapPin,
    color: "from-teal-600 to-teal-700",
  },
  {
    name: "Grande SP",
    url: "https://metropoleonline.com.br/rss/category/grande-sp",
    icon: Globe,
    color: "from-blue-500 to-blue-600",
  },
  {
    name: "Política",
    url: "https://metropoleonline.com.br/rss/category/politica",
    icon: Landmark,
    color: "from-red-500 to-red-600",
  },
  {
    name: "Celebridades",
    url: "https://metropoleonline.com.br/rss/category/celebridades",
    icon: Star,
    color: "from-pink-400 to-pink-500",
  },
  {
    name: "Esportes",
    url: "https://metropoleonline.com.br/rss/category/esportes",
    icon: Trophy,
    color: "from-green-400 to-green-500",
  },
  {
    name: "Economia",
    url: "https://metropoleonline.com.br/rss/category/economia",
    icon: Wallet,
    color: "from-yellow-400 to-yellow-500",
  },
  {
    name: "Tecnologia",
    url: "https://metropoleonline.com.br/rss/category/tecnologia",
    icon: Cpu,
    color: "from-cyan-400 to-cyan-500",
  },
  {
    name: "Mundo",
    url: "https://metropoleonline.com.br/rss/category/mundo",
    icon: Globe2,
    color: "from-indigo-400 to-indigo-500",
  },
  {
    name: "Polícia",
    url: "https://metropoleonline.com.br/rss/category/policia",
    icon: Shield,
    color: "from-gray-600 to-gray-700",
  },
  {
    name: "Poder Legislativo de Cajamar",
    url: "https://metropoleonline.com.br/rss/category/poder-legislativo",
    icon: Gavel,
    color: "from-zinc-500 to-zinc-600",
  },
  {
    name: "Metrópole Pet",
    url: "https://metropoleonline.com.br/rss/category/territorio-animal",
    icon: PawPrint,
    color: "from-orange-400 to-orange-500",
  },
];

const PROVIDERS: Provider[] = [
  {
    name: "G1",
    color: "bg-white",
    icon: (
      <div className="relative w-50 h-20">
        <img
          src="https://logodownload.org/wp-content/uploads/2016/10/g1-logo-0.png"
          alt="Metrópole"
          className="object-contain w-full h-full contain-content bg-cover"
        />
      </div>
    ),
    feeds: G1,
  },
  {
    name: "Metrópole",
    color: "bg-white",
    icon: (
      <div className="relative w-50 h-20">
        <img
          src="https://i.metroimg.com/f-VbR11ZpSOHUtgMU9qcJ7p19QWIpltfDnyjC-4bBug/w:1200/q:85/f:webp/plain/2016/01/05211351/metropoles.jpg"
          alt="Metrópole"
          className="object-contain w-full h-full contain-content bg-cover"
        />
      </div>
    ),
    feeds: METROPOLE,
  },
];

/* ================= COMPONENT ================= */

export function NewsForm({ value, onChange }: MediaFormProps) {
  const [providerIndex, setProviderIndex] = useState<number | null>(null);

  const config: PlaylistConfig = {
    overlay: false,
    news: {},
    ...value.config,
  };

  const updateConfig = (partial: Partial<typeof config>) => {
    onChange({
      ...value,
      config: {
        ...config,
        ...partial,
      },
    });
  };

  const toggleCategory = (provider: string, url: string) => {
    const current = config.news?.[provider] ?? [];
    const exists = current.includes(url);

    updateConfig({
      news: {
        ...(config.news ?? {}),
        [provider]: exists
          ? current.filter((u) => u !== url)
          : [...current, url],
      },
    });
  };

  const isSelected = (provider: string, url: string) =>
    config.news?.[provider]?.includes(url);

  /* ================= RENDER ================= */

  return (
    <div className="space-y-8">
      <OverlayToggle
        enabled={config.overlay}
        onToggle={() => updateConfig({ overlay: !config.overlay })}
      />

      {config.overlay && (
        <StylePicker
          title="Estilo do overlay"
          styles={NEWS_STYLES}
          value={config.style ?? "news-ticker-chip"}
          onChange={(style) => updateConfig({ style: style as NewsOverlayStyleId })}
        />
      )}

      {!config.overlay && (
        <StylePicker
          title="Template de tela cheia (opcional)"
          styles={FULLSCREEN_TEMPLATES}
          value={config.fullscreenStyle ?? ""}
          onChange={(fullscreenStyle) =>
            updateConfig({
              fullscreenStyle: (fullscreenStyle || undefined) as NewsFullscreenTemplateId | undefined,
            })
          }
        />
      )}

      {/* ===== PROVIDERS ===== */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
          Fonte de notícias
        </h4>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {PROVIDERS.map((provider, index) => (
            <button
              key={provider.name}
              type="button"
              onClick={() => setProviderIndex(index)}
              className={`
                flex flex-col items-center gap-2 p-4 rounded-xl border transition
                ${
                  providerIndex === index
                    ? "border-blue-500 bg-blue-50 dark:bg-gray-900"
                    : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                }
              `}
            >
              <div
                className={`rounded-xl flex items-center justify-center ${provider.color}`}
              >
                {provider.icon}
              </div>

              <span className="font-medium text-gray-900 dark:text-white">
                {provider.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ===== CATEGORIES ===== */}
      {providerIndex !== null && (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
            Categorias – {PROVIDERS[providerIndex].name}
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {PROVIDERS[providerIndex].feeds.map((feed) => {
              const Icon = feed.icon;

              return (
                <button
                  key={feed.url}
                  type="button"
                  onClick={() =>
                    toggleCategory(PROVIDERS[providerIndex].name, feed.url)
                  }
                  className={`
                    flex flex-col items-center gap-2 p-4 rounded-xl border transition
                    ${
                      isSelected(PROVIDERS[providerIndex].name, feed.url)
                        ? "border-blue-500 bg-blue-50 dark:bg-gray-900"
                        : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }
                  `}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center bg-linear-to-br ${feed.color}`}
                  >
                    <Icon className="w-6 h-6 text-gray-900" />
                  </div>

                  <span className="text-sm font-medium text-center text-gray-900 dark:text-white">
                    {feed.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
