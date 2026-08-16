import type { Metadata } from "next";
import { Fredoka, Manrope } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
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
    <html lang="en" className={`${fredoka.variable} ${manrope.variable}`}>
      <body>
        <Providers>
          <Nav />
          <main className="min-h-[100dvh]">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
