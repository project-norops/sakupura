import type { Metadata } from "next";
import { SocialTextFormatterPage } from "@sakupla/social-text-formatter";
import { ToolGuide } from "@sakupla/shared-ui";
import { notFound } from "next/navigation";
import { getToolBySlug, isToolPublished } from "@/data/apps";

const tool = getToolBySlug("social-text-formatter");

export const metadata: Metadata = {
  title: "SNS文章整形・文字数チェッカー",
  description: "X、Instagram、LinkedIn向けの文章を、改行・空白・文字数・ハッシュタグを確認しながらブラウザ上で整形できます。",
};

export default function Page() {
  if (!isToolPublished(tool)) notFound();

  return (
    <>
      <SocialTextFormatterPage />
      <ToolGuide title={tool.title} content={tool.content} />
    </>
  );
}
