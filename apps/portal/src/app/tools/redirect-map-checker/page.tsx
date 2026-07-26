import type { Metadata } from "next";
import { RedirectMapCheckerPage } from "@sakupla/redirect-map-checker";
import { ToolGuide, ToolStructuredData } from "@sakupla/shared-ui";
import { notFound } from "next/navigation";
import { getToolBySlug, isToolPublished } from "@/data/apps";
import { siteUrl } from "@/lib/site";

const tool = getToolBySlug("redirect-map-checker");

export const metadata: Metadata = {
  title: "サイト移転リダイレクトマップ検証",
  description:
    "旧URLと新URLの対応表を読み込み、転送漏れや重複、自己転送などを事前確認します。",
  alternates: { canonical: "/tools/redirect-map-checker" },
  openGraph: {
    title: "サイト移転リダイレクトマップ検証",
    description:
      "旧URLと新URLの対応表を読み込み、転送漏れや重複、自己転送などを事前確認します。",
    url: "/tools/redirect-map-checker",
  },
  twitter: {
    card: "summary",
    title: "サイト移転リダイレクトマップ検証",
    description:
      "旧URLと新URLの対応表を読み込み、転送漏れや重複、自己転送などを事前確認します。",
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
      <RedirectMapCheckerPage />
      <ToolGuide title={tool.title} content={tool.content} />
    </>
  );
}
