import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppLayout, googleServices } from "@sakupla/shared-ui";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "販売価格・利益シミュレーター | サクプラ",
  description:
    "目標手取り額、原価、決済手数料、販売数から推奨販売価格と利益を計算します。",
  verification: {
    google: googleServices.siteVerification,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AppLayout title="動的プライシング">{children}</AppLayout>
      </body>
    </html>
  );
}
