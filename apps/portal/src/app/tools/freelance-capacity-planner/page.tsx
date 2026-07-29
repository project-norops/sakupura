import type { Metadata } from "next";
import { withSocialMetadata } from "@/lib/metadata";
import { FreelanceCapacityPlannerPage } from "@sakupla/freelance-capacity-planner";
import { ToolStructuredData } from "@sakupla/shared-ui";
import { ToolGuideWithRelated } from "@/components/ToolGuideWithRelated";
import { notFound } from "next/navigation";
import { getToolBySlug, isToolPublished } from "@/data/apps";
import { siteUrl } from "@/lib/site";

const tool = getToolBySlug("freelance-capacity-planner");

export const metadata: Metadata = withSocialMetadata({
  title: "稼働・売上キャパシティ計画",
  description:
    "翌月の稼働可能時間から既存案件と非請求時間を差し引き、新規案件を受けられる余力と売上見込みを確認します。",
  alternates: { canonical: "/tools/freelance-capacity-planner" },
  openGraph: {
    title: "稼働・売上キャパシティ計画",
    description:
      "翌月の稼働可能時間から既存案件と非請求時間を差し引き、新規案件を受けられる余力と売上見込みを確認します。",
    url: "/tools/freelance-capacity-planner",
  },
  twitter: {
    card: "summary_large_image",
    title: "稼働・売上キャパシティ計画",
    description:
      "翌月の稼働可能時間から既存案件と非請求時間を差し引き、新規案件を受けられる余力と売上見込みを確認します。",
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
      <FreelanceCapacityPlannerPage />
      <ToolGuideWithRelated tool={tool} />
    </>
  );
}
