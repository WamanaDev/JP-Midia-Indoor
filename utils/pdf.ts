// utils/pdf.ts
// Client-side PDF helpers built on pdfjs-dist. The worker is self-hosted
// (see scripts/copy-pdf-worker.js) instead of pulled from a CDN, so it
// works under the app's CSP (script-src 'self' ...) with no extra origin
// to allow, and can't drift from the installed pdfjs-dist version.
"use client";

import * as pdfjsLib from "pdfjs-dist";
import type { PDFDocumentProxy } from "pdfjs-dist";

let workerConfigured = false;

function ensureWorker() {
  if (workerConfigured) return;
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  workerConfigured = true;
}

export async function loadPdf(
  source: File | Blob | string
): Promise<PDFDocumentProxy> {
  ensureWorker();

  const data =
    typeof source === "string" ? source : await source.arrayBuffer();

  return pdfjsLib.getDocument(
    typeof data === "string" ? { url: data } : { data }
  ).promise;
}

/** Renders a single PDF page onto an offscreen canvas and returns it as a JPEG blob. */
export async function renderPdfPageToBlob(
  pdf: PDFDocumentProxy,
  pageNumber: number,
  maxWidth = 1280
): Promise<Blob> {
  const page = await pdf.getPage(pageNumber);
  const baseViewport = page.getViewport({ scale: 1 });
  const scale = maxWidth / baseViewport.width;
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas error");

  await page.render({ canvas, canvasContext: ctx, viewport }).promise;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Falha ao gerar imagem da página"))),
      "image/jpeg",
      0.9
    );
  });
}

/** Generates a thumbnail (first page) from a local PDF File, before upload. */
export async function generatePdfThumbnail(file: File): Promise<Blob> {
  const pdf = await loadPdf(file);
  try {
    return await renderPdfPageToBlob(pdf, 1);
  } finally {
    pdf.loadingTask.destroy();
  }
}
