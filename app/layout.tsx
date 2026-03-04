import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { Header } from "@/src/components/Header";
import Footer from "@/src/components/Footer";
import { MSWProvider } from "@/src/mocks/msw-provider";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Scanner AI",
  description: "Receipt scanner powered by Gemini",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Scanner AI",
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

if (process.env.NODE_ENV === "development" && typeof window === "undefined") {
  const { server } = require("@/src/mocks/node");
  server.listen({ onUnhandledRequest: "bypass" });
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        <Providers>
       
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-grow">{children}</main>
              <Footer />
              <Toaster position="bottom-right" richColors/>
            </div>
         
        </Providers>
      </body>
    </html>
  );
}
