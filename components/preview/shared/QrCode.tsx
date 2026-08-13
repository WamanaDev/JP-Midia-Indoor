"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

interface QrCodeProps {
  value: string;
  size?: number;
  className?: string;
  /** cor do "código" (padrão preto) e do fundo (padrão branco) */
  dark?: string;
  light?: string;
}

/** QR code real (não decorativo), gerado no cliente a partir do link da notícia. */
export function QrCode({
  value,
  size = 96,
  className,
  dark = "#14181f",
  light = "#ffffff",
}: QrCodeProps) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    QRCode.toDataURL(value, {
      width: size,
      margin: 1,
      color: { dark, light },
    })
      .then((url) => {
        if (active) setSrc(url);
      })
      .catch((e) => console.error("Erro ao gerar QR code", e));

    return () => {
      active = false;
    };
  }, [value, size, dark, light]);

  if (!src) {
    return (
      <div
        className={className}
        style={{ width: size, height: size, background: light }}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} width={size} height={size} className={className} alt="QR code para ler a matéria completa" />
  );
}
