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
  title: "SNS投稿カレンダー作成ツール｜無料・CSV/ICS保存",
  description:
    "X・Instagramなどの投稿予定、テーマ、素材、CTAを無料で整理。1週間・1か月のSNS投稿カレンダーをCSVまたはICSで保存できます。",
  alternates: { canonical: "/tools/social-content-calendar" },
  openGraph: {
    title: "無料のSNS投稿カレンダー作成ツール",
    description:
      "1週間・1か月のSNS投稿予定と素材準備を整理し、CSV・ICSで保存できます。",
    url: "/tools/social-content-calendar",
  },
  twitter: {
    card: "summary_large_image",
    title: "無料のSNS投稿カレンダー作成ツール",
    description:
      "SNS投稿予定と素材準備を整理し、CSV・ICSで保存できます。",
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
