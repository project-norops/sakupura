import type { Metadata } from "next";
import { LpStructureBuilderPage } from "@sakupla/lp-structure-builder";
import { ToolGuide, ToolStructuredData } from "@sakupla/shared-ui";
import { notFound } from "next/navigation";
import { getToolBySlug, isToolPublished } from "@/data/apps";
import { siteUrl } from "@/lib/site";

const tool = getToolBySlug("lp-structure-builder");

export const metadata: Metadata = {
  title: "LP構成ジェネレーター",
  description:
    "目的や商材に合わせてLPのセクション構成を組み立て、Markdown形式で出力します。",
  alternates: { canonical: "/tools/lp-structure-builder" },
  openGraph: {
    title: "LP構成ジェネレーター",
    description:
      "目的や商材に合わせてLPのセクション構成を組み立て、Markdown形式で出力します。",
    url: "/tools/lp-structure-builder",
  },
  twitter: {
    card: "summary",
    title: "LP構成ジェネレーター",
    description:
      "目的や商材に合わせてLPのセクション構成を組み立て、Markdown形式で出力します。",
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
      <LpStructureBuilderPage />
      <ToolGuide title={tool.title} content={tool.content} />
    </>
  );
}
