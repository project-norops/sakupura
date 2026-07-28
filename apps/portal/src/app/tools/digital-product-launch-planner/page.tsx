import type { Metadata } from "next";
import { withSocialMetadata } from "@/lib/metadata";
import { DigitalProductLaunchPlannerPage } from "@sakupla/digital-product-launch-planner";
import { ToolStructuredData } from "@sakupla/shared-ui";
import { ToolGuideWithRelated } from "@/components/ToolGuideWithRelated";
import { notFound } from "next/navigation";
import { getToolBySlug, isToolPublished } from "@/data/apps";
import { siteUrl } from "@/lib/site";

const tool = getToolBySlug("digital-product-launch-planner");

export const metadata: Metadata = withSocialMetadata({
  title: "デジタル商品ローンチ逆算プランナー",
  description:
    "発売日から準備工程を逆算し、日付付きチェックリストとICSを作成します。",
  alternates: { canonical: "/tools/digital-product-launch-planner" },
  openGraph: {
    title: "デジタル商品ローンチ逆算プランナー",
    description:
      "発売日から準備工程を逆算し、日付付きチェックリストとICSを作成します。",
    url: "/tools/digital-product-launch-planner",
  },
  twitter: {
    card: "summary_large_image",
    title: "デジタル商品ローンチ逆算プランナー",
    description:
      "発売日から準備工程を逆算し、日付付きチェックリストとICSを作成します。",
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
      <DigitalProductLaunchPlannerPage />
      <ToolGuideWithRelated tool={tool} />
    </>
  );
}
