import type { Metadata } from "next";
import { withSocialMetadata } from "@/lib/metadata";
import { MadeToOrderProfitCalculatorPage } from "@sakupla/made-to-order-profit-calculator";
import { ToolStructuredData } from "@sakupla/shared-ui";
import { ToolGuideWithRelated } from "@/components/ToolGuideWithRelated";
import { notFound } from "next/navigation";
import { getToolBySlug, isToolPublished } from "@/data/apps";
import { siteUrl } from "@/lib/site";

const tool = getToolBySlug("made-to-order-profit-calculator");

export const metadata: Metadata = withSocialMetadata({
  title: "グッズ受注生産・完売ライン計算",
  description:
    "販売価格と製造見積りから、ロット別の損益分岐注文数・完売時利益・1個当たり利益を比較します。",
  alternates: { canonical: "/tools/made-to-order-profit-calculator" },
  openGraph: {
    title: "グッズ受注生産・完売ライン計算",
    description:
      "販売価格と製造見積りから、ロット別の損益分岐注文数・完売時利益・1個当たり利益を比較します。",
    url: "/tools/made-to-order-profit-calculator",
  },
  twitter: {
    card: "summary_large_image",
    title: "グッズ受注生産・完売ライン計算",
    description:
      "販売価格と製造見積りから、ロット別の損益分岐注文数・完売時利益・1個当たり利益を比較します。",
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
      <MadeToOrderProfitCalculatorPage />
      <ToolGuideWithRelated tool={tool} />
    </>
  );
}
