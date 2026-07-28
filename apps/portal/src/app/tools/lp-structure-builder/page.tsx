import type { Metadata } from "next";
import { withSocialMetadata } from "@/lib/metadata";
import { LpStructureBuilderPage } from "@sakupla/lp-structure-builder";
import { ToolStructuredData } from "@sakupla/shared-ui";
import { ToolGuideWithRelated } from "@/components/ToolGuideWithRelated";
import { notFound } from "next/navigation";
import { getToolBySlug, isToolPublished } from "@/data/apps";
import { siteUrl } from "@/lib/site";

const tool = getToolBySlug("lp-structure-builder");

export const metadata: Metadata = withSocialMetadata({
  title: "LP構成案作成ツール｜セクション設計・Notion出力",
  description:
    "LPで伝える内容と順番を整理し、企画書用MarkdownやNotion向け制作チェックリストを無料で作成できます。",
  alternates: { canonical: "/tools/lp-structure-builder" },
  openGraph: {
    title: "LP構成案作成ツール",
    description:
      "LPのセクションを設計し、Notionや企画書へ貼り付けられる構成メモを作成します。",
    url: "/tools/lp-structure-builder",
  },
  twitter: {
    card: "summary_large_image",
    title: "LP構成案作成ツール",
    description:
      "LPの伝える順番を整理し、Notionや企画書用の構成メモを作成します。",
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
      <LpStructureBuilderPage />
      <ToolGuideWithRelated tool={tool} />
    </>
  );
}
