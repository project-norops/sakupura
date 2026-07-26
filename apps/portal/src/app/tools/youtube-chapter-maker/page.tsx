import type { Metadata } from "next";
import { YoutubeChapterMakerPage } from "@sakupla/youtube-chapter-maker";
import { ToolStructuredData } from "@sakupla/shared-ui";
import { ToolGuideWithRelated } from "@/components/ToolGuideWithRelated";
import { notFound } from "next/navigation";
import { getToolBySlug, isToolPublished } from "@/data/apps";
import { siteUrl } from "@/lib/site";

const tool = getToolBySlug("youtube-chapter-maker");

export const metadata: Metadata = {
  title: "YouTubeチャプター・タイムスタンプ作成",
  description:
    "時刻と見出しを並べ、YouTube概要欄へ貼れるチャプター形式を公式条件に沿って作成します。",
  alternates: { canonical: "/tools/youtube-chapter-maker" },
  openGraph: {
    title: "YouTubeチャプター・タイムスタンプ作成",
    description:
      "時刻と見出しを並べ、YouTube概要欄へ貼れるチャプター形式を公式条件に沿って作成します。",
    url: "/tools/youtube-chapter-maker",
  },
  twitter: {
    card: "summary",
    title: "YouTubeチャプター・タイムスタンプ作成",
    description:
      "時刻と見出しを並べ、YouTube概要欄へ貼れるチャプター形式を公式条件に沿って作成します。",
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
      <YoutubeChapterMakerPage />
      <ToolGuideWithRelated tool={tool} />
    </>
  );
}
