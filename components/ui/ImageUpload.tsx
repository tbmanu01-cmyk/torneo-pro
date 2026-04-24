"use client";

import { useRef, useCallback, useState } from "react";

interface ImageUploadProps {
  onUpload:   (url: string) => void;
  currentUrl?: string;
  label?:     string;
  folder?:    string;
}

export default function ImageUpload({
  onUpload,
  currentUrl,
  label  = "Logo",
  folder = "general",
}: ImageUploadProps) {
  const [preview,   setPreview]   = useState<string | null>(currentUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [dragOver,  setDragOver]  = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) return alert("Solo se permiten imágenes");
      if (file.size > 5 * 1024 * 1024)     return alert("Máximo 5MB");

      // Preview local inmediato
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);

      setUploading(true);
      try {
        const fd = new FormData();
        fd.append("file",   file);
        fd.append("folder", folder);

        const res  = await fetch("/api/upload", { method: "POST", body: fd });
        const json = await res.json();

        if (!res.ok) throw new Error(json.error ?? "Error al subir");
        onUpload(json.url);
      } catch (e) {
        alert(e instanceof Error ? e.message : "Error al subir imagen");
        setPreview(currentUrl ?? null);
      } finally {
        setUploading(false);
      }
    },
    [currentUrl, folder, onUpload]
  );

  return (
    <div>
      <p className="label-base">{label}</p>
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e)  => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={()  => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files[0];
          if (f) handleFile(f);
        }}
        className={[
          "mt-1 flex min-h-[130px] cursor-pointer flex-col items-center justify-center",
          "rounded-xl border-2 border-dashed transition-colors",
          dragOver    ? "border-green-500 bg-green-50"       : "border-gray-300 hover:border-green-400",
          uploading   ? "pointer-events-none opacity-60"     : "",
        ].join(" ")}
      >
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="h-24 w-24 rounded-lg object-cover"
            />
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 text-center">
            {uploading ? (
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
            ) : (
              <>
                <p className="text-3xl mb-2">📷</p>
                <p className="text-sm text-gray-500">
                  Arrastra o <span className="font-medium text-green-600">selecciona</span>
                </p>
                <p className="mt-0.5 text-xs text-gray-400">PNG, JPG, WebP · máx 5 MB</p>
              </>
            )}
          </div>
        )}
      </div>

      {preview && !uploading && (
        <button
          type="button"
          onClick={() => { setPreview(null); onUpload(""); }}
          className="mt-1 text-xs text-red-500 hover:text-red-700"
        >
          Quitar imagen
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
    </div>
  );
}
