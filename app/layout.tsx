import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RoterizAI",
  description: "Sistema operacional de criação de conteúdo com IA",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
