import type { Metadata } from "next";
import { Geist, Geist_Mono,Poppins } from "next/font/google";
import "./globals.css";
import localFont from 'next/font/local';

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const gibed = localFont({
  src: '../fonts/gibed.otf',
  display: 'swap',
  variable: '--font-gibed',
})
export const metadata: Metadata = {
  title: "mapa",
  description: "Medical Equipment should not play hide and seek, use mapa.",
};

// Force dynamic rendering for the entire app since it uses Firebase
export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} ${gibed.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
