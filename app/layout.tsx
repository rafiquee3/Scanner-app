import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { Header } from "@/src/components/Header";
import { MSWProvider } from "@/src/mocks/msw-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Scanner App",
  description: "Receipt scanner powered by Gemini",
};

 if (process.env.NODE_ENV === 'development' && typeof window === 'undefined') {
  const { server } = require('@/src/mocks/node');
  server.listen();
} 

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <MSWProvider>
            <Header/>
            {children}
          </MSWProvider>
        </Providers>
      </body>
    </html>
  );
}
