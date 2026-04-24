import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import NextAuthProvider from "@/components/providers/SessionProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TorneoPro - Gestión de Torneos de Fútbol",
  description: "Plataforma profesional para la gestión de torneos de fútbol amateur",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <NextAuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { borderRadius: "10px", fontSize: "14px" },
              success: { iconTheme: { primary: "#16a34a", secondary: "#fff" } },
              error:   { iconTheme: { primary: "#dc2626", secondary: "#fff" } },
            }}
          />
        </NextAuthProvider>
      </body>
    </html>
  );
}
