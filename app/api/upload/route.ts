import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  try {
    const data   = await req.formData();
    const file   = data.get("file")   as File;
    const folder = (data.get("folder") as string) || "general";

    if (!file) return NextResponse.json({ error: "No se proporcionó archivo" }, { status: 400 });

    const isImage = file.type.startsWith("image/");
    const isPdf   = file.type === "application/pdf";

    if (!isImage && !isPdf) {
      return NextResponse.json({ error: "Solo se permiten imágenes (JPG, PNG) y PDFs" }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "El archivo no puede superar 5MB" }, { status: 400 });
    }

    const bytes  = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: `torneo-pro/${folder}`, resource_type: "auto" },
          (err, res) => (err ? reject(err) : resolve(res as { secure_url: string }))
        )
        .end(buffer);
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Error al subir archivo" }, { status: 500 });
  }
}
