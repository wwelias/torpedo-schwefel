import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Torpedo Schwefel 2018",
  description: "Hobby-Fußballverein Torpedo Schwefel am Funkenplatz im Schwefel Hohenems, Österreich.",
  icons: {
    icon: "/torpedo-schwefel_logo.svg",
  },
  verification: {
    google: '3moP3CGZy8yC-kVeqaqr4swQlhnyQ7U2tJCvBejmRxM',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
