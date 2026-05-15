import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "AdminSimpl — L'assistant qui simplifie vos démarches administratives",
  description:
    "Pré-remplissage sécurisé, suivi en temps réel et alertes proactives pour vos démarches auprès des impôts, de la CAF et des aides locales.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
