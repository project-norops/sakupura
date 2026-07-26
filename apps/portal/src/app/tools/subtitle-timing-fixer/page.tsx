import type { Metadata } from "next";
import { SubtitleTimingFixerPage } from "@sakupla/subtitle-timing-fixer";
import { ToolGuide, ToolStructuredData } from "@sakupla/shared-ui";
import { notFound } from "next/navigation";
import { getToolBySlug, isToolPublished } from "@/data/apps";
import { siteUrl } from "@/lib/site";

const tool = getToolBySlug("subtitle-timing-fixer");

export const metadata: Metadata = {
  title: "SRT・VTT字幕チェック／時間ずれ修正",
  description:
    "字幕ファイルの形式エラーを確認し、全字幕の時間ずれをブラウザ内でまとめて修正します。",
  alternates: { canonical: "/tools/subtitle-timing-fixer" },
  openGraph: {
    title: "SRT・VTT字幕チェック／時間ずれ修正",
    description:
      "字幕ファイルの形式エラーを確認し、全字幕の時間ずれをブラウザ内でまとめて修正します。",
    url: "/tools/subtitle-timing-fixer",
  },
  twitter: {
    card: "summary",
    title: "SRT・VTT字幕チェック／時間ずれ修正",
    description:
      "字幕ファイルの形式エラーを確認し、全字幕の時間ずれをブラウザ内でまとめて修正します。",
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
      <SubtitleTimingFixerPage />
      <ToolGuide title={tool.title} content={tool.content} />
    </>
  );
}
