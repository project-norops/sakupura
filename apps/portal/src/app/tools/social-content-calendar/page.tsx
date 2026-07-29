import type { Metadata } from "next";
import { withSocialMetadata } from "@/lib/metadata";
import { SocialContentCalendarPage } from "@sakupla/social-content-calendar";
import { ToolStructuredData } from "@sakupla/shared-ui";
import { ToolGuideWithRelated } from "@/components/ToolGuideWithRelated";
import { notFound } from "next/navigation";
import { getToolBySlug, isToolPublished } from "@/data/apps";
import { siteUrl } from "@/lib/site";

const tool = getToolBySlug("social-content-calendar");

export const metadata: Metadata = withSocialMetadata({
  title: "SNSコンテンツカレンダー",
  description:
    "投稿日、媒体、テーマ、目的、素材、CTAを整理し、投稿漏れと内容の偏りを確認できるカレンダーを作ります。",
  alternates: { canonical: "/tools/social-content-calendar" },
  openGraph: {
    title: "SNSコンテンツカレンダー",
    description:
      "投稿日、媒体、テーマ、目的、素材、CTAを整理し、投稿漏れと内容の偏りを確認できるカレンダーを作ります。",
    url: "/tools/social-content-calendar",
  },
  twitter: {
    card: "summary_large_image",
    title: "SNSコンテンツカレンダー",
    description:
      "投稿日、媒体、テーマ、目的、素材、CTAを整理し、投稿漏れと内容の偏りを確認できるカレンダーを作ります。",
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
      <SocialContentCalendarPage />
      <ToolGuideWithRelated tool={tool} />
    </>
  );
}
