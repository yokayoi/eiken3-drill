import type { Metadata, Viewport } from "next";
import { DotGothic16 } from "next/font/google";
import "./globals.css";

const pixelFont = DotGothic16({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
});

export const metadata: Metadata = {
  title: "さらちゃんの英検ステージ",
  description: "らんちゃんと一緒に英検3級の単語をマスターしよう！K-POPダンスタイムつき！",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`h-full antialiased ${pixelFont.variable}`}>
      <body className="min-h-full font-sans bg-kdark text-white">{children}</body>
    </html>
  );
}
