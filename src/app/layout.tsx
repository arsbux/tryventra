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
  title: "Ventra | AI-Powered Lead Generation",
  description: "Find high-intent leads and automate your outreach with Ventra's AI-driven intelligence.",
  icons: {
    icon: "/images/logo.png",
    apple: "/images/logo.png",
  },
};

import { ToastProvider } from "@/components/Toaster";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ToastProvider>
          {children}
        </ToastProvider>
        <Script
          src="https://data.flightlabs.agency/trackify.js"
          data-site-id="tryventra-com-8lip7"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
