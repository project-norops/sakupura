import type { Metadata } from "next";
import { LaborSalesPlannerPage } from "@sakupla/labor-sales-planner";
import { ToolStructuredData } from "@sakupla/shared-ui";
import { ToolGuideWithRelated } from "@/components/ToolGuideWithRelated";
import { notFound } from "next/navigation";
import { getToolBySlug, isToolPublished } from "@/data/apps";
import { siteUrl } from "@/lib/site";

const tool = getToolBySlug("labor-sales-planner");

export const metadata: Metadata = {
  title: "人時売上・シフト採算シミュレーター",
  description:
    "時間帯別の予想売上と人数・勤務時間・時給から、人時売上と人件費率を比較します。",
  alternates: { canonical: "/tools/labor-sales-planner" },
  openGraph: {
    title: "人時売上・シフト採算シミュレーター",
    description:
      "時間帯別の予想売上と人数・勤務時間・時給から、人時売上と人件費率を比較します。",
    url: "/tools/labor-sales-planner",
  },
  twitter: {
    card: "summary",
    title: "人時売上・シフト採算シミュレーター",
    description:
      "時間帯別の予想売上と人数・勤務時間・時給から、人時売上と人件費率を比較します。",
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
      <LaborSalesPlannerPage />
      <ToolGuideWithRelated tool={tool} />
    </>
  );
}
