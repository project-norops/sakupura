import type { Metadata } from "next";
import { ReviewReplyBuilderPage } from "@sakupla/review-reply-builder";
import { ToolGuide, ToolStructuredData } from "@sakupla/shared-ui";
import { notFound } from "next/navigation";
import { getToolBySlug, isToolPublished } from "@/data/apps";
import { siteUrl } from "@/lib/site";

const tool = getToolBySlug("review-reply-builder");

export const metadata: Metadata = {
  title: "口コミ返信テンプレート作成",
  description:
    "評価や状況を選んで、口コミへの丁寧な返信文をブラウザ上で作成します。",
  alternates: { canonical: "/tools/review-reply-builder" },
  openGraph: {
    title: "口コミ返信テンプレート作成",
    description:
      "評価や状況を選んで、口コミへの丁寧な返信文をブラウザ上で作成します。",
    url: "/tools/review-reply-builder",
  },
  twitter: {
    card: "summary",
    title: "口コミ返信テンプレート作成",
    description:
      "評価や状況を選んで、口コミへの丁寧な返信文をブラウザ上で作成します。",
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
      <ReviewReplyBuilderPage />
      <ToolGuide title={tool.title} content={tool.content} />
    </>
  );
}
