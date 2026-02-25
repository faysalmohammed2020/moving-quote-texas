import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Script from "next/script";
import ToastProvider from "@/components/ToastProvider";

// ✅ add this line
import AnalyticsTracker from "@/components/AnalyticsTracker";
import { Suspense } from "react";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Moving Quote Taxes",
  description: "Home changing service in Moving Taxes",
  icons: {
    icon: "/image/mini-Logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta
          name="google-site-verification"
          content="4aPyJNBP1ee_HByBQ--hqZ5UHNiMPXcIRb9HEfjY6j0"
        />
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX`}
          strategy="afterInteractive"
        />
        <Script id="ga4" strategy="afterInteractive">
          {`
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-XXXXXXX');
    `}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* ✅ GA-like custom analytics tracker */}
         <Suspense fallback={null}>
        <AnalyticsTracker />
      </Suspense>
        <Providers>{children}</Providers>
         <ToastProvider />
      </body>
    </html>
  );
}
