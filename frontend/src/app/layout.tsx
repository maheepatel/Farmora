import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Farmora - Farmland, Tokenised",
  description:
    "Farmora turns verified agricultural land into shareable digital assets on Monad. Own farmland by the acre, earn from every harvest.",
  openGraph: {
    title: "Farmora - Farmland, Tokenised",
    description:
      "Own farmland by the acre, earn from every harvest. RWA farmland on Monad.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${jakarta.variable}`}>
      <body>
        <div className="grain" aria-hidden />
        <Nav />
        <main className="min-h-[100dvh]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
