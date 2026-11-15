import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif, Silkscreen, VT323 } from "next/font/google";
import "./globals.css";
import { GameProvider } from "@/components/providers/GameProvider";
import { Hud } from "@/components/hud/Hud";
import { site } from "@/content/site";

// Interim typefaces. To use the designer's own fonts, put files in /public/assets/fonts
// and switch these to next/font/local with the same `variable` names.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const instrument = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-instrument", display: "swap" });
const silkscreen = Silkscreen({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-silkscreen", display: "swap" });
const vt323 = VT323({ subsets: ["latin"], weight: "400", variable: "--font-vt323", display: "swap" });

export const metadata: Metadata = {
  title: { default: `${site.name} — ${site.role}`, template: `%s — ${site.name}` },
  description: `${site.name} is a ${site.role.toLowerCase()}. Explore the portfolio as a small retro game world, or jump straight to the projects.`,
};

export const viewport: Viewport = { themeColor: "#07080f", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${instrument.variable} ${silkscreen.variable} ${vt323.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-gold focus:px-4 focus:py-2 focus:font-pixel focus:text-void"
        >
          Skip to content
        </a>
        <GameProvider>
          <Hud />
          <main id="main" tabIndex={-1} className="outline-none">
            {children}
          </main>
        </GameProvider>
      </body>
    </html>
  );
}
