import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portefolio",
  description: "Portfolio de projets - design, impression 3D, developpement.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="font-sans antialiased bg-white text-black">{children}</body>
    </html>
  );
}
