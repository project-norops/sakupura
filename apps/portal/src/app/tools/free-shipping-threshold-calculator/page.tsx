import type { Metadata } from "next";
import { FreeShippingThresholdCalculatorPage } from "@sakupla/free-shipping-threshold-calculator";
import { ToolStructuredData } from "@sakupla/shared-ui";
import { ToolGuideWithRelated } from "@/components/ToolGuideWithRelated";
import { notFound } from "next/navigation";
import { getToolBySlug, isToolPublished } from "@/data/apps";
import { siteUrl } from "@/lib/site";

const tool = getToolBySlug("free-shipping-threshold-calculator");

export const metadata: Metadata = {
  title: "送料無料ライン・利益シミュレーター",
  description:
    "注文額と粗利率、送料、決済費から送料無料ライン別の利益を比較します。",
  alternates: { canonical: "/tools/free-shipping-threshold-calculator" },
  openGraph: {
    title: "送料無料ライン・利益シミュレーター",
    description:
      "注文額と粗利率、送料、決済費から送料無料ライン別の利益を比較します。",
    url: "/tools/free-shipping-threshold-calculator",
  },
  twitter: {
    card: "summary",
    title: "送料無料ライン・利益シミュレーター",
    description:
      "注文額と粗利率、送料、決済費から送料無料ライン別の利益を比較します。",
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
      <FreeShippingThresholdCalculatorPage />
      <ToolGuideWithRelated tool={tool} />
    </>
  );
}
