import type { Metadata, Viewport } from "next";
import { Fredoka } from "next/font/google";
import { Logo } from "@/components/Logo";
import "./globals.css";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fredoka",
  display: "swap",
});

export const metadata: Metadata = {
  title: "StickNstay: magnet stickers to style your space",
  description:
    "5×7 inch magnet stickers for your fridge, locker, cupboard or whiteboard. Ready-made or fully custom. Made for IBS Mumbai batchmates. Cash on delivery.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#FFD45C",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fredoka.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        {/* Splash: CSS-only, plays on every full page load, then fades out and gets out of the way. */}
        <div className="splash" aria-hidden="true">
          <Logo className="splash-logo h-12 sm:h-16" />
        </div>
        {children}
      </body>
    </html>
  );
}
