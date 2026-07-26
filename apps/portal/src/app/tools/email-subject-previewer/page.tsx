import type { Metadata } from "next";
import { EmailSubjectPreviewerPage } from "@sakupla/email-subject-previewer";
import { ToolGuide, ToolStructuredData } from "@sakupla/shared-ui";
import { notFound } from "next/navigation";
import { getToolBySlug, isToolPublished } from "@/data/apps";
import { siteUrl } from "@/lib/site";

const tool = getToolBySlug("email-subject-previewer");

export const metadata: Metadata = {
  title: "メール件名・プリヘッダープレビュー",
  description:
    "メール件名とプリヘッダーがPC・スマホの受信箱でどう見えるかを送信前に確認できます。",
  alternates: { canonical: "/tools/email-subject-previewer" },
  openGraph: {
    title: "メール件名・プリヘッダープレビュー",
    description:
      "メール件名とプリヘッダーがPC・スマホの受信箱でどう見えるかを送信前に確認できます。",
    url: "/tools/email-subject-previewer",
  },
  twitter: {
    card: "summary",
    title: "メール件名・プリヘッダープレビュー",
    description:
      "メール件名とプリヘッダーがPC・スマホの受信箱でどう見えるかを送信前に確認できます。",
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
      <EmailSubjectPreviewerPage />
      <ToolGuide title={tool.title} content={tool.content} />
    </>
  );
}
