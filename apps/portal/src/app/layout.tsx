import type { Metadata } from "next";
import "./globals.css";
import { AppLayout, googleServices } from "@sakupla/shared-ui";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "⚡️ サクプラ by Norops",
  description: "サクプラ ポータルサイト - NOROPS のサービス一覧",
  verification: {
    google: googleServices.siteVerification,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <AppLayout title="ポータルホーム">{children}</AppLayout>
      </body>
    </html>
  );
}
