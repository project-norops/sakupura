import type { Metadata } from "next";
import { PopupEventProfitCalculatorPage } from "@sakupla/popup-event-profit-calculator";
import { ToolStructuredData } from "@sakupla/shared-ui";
import { ToolGuideWithRelated } from "@/components/ToolGuideWithRelated";
import { notFound } from "next/navigation";
import { getToolBySlug, isToolPublished } from "@/data/apps";
import { withSocialMetadata } from "@/lib/metadata";
import { siteUrl } from "@/lib/site";

const tool = getToolBySlug("popup-event-profit-calculator");

export const metadata: Metadata = withSocialMetadata({
  title: "ポップアップ出店採算・必要販売数",
  description:
    "出店費用と商品構成から損益分岐売上、必要販売数、想定利益を試算します。",
  alternates: { canonical: "/tools/popup-event-profit-calculator" },
  openGraph: {
    title: "ポップアップ出店採算・必要販売数",
    description:
      "出店費用と商品構成から損益分岐売上、必要販売数、想定利益を試算します。",
    url: "/tools/popup-event-profit-calculator",
  },
  twitter: {
    card: "summary_large_image",
    title: "ポップアップ出店採算・必要販売数",
    description:
      "出店費用と商品構成から損益分岐売上、必要販売数、想定利益を試算します。",
  },
});

export default function Page() {
  const isPreview =
    process.env.VERCEL_ENV === "preview" ||
    process.env.NODE_ENV === "development";
  if (!isToolPublished(tool) && !isPreview) notFound();

  return (
    <>
      <ToolStructuredData
        title={tool.title}
        description={tool.description}
        url={`${siteUrl}${tool.href}`}
        content={tool.content}
      />
      <PopupEventProfitCalculatorPage />
      <ToolGuideWithRelated tool={tool} />
    </>
  );
}
