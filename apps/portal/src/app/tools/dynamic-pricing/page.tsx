import type { Metadata } from "next";
import { DynamicPricingPage } from "@sakupla/dynamic-pricing";
import { ToolGuide, ToolStructuredData } from "@sakupla/shared-ui";
import { notFound } from "next/navigation";
import { getToolBySlug, isToolPublished } from "@/data/apps";
import { siteUrl } from "@/lib/site";

const tool = getToolBySlug("dynamic-pricing");

export const metadata: Metadata = {
  title: "動的プライシング・収益シミュレーター",
  description:
    "目標手取り額、原価、決済手数料、販売数から推奨販売価格と利益を計算します。",
  alternates: { canonical: "/tools/dynamic-pricing" },
  openGraph: {
    title: "動的プライシング・収益シミュレーター",
    description: tool.description,
    url: "/tools/dynamic-pricing",
  },
  twitter: {
    card: "summary",
    title: "動的プライシング・収益シミュレーター",
    description: tool.description,
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
      <DynamicPricingPage />
      <ToolGuide title={tool.title} content={tool.content} />
    </>
  );
}
