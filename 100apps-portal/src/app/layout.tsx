import type { Metadata } from "next";
import "./globals.css";
import { AppLayout } from "@100apps/shared-ui";

export const metadata: Metadata = {
  title: "⚡️ サクプラ by Norops",
  description: "100apps ポータルサイト - サクプラ by Norops",
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
