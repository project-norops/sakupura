import type { Metadata } from "next";
import { ReturnCostCalculatorPage } from "@sakupla/return-cost-calculator";
import { ToolStructuredData } from "@sakupla/shared-ui";
import { ToolGuideWithRelated } from "@/components/ToolGuideWithRelated";
import { notFound } from "next/navigation";
import { getToolBySlug, isToolPublished } from "@/data/apps";
import { withSocialMetadata } from "@/lib/metadata";
import { siteUrl } from "@/lib/site";

const tool = getToolBySlug("return-cost-calculator");

export const metadata: Metadata = withSocialMetadata({
  title: "返品・交換コスト試算",
  description:
    "返品率や返送料、再販可否から返品後の利益と改善シナリオを比較します。",
  alternates: { canonical: "/tools/return-cost-calculator" },
  openGraph: {
    title: "返品・交換コスト試算",
    description:
      "返品率や返送料、再販可否から返品後の利益と改善シナリオを比較します。",
    url: "/tools/return-cost-calculator",
  },
  twitter: {
    card: "summary_large_image",
    title: "返品・交換コスト試算",
    description:
      "返品率や返送料、再販可否から返品後の利益と改善シナリオを比較します。",
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
      <ReturnCostCalculatorPage />
      <ToolGuideWithRelated tool={tool} />
    </>
  );
}
