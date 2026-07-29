import type { Metadata } from "next";
import { withSocialMetadata } from "@/lib/metadata";
import { ReviewReplyBuilderPage } from "@sakupla/review-reply-builder";
import { ToolStructuredData } from "@sakupla/shared-ui";
import { ToolGuideWithRelated } from "@/components/ToolGuideWithRelated";
import { notFound } from "next/navigation";
import { getToolBySlug, isToolPublished } from "@/data/apps";
import { siteUrl } from "@/lib/site";

const tool = getToolBySlug("review-reply-builder");

export const metadata: Metadata = withSocialMetadata({
  title: "口コミ返信テンプレート作成",
  description:
    "サービス業・物販の業態、星評価、話題、対応者名をもとに、自然な口コミ返信文をブラウザ上で作成します。",
  alternates: { canonical: "/tools/review-reply-builder" },
  openGraph: {
    title: "口コミ返信テンプレート作成",
    description:
      "星評価と口コミの話題から、自然で丁寧な返信文をブラウザ上で作成します。",
    url: "/tools/review-reply-builder",
  },
  twitter: {
    card: "summary_large_image",
    title: "口コミ返信テンプレート作成",
    description: "星評価と口コミの話題から、自然で丁寧な返信文を作成します。",
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
      <ReviewReplyBuilderPage />
      <ToolGuideWithRelated tool={tool} />
    </>
  );
}
