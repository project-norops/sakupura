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
  title: "Notionで使えるLP構成案作成ツール｜無料テンプレート",
  description:
    "サービス・商品・イベント用のLP構成を無料で作成。見出しの順番を整え、Notionに貼れるMarkdownと制作チェックリストを出力できます。",
  alternates: { canonical: "/tools/lp-structure-builder" },
  openGraph: {
    title: "Notionで使えるLP構成案作成ツール",
    description:
      "用途別のLP構成を選び、Notionや企画書へ貼り付けられるMarkdownを無料で作成します。",
    url: "/tools/lp-structure-builder",
  },
  twitter: {
    card: "summary_large_image",
    title: "Notionで使えるLP構成案作成ツール",
    description:
      "用途別のLP構成を整理し、Notionに貼れるMarkdownを無料で作成します。",
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
