import type { ReactNode } from "react";
import Script from "next/script";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import { siteMetadata, siteViewport } from "@/lib/metadata";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { TrackingCapture } from "@/components/TrackingCapture";
import { EmailGateProvider } from "@/components/EmailGate";
import "./globals.css";

export const metadata = siteMetadata;
export const viewport = siteViewport;

/* Display: a warm, characterful grotesque for names and headlines.
 * Body: a refined humanist sans — legible, distinctly not system-default. */
const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});
const body = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`dark ${display.variable} ${body.variable}`}>
      <head>
        <link rel="icon" type="image/svg+xml" href="/ai-roleplay/favicon.svg" />
        <link rel="preconnect" href="https://clk.ourdreamnetwork.com" />
        {/* RedTrack universal tag — writes the rtkclickid-store cookie ASAP. */}
        <Script
          src="https://clk.ourdreamnetwork.com/uniclick.js?attribution=lastpaid&cookiedomain=ourdreamnetwork.com&cookieduration=30&defaultcampaignid=6a06af2165debd9009452848&regviewonce=false"
          strategy="afterInteractive"
        />
        {/* Google Tag Manager — provides the cross-domain _gl linker used by getGlValue. */}
        <Script id="gtm" strategy="afterInteractive">{`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
          var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
          j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
          f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-5VRS8QPJ');
        `}</Script>
      </head>
      <body className="flex min-h-screen flex-col bg-night-900 text-white">
        <TrackingCapture />
        <EmailGateProvider>
          <div className="relative z-10 flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1 pt-16">{children}</main>
            <SiteFooter />
          </div>
        </EmailGateProvider>
      </body>
    </html>
  );
}
