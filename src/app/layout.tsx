import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { LanguageProvider } from "@/lib/i18n/context";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "FoodBridge AI — rescue surplus food before it is wasted",
    template: "%s · FoodBridge AI",
  },
  description:
    "FoodBridge AI predicts which surplus food is about to be wasted, matches it with the verified community organisation best placed to use it, and explains every recommendation.",
};

export const viewport: Viewport = {
  themeColor: "#1f6540",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen font-sans">
        <LanguageProvider>
          {children}
        </LanguageProvider>
        <Toaster
          position="bottom-right"
          richColors
          closeButton
          toastOptions={{ duration: 4500 }}
        />
      </body>
    </html>
  );
}

