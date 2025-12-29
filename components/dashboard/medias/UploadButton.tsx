"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { uploadMediaAction } from "@/app/dashboard/medias/actions";
import { generateVideoThumbnail } from "@/utils/generateVideoThumbnail";

export default function UploadButton() {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // 🎥 Gerar thumbnail só se for vídeo
      if (file.type.startsWith("video/")) {
        const thumbBlob = await generateVideoThumbnail(file);
        formData.append("thumbnail", thumbBlob, `thumb-${file.name}.jpg`);
      }

      const result = await uploadMediaAction(formData);
      console.log("Upload concluído:", result);
      alert("Upload feito com sucesso!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      console.error(message);
      alert("Erro ao enviar arquivo: " + message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={handleFileChange}
        accept="video/*,image/*"
      />

      <label
        htmlFor="file-upload"
        className="cursor-pointer flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-lg"
      >
        <Plus className="w-5 h-5" />
        {uploading ? "Enviando..." : "Upload"}
      </label>
    </>
  );
}
