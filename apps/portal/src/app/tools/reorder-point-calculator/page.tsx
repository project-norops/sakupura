import type { Metadata } from "next";
import { withSocialMetadata } from "@/lib/metadata";
import { ReorderPointCalculatorPage } from "@sakupla/reorder-point-calculator";
import { ToolStructuredData } from "@sakupla/shared-ui";
import { ToolGuideWithRelated } from "@/components/ToolGuideWithRelated";
import { notFound } from "next/navigation";
import { getToolBySlug, isToolPublished } from "@/data/apps";
import { siteUrl } from "@/lib/site";

const tool = getToolBySlug("reorder-point-calculator");

export const metadata: Metadata = withSocialMetadata({
  title: "発注点・安全在庫計算",
  description:
    "週ごとの販売数、納期、現在庫、発注残から、安全在庫・発注点・発注時期と数量の参考値をブラウザ内で計算します。",
  alternates: { canonical: "/tools/reorder-point-calculator" },
  openGraph: {
    title: "発注点・安全在庫計算",
    description:
      "週ごとの販売数と納期から、安全在庫・発注点・発注時期の参考値を計算します。",
    url: "/tools/reorder-point-calculator",
  },
  twitter: {
    card: "summary_large_image",
    title: "発注点・安全在庫計算",
    description:
      "週ごとの販売数と納期から、安全在庫・発注点・発注時期の参考値を計算します。",
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
      <ReorderPointCalculatorPage />
      <ToolGuideWithRelated tool={tool} />
    </>
  );
}
