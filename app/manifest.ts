import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "JP Mídia Indoor",
    short_name: "JP Mídia",
    description:
      "Gestão de telas digitais em tempo real: playlists, clima, hora e notícias.",
    start_url: "/",
    display: "standalone",
    background_color: "#05070D",
    theme_color: "#05070D",
    icons: [
      {
        src: "/icons/favicos/favico192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/favicos/favico512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
