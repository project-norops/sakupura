import type { Metadata } from "next";
import { withSocialMetadata } from "@/lib/metadata";
import { MerchantFeedCheckerPage } from "@sakupla/merchant-feed-checker";
import { ToolStructuredData } from "@sakupla/shared-ui";
import { ToolGuideWithRelated } from "@/components/ToolGuideWithRelated";
import { notFound } from "next/navigation";
import { getToolBySlug, isToolPublished } from "@/data/apps";
import { siteUrl } from "@/lib/site";

const tool = getToolBySlug("merchant-feed-checker");

export const metadata: Metadata = withSocialMetadata({
  title: "Google Merchant Center商品フィード診断",
  description:
    "商品フィードの必須項目、価格、在庫、GTINなどをアップロード前に診断します。",
  alternates: { canonical: "/tools/merchant-feed-checker" },
  openGraph: {
    title: "Google Merchant Center商品フィード診断",
    description:
      "商品フィードの必須項目、価格、在庫、GTINなどをアップロード前に診断します。",
    url: "/tools/merchant-feed-checker",
  },
  twitter: {
    card: "summary_large_image",
    title: "Google Merchant Center商品フィード診断",
    description:
      "商品フィードの必須項目、価格、在庫、GTINなどをアップロード前に診断します。",
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
      <MerchantFeedCheckerPage />
      <ToolGuideWithRelated tool={tool} />
    </>
  );
}
