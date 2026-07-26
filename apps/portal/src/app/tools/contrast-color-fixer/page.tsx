import type { Metadata } from "next";
import { ContrastColorFixerPage } from "@sakupla/contrast-color-fixer";
import { ToolStructuredData } from "@sakupla/shared-ui";
import { ToolGuideWithRelated } from "@/components/ToolGuideWithRelated";
import { notFound } from "next/navigation";
import { getToolBySlug, isToolPublished } from "@/data/apps";
import { siteUrl } from "@/lib/site";

const tool = getToolBySlug("contrast-color-fixer");

export const metadata: Metadata = {
  title: "配色コントラスト改善ツール",
  description:
    "文字色と背景色の見やすさを判定し、WCAG基準を満たす近似色を提案します。",
  alternates: { canonical: "/tools/contrast-color-fixer" },
  openGraph: {
    title: "配色コントラスト改善ツール",
    description:
      "文字色と背景色の見やすさを判定し、WCAG基準を満たす近似色を提案します。",
    url: "/tools/contrast-color-fixer",
  },
  twitter: {
    card: "summary",
    title: "配色コントラスト改善ツール",
    description:
      "文字色と背景色の見やすさを判定し、WCAG基準を満たす近似色を提案します。",
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
      <ContrastColorFixerPage />
      <ToolGuideWithRelated tool={tool} />
    </>
  );
}
