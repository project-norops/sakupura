import type { Metadata } from "next";
import { withSocialMetadata } from "@/lib/metadata";
import { PwaManifestCheckerPage } from "@sakupla/pwa-manifest-checker";
import { ToolStructuredData } from "@sakupla/shared-ui";
import { ToolGuideWithRelated } from "@/components/ToolGuideWithRelated";
import { notFound } from "next/navigation";
import { getToolBySlug, isToolPublished } from "@/data/apps";
import { siteUrl } from "@/lib/site";

const tool = getToolBySlug("pwa-manifest-checker");

export const metadata: Metadata = withSocialMetadata({
  title: "PWAマニフェスト・アイコン事前チェック",
  description:
    "Web App Manifestと端末内アイコンを読み込み、主要項目、URL関係、宣言サイズと実寸、maskable表示を公開前に確認します。",
  alternates: { canonical: "/tools/pwa-manifest-checker" },
  openGraph: {
    title: "PWAマニフェスト・アイコン事前チェック",
    description:
      "Web App Manifestと端末内アイコンを読み込み、主要項目、URL関係、宣言サイズと実寸、maskable表示を公開前に確認します。",
    url: "/tools/pwa-manifest-checker",
  },
  twitter: {
    card: "summary_large_image",
    title: "PWAマニフェスト・アイコン事前チェック",
    description:
      "Web App Manifestと端末内アイコンを読み込み、主要項目、URL関係、宣言サイズと実寸、maskable表示を公開前に確認します。",
  },
});

export default function Page() {
  if (!isToolPublished(tool)) notFound();

  return (
    <>
      <ToolStructuredData
        title={tool.title}
        description={tool.description}
        url={`${siteUrl}${tool.href}`}
        content={tool.content}
      />
      <PwaManifestCheckerPage />
      <ToolGuideWithRelated tool={tool} />
    </>
  );
}
