import type { Metadata } from "next";
import { SocialTextFormatterPage } from "@sakupla/social-text-formatter";
import { ToolGuide, ToolStructuredData } from "@sakupla/shared-ui";
import { notFound } from "next/navigation";
import { getToolBySlug, isToolPublished } from "@/data/apps";
import { siteUrl } from "@/lib/site";

const tool = getToolBySlug("social-text-formatter");

export const metadata: Metadata = {
  title: "SNS文字数カウンター・文章整形ツール",
  description:
    "X、Instagram、LinkedIn向けの文章を、改行・空白・文字数・ハッシュタグを確認しながらブラウザ上で整形できます。",
  alternates: { canonical: "/tools/social-text-formatter" },
  openGraph: {
    title: "SNS文字数カウンター・文章整形ツール",
    description: tool.description,
    url: "/tools/social-text-formatter",
  },
  twitter: {
    card: "summary",
    title: "SNS文字数カウンター・文章整形ツール",
    description: tool.description,
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
      <SocialTextFormatterPage />
      <ToolGuide title={tool.title} content={tool.content} />
    </>
  );
}
