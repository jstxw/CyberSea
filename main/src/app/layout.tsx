import type { Metadata } from "next";
import { Geist, Geist_Mono, Unbounded } from "next/font/google";
import "./globals.css";
import CustomCursor from "@/components/CustomCursor";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Military Equipment Intelligence Platform",
  description: "AI-powered threat identification training system for military personnel",
  openGraph: {
    images: ["/hero.png"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/hero.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning style={{ backgroundColor: '#0a0a0a' }}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${unbounded.variable} antialiased cursor-none`}
        style={{ backgroundColor: '#0a0a0a' }}
        suppressHydrationWarning
      >
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
