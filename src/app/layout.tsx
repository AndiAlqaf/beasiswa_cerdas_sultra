import type { Metadata } from "next";
import { Rubik, Geist_Mono } from "next/font/google";
import "./globals.css";

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Beasiswa Sultra Cerdas",
  description: "Beasiswa Sultra Cerdas",
  icons: {
    icon: [
      { url: "/logo-sultra.png?v=2", type: "image/png" },
      { url: "/favicon.ico?v=2" },
    ],
    shortcut: "/logo-sultra.png?v=2",
    apple: "/logo-sultra.png?v=2",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${rubik.variable} ${geistMono.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/logo-sultra.png?v=2" type="image/png" />
        <link rel="shortcut icon" href="/logo-sultra.png?v=2" />
        <link rel="apple-touch-icon" href="/logo-sultra.png?v=2" />
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
