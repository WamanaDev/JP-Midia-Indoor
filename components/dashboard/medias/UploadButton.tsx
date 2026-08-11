"use client";

import { uploadMediaAction } from "@/app/dashboard/medias/actions";
import { LimitReachedModal } from "@/components/dashboard/LimitReachedModal";
import { useCheckLimits } from "@/hooks/useCheckLimits";
import { generateVideoThumbnail } from "@/utils/generateVideoThumbnail";
import { AlertCircle, Upload } from "lucide-react";
import { useRef, useState } from "react";

export default function UploadButton() {
  const [uploading, setUploading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [usageData, setUsageData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { checkStorageLimit, getUserUsage } = useCheckLimits();

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);

    // Verificar se pode fazer upload
    const canUpload = await checkStorageLimit(file.size);

    if (!canUpload) {
      // Buscar dados de uso para mostrar no modal
      const usage = await getUserUsage();
      setUsageData(usage);
      setShowLimitModal(true);

      // Limpar o input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // Se pode fazer upload, prosseguir
    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      // Gera a thumbnail a partir do arquivo local (sem depender de CORS
      // do R2, já que ainda não foi enviado a lugar nenhum). Se falhar,
      // segue o upload sem thumbnail em vez de bloquear tudo.
      if (file.type.startsWith("video/")) {
        try {
          const thumbBlob = await generateVideoThumbnail(file);
          formData.append("thumbnail", thumbBlob, "thumbnail.jpg");
        } catch (thumbErr) {
          console.error("⚠️ Não foi possível gerar a thumbnail:", thumbErr);
        }
      } else if (file.type === "application/pdf") {
        try {
          // Dynamic import: pdfjs-dist touches browser-only APIs (DOMMatrix)
          // at module evaluation time, so it must never load during SSR —
          // a static import here would crash the server render of any page
          // that includes this component, even though PDFs are only
          // touched inside this click handler.
          const { generatePdfThumbnail } = await import("@/utils/pdf");
          const thumbBlob = await generatePdfThumbnail(file);
          formData.append("thumbnail", thumbBlob, "thumbnail.jpg");
        } catch (thumbErr) {
          console.error("⚠️ Não foi possível gerar a thumbnail do PDF:", thumbErr);
        }
      }

      await uploadMediaAction(formData);

      // Limpar o input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Recarregar a página
      window.location.reload();
    } catch (err: any) {
      console.error("❌ Erro no upload:", err);
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        disabled={uploading}
        className="hidden"
        id="file-upload"
        accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime,application/pdf"
      />

      <label
        htmlFor="file-upload"
        className={`cursor-pointer flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
          uploading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {uploading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <Upload className="w-5 h-5" />
            Upload de Mídia
          </>
        )}
      </label>

      {/* Erro */}
      {error && (
        <div className="fixed bottom-4 right-4 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg shadow-lg max-w-md">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Modal de Limite Atingido */}
      {usageData && (
        <LimitReachedModal
          isOpen={showLimitModal}
          onClose={() => setShowLimitModal(false)}
          limitType="storage"
          currentUsage={usageData.storage.current_gb}
          maxUsage={usageData.storage.max_gb}
        />
      )}
    </>
  );
}
