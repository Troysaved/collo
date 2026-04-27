import type { Metadata } from "next";
import { Instrument_Serif, Instrument_Sans, EB_Garamond, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "@/components/ui/sonner";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-instrument-sans",
  display: "swap",
});

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-eb-garamond",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ViaVienna — Collaboration Platform",
  description: "A warm, editorial space for friends to plan things together.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fontVars = `${instrumentSerif.variable} ${instrumentSans.variable} ${ebGaramond.variable} ${jetbrainsMono.variable}`;

  return (
    <ClerkProvider>
      <html lang="en" className={fontVars}>
        <body style={{ background: "var(--paper)", color: "var(--ink)" }}>
          <div className="grid min-h-screen" style={{ gridTemplateColumns: "260px 1fr" }}>
            <Sidebar />
            <div style={{ background: "var(--paper)" }} className="overflow-y-auto scrollbar-hide">
              {children}
            </div>
          </div>

          <Toaster position="top-center" />
        </body>
      </html>
    </ClerkProvider>
  );
}
