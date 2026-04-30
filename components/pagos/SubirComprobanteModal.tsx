"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import Modal from "@/components/ui/Modal";

interface Props {
  isOpen:      boolean;
  onClose:     () => void;
  onSubmit:    (data: { monto: number; numeroCuota: number; comprobante: string; numeroReferencia?: string }) => Promise<void>;
  numeroCuota: number;
  monto:       number;
  moneda:      string;
  isLoading:   boolean;
}

export default function SubirComprobanteModal({
  isOpen, onClose, onSubmit, numeroCuota, monto, moneda, isLoading,
}: Props) {
  const [fileUrl,          setFileUrl]          = useState<string | null>(null);
  const [fileType,         setFileType]         = useState<"image" | "pdf" | null>(null);
  const [fileName,         setFileName]         = useState<string>("");
  const [uploading,        setUploading]        = useState(false);
  const [uploadErr,        setUploadErr]        = useState<string | null>(null);
  const [dragging,         setDragging]         = useState(false);
  const [numeroReferencia, setNumeroReferencia] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploadErr(null);
    const isImage = file.type.startsWith("image/");
    const isPdf   = file.type === "application/pdf";
    if (!isImage && !isPdf) {
      setUploadErr("Solo se permiten imágenes (JPG, PNG) y PDFs");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadErr("El archivo no puede superar 5MB");
      return;
    }

    setFileName(file.name);
    setFileType(isImage ? "image" : "pdf");
    setUploading(true);

    try {
      const fd = new FormData();
      fd.append("file",   file);
      fd.append("folder", "comprobantes");

      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();

      if (!res.ok) throw new Error(json.error ?? "Error al subir");
      setFileUrl(json.url);
    } catch (err: unknown) {
      setUploadErr(err instanceof Error ? err.message : "Error al subir el archivo");
      setFileType(null);
      setFileName("");
    } finally {
      setUploading(false);
    }
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  async function handleSubmit() {
    if (!fileUrl) return;
    await onSubmit({
      monto,
      numeroCuota,
      comprobante:     fileUrl,
      numeroReferencia: numeroReferencia.trim() || undefined,
    });
    setFileUrl(null);
    setFileType(null);
    setFileName("");
    setNumeroReferencia("");
  }

  function handleClose() {
    if (uploading || isLoading) return;
    setFileUrl(null);
    setFileType(null);
    setFileName("");
    setUploadErr(null);
    setNumeroReferencia("");
    onClose();
  }

  const label = numeroCuota === 1 ? "1ª Cuota" : "2ª Cuota";

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Subir comprobante — ${label}`} size="md">
      <div className="space-y-4">
        {/* Info row */}
        <div className="flex items-center justify-between rounded-xl bg-green-50 border border-green-100 px-4 py-3">
          <span className="text-sm text-green-700 font-medium">{label}</span>
          <span className="text-lg font-bold text-green-800">
            {new Intl.NumberFormat("es-CO", { style: "currency", currency: moneda, minimumFractionDigits: 0 }).format(monto)}
          </span>
        </div>

        {/* Número de referencia */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número de referencia <span className="text-gray-400 font-normal">(opcional)</span>
          </label>
          <input
            type="text"
            value={numeroReferencia}
            onChange={(e) => setNumeroReferencia(e.target.value)}
            placeholder="Ej: 123456789"
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-mono focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-300"
          />
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 cursor-pointer transition-colors ${
            dragging
              ? "border-green-400 bg-green-50"
              : "border-gray-200 bg-gray-50 hover:border-green-300 hover:bg-green-50"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,application/pdf"
            className="hidden"
            onChange={handleInputChange}
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
              <p className="text-sm text-gray-500">Subiendo archivo...</p>
            </div>
          ) : fileUrl ? (
            /* Preview */
            fileType === "image" ? (
              <div className="flex flex-col items-center gap-2">
                <img src={fileUrl} alt="Comprobante" className="max-h-40 rounded-xl object-contain border border-gray-200" />
                <p className="text-xs text-gray-500">{fileName}</p>
                <p className="text-xs text-green-600 font-medium">Haz click para cambiar</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 border border-red-100">
                  <span className="text-3xl">📄</span>
                </div>
                <p className="text-sm font-medium text-gray-700 max-w-full truncate px-4">{fileName}</p>
                <p className="text-xs text-green-600 font-medium">Haz click para cambiar</p>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center gap-2 text-center">
              <span className="text-4xl">📎</span>
              <p className="text-sm font-medium text-gray-700">Arrastra o haz click para subir</p>
              <p className="text-xs text-gray-400">JPG, PNG o PDF · Máx. 5MB</p>
            </div>
          )}
        </div>

        {uploadErr && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {uploadErr}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={uploading || isLoading}
            className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!fileUrl || uploading || isLoading}
            className="flex-1 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-40 transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Enviando...
              </span>
            ) : (
              "Confirmar pago"
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
