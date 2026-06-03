import type { ReactNode } from "react";
import { siteMetadata, siteViewport } from "@/lib/metadata";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TrackingCapture } from "@/components/TrackingCapture";
import "./globals.css";

export const metadata = siteMetadata;
export const viewport = siteViewport;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Warm the connection to the image origin so the cross-origin
         * TCP+TLS handshake is overlapped with HTML parse. Character
         * images are the LCP candidate on /characters/[slug]. */}
        <link
          rel="preconnect"
          href="https://img.ourdream.ai"
          crossOrigin="anonymous"
        />
      </head>
      <body className="flex min-h-screen flex-col">
        {/* Captures inbound tracking params into localStorage on first
         * load so they survive internal navigation. Renders nothing. */}
        <TrackingCapture />
        <Header />
        {/* pt-16 accounts for fixed header height */}
        <main className="flex-1 pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
