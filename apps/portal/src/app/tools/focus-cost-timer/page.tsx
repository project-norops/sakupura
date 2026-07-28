import type { Metadata } from "next";
import { withSocialMetadata } from "@/lib/metadata";
import { FocusCostTimerPage } from "@sakupla/focus-cost-timer";
import { ToolStructuredData } from "@sakupla/shared-ui";
import { ToolGuideWithRelated } from "@/components/ToolGuideWithRelated";
import { notFound } from "next/navigation";
import { getToolBySlug, isToolPublished } from "@/data/apps";
import { siteUrl } from "@/lib/site";

const tool = getToolBySlug("focus-cost-timer");

export const metadata: Metadata = withSocialMetadata({
  title: "作業時間・工数コストタイマー",
  description:
    "作業時間と時給から、いままでにかかった工数コストをリアルタイム表示します。",
  alternates: { canonical: "/tools/focus-cost-timer" },
  openGraph: {
    title: "作業時間・工数コストタイマー",
    description:
      "作業時間と時給から、いままでにかかった工数コストをリアルタイム表示します。",
    url: "/tools/focus-cost-timer",
  },
  twitter: {
    card: "summary_large_image",
    title: "作業時間・工数コストタイマー",
    description:
      "作業時間と時給から、いままでにかかった工数コストをリアルタイム表示します。",
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
      <FocusCostTimerPage />
      <ToolGuideWithRelated tool={tool} />
    </>
  );
}
