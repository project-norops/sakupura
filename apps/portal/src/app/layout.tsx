import type { Metadata } from "next";
import { withSocialMetadata } from "@/lib/metadata";
import "./globals.css";
import { AppLayout, googleServices } from "@sakupla/shared-ui";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = withSocialMetadata({
  metadataBase: new URL(siteUrl),
  title: {
    default: "サクプラ｜仕事の進め方がわかる実践ガイド・無料Webツール",
    template: "%s | サクプラ",
  },
  description:
    "受注・請求、ネットショップ、CSV、Web公開などの仕事の進め方を、具体的な手順と無料Webツールで支援します。登録不要でスマホ・PCから利用できます。",
  keywords: [
    "無料ツール",
    "Webツール",
    "業務効率化",
    "計算ツール",
    "SNS運用",
    "仕事の進め方",
    "実践ガイド",
    "サクプラ",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "/",
    siteName: "サクプラ",
    title: "サクプラ｜仕事の進め方がわかる実践ガイド・無料Webツール",
    description:
      "仕事の進め方を具体的な手順で学び、必要な計算や確認には登録不要の無料Webツールを使えます。",
  },
  twitter: {
    card: "summary_large_image",
    title: "サクプラ｜仕事の進め方がわかる実践ガイド・無料Webツール",
    description: "仕事の手順を学び、必要な作業をその場で進められます。",
  },
  verification: {
    google: googleServices.siteVerification,
  },
  other: {
    "google-adsense-account": googleServices.adsenseClientId,
  },
});

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
