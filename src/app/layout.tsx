import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ventra | AI Answer Engine Optimization (AEO) Platform",
  description: "The world's first AEO platform. Optimize your brand for ChatGPT, Perplexity, Gemini, and Claude. Fix what's stopping your site from being the answer.",
  icons: {
    icon: "/images/favicon.png",
    apple: "/images/logo.svg",
  },
};

import { ToastProvider } from "@/components/Toaster";

import { ThemeProvider } from "@/components/ThemeProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
        <Script
          src="https://data.flightlabs.agency/trackify.js"
          data-site-id="tryventra-com-8lip7"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
