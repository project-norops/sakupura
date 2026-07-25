import type { Metadata } from "next";
import "./globals.css";
import { AppLayout, googleServices } from "@sakupla/shared-ui";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "サクプラ｜登録不要で使える無料Webツール集",
    template: "%s | サクプラ",
  },
  description:
    "仕事・販売・SNS運用の面倒をすぐに片づける、登録不要の無料Webツール集。スマホ・PCのブラウザからすぐ使えます。",
  keywords: [
    "無料ツール",
    "Webツール",
    "業務効率化",
    "計算ツール",
    "SNS運用",
    "サクプラ",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "/",
    siteName: "サクプラ",
    title: "サクプラ｜登録不要で使える無料Webツール集",
    description:
      "仕事・販売・SNS運用の面倒をすぐに片づける、登録不要の無料Webツール集。",
  },
  twitter: {
    card: "summary",
    title: "サクプラ｜登録不要で使える無料Webツール集",
    description: "面倒な作業を、すぐに片づける。無料の実用Webツール集。",
  },
  verification: {
    google: googleServices.siteVerification,
  },
  other: {
    "google-adsense-account": googleServices.adsenseClientId,
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
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
