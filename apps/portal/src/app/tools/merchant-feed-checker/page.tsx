import type { Metadata } from "next";
import { MerchantFeedCheckerPage } from "@sakupla/merchant-feed-checker";
import { ToolGuide, ToolStructuredData } from "@sakupla/shared-ui";
import { notFound } from "next/navigation";
import { getToolBySlug, isToolPublished } from "@/data/apps";
import { siteUrl } from "@/lib/site";

const tool = getToolBySlug("merchant-feed-checker");

export const metadata: Metadata = {
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
    card: "summary",
    title: "Google Merchant Center商品フィード診断",
    description:
      "商品フィードの必須項目、価格、在庫、GTINなどをアップロード前に診断します。",
  },
};

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
      <ToolGuide title={tool.title} content={tool.content} />
    </>
  );
}
