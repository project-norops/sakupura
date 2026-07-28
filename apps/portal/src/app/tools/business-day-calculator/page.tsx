import type { Metadata } from "next";
import { withSocialMetadata } from "@/lib/metadata";
import { BusinessDayCalculatorPage } from "@sakupla/business-day-calculator";
import { ToolStructuredData } from "@sakupla/shared-ui";
import { ToolGuideWithRelated } from "@/components/ToolGuideWithRelated";
import { notFound } from "next/navigation";
import { getToolBySlug, isToolPublished } from "@/data/apps";
import { siteUrl } from "@/lib/site";

const tool = getToolBySlug("business-day-calculator");

export const metadata: Metadata = withSocialMetadata({
  title: "営業日・期限計算カレンダー",
  description:
    "土日・日本の祝日・任意休業日を除外し、指定営業日後または前の期限を計算します。",
  alternates: { canonical: "/tools/business-day-calculator" },
  openGraph: {
    title: "営業日・期限計算カレンダー",
    description:
      "土日・日本の祝日・任意休業日を除外し、指定営業日後または前の期限を計算します。",
    url: "/tools/business-day-calculator",
  },
  twitter: {
    card: "summary_large_image",
    title: "営業日・期限計算カレンダー",
    description:
      "土日・日本の祝日・任意休業日を除外し、指定営業日後または前の期限を計算します。",
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
      <BusinessDayCalculatorPage />
      <ToolGuideWithRelated tool={tool} />
    </>
  );
}
