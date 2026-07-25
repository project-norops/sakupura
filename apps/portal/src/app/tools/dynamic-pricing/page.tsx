import type { Metadata } from "next";
import { DynamicPricingPage } from "@sakupla/dynamic-pricing";
import { ToolGuide } from "@sakupla/shared-ui";
import { notFound } from "next/navigation";
import { getToolBySlug, isToolPublished } from "@/data/apps";

const tool = getToolBySlug("dynamic-pricing");

export const metadata: Metadata = {
  title: "動的プライシング・収益シミュレーター | サクプラ",
  description:
    "目標手取り額、原価、決済手数料、販売数から推奨販売価格と利益を計算します。",
};

export default function Page() {
  if (!isToolPublished(tool)) notFound();

  return (
    <>
      <DynamicPricingPage />
      <ToolGuide title={tool.title} content={tool.content} />
    </>
  );
}
