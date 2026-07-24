import type { Metadata } from "next";
import "./globals.css";
import { AppLayout } from "@sakupla/shared-ui";

export const metadata: Metadata = {
  title: "⚡️ サクプラ by Norops",
  description: "サクプラ ポータルサイト - NOROPS のサービス一覧",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <AppLayout title="ポータルホーム">{children}</AppLayout>
      </body>
    </html>
  );
}
