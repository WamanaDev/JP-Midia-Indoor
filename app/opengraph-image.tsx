import { ImageResponse } from "next/og";

export const alt = "JP Mídia Indoor — Gestão de telas digitais";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#05070D",
          backgroundImage:
            "radial-gradient(circle at 18% 20%, rgba(59,130,246,0.35), transparent 55%), radial-gradient(circle at 85% 85%, rgba(250,204,21,0.18), transparent 50%)",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 36,
          }}
        >
          <div
            style={{
              display: "flex",
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "linear-gradient(135deg, #3B82F6, #1E3A8A)",
              boxShadow: "0 0 40px -8px rgba(59,130,246,0.8)",
            }}
          />
          <div style={{ display: "flex", fontSize: 34, fontWeight: 700, color: "#ffffff" }}>
            JP Mídia Indoor
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 62,
            fontWeight: 800,
            color: "#ffffff",
            textAlign: "center",
            lineHeight: 1.15,
            maxWidth: 920,
          }}
        >
          O jeito moderno de controlar todas as suas telas
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 28,
            color: "#94a3b8",
            textAlign: "center",
            maxWidth: 780,
          }}
        >
          Playlists, clima, hora e notícias em tempo real — grátis para começar
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
