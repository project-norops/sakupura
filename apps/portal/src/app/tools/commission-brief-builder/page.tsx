import type { Metadata } from "next";
import { CommissionBriefBuilderPage } from "@sakupla/commission-brief-builder";
import { ToolStructuredData } from "@sakupla/shared-ui";
import { ToolGuideWithRelated } from "@/components/ToolGuideWithRelated";
import { notFound } from "next/navigation";
import { getToolBySlug, isToolPublished } from "@/data/apps";
import { siteUrl } from "@/lib/site";

const tool = getToolBySlug("commission-brief-builder");

export const metadata: Metadata = {
  title: "制作案件ヒアリングシート作成",
  description:
    "制作依頼の用途・サイズ・納期・修正・納品形式を質問に沿って整理し、確認シートを作成します。",
  alternates: { canonical: "/tools/commission-brief-builder" },
  openGraph: {
    title: "制作案件ヒアリングシート作成",
    description:
      "制作依頼の用途・サイズ・納期・修正・納品形式を質問に沿って整理し、確認シートを作成します。",
    url: "/tools/commission-brief-builder",
  },
  twitter: {
    card: "summary",
    title: "制作案件ヒアリングシート作成",
    description:
      "制作依頼の用途・サイズ・納期・修正・納品形式を質問に沿って整理し、確認シートを作成します。",
  },
};

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
      <CommissionBriefBuilderPage />
      <ToolGuideWithRelated tool={tool} />
    </>
  );
}
