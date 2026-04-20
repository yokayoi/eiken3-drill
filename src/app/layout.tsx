import type { Metadata, Viewport } from "next";
import "./globals.css";

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
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full font-sans bg-kdark text-white">{children}</body>
    </html>
  );
}
