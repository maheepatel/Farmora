import "@/lib/polyfill";
import type { Metadata } from "next";
import { Manrope, Baloo_2 } from "next/font/google";
import "@rainbow-me/rainbowkit/styles.css";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/site/footer";
import { Providers } from "@/lib/provider";

const baloo = Baloo_2({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Farmora — Real land. Real yield. No tractor required.",
  description:
    "Farmora. Fractional acres of real farmland on Monad — invest in a parcel, earn from the harvest, or book a weekend on the land you own. Every figure is read straight from the contract.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${baloo.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/*
          DIRECTION CONTRACT — FARMORA · CARTOON NEUBRUTAL AGRITECH
          THESIS: An investment farm that feels like a playful sticker book,
          not a terminal. Chunky 2px ink outlines, hard sticker shadows that
          "push down" when pressed, flat playful color, rounded Baloo 2 display
          type, and springy press physics.
          OWN-WORLD: Cream ground, white sticker cards with thick hard shadows
          and bold forest-green outlines, harvest-gold reserved for the "go"
          moment and the stay, sage as the primary green, tabular figures for
          every on-chain number, all crop art as inline SVG, and a real
          celebration for each money flow — buy, sell, book, claim.
          STORY: A first-time visitor understands in seconds that this is real
          farmland you can invest in, that the economics are transparent
          (70% → 0% share, 5 pts/yr on a mid-stream sale, 90-day cooldown then
          money back, +1%/yr once a year's passed), and that every
          figure is read straight from the contract.
          FIRST VIEWPORT: Cream hero, big rounded headline, a "Live" badge,
          two chunky actions — Invest / Stay the weekend — and a farm video
          beside the live-share panel.
          FINISH: unreviewed and undocumented is unfinished; this build ends
          with the finish review, the verdict, and DESIGN.md.
        */}
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
