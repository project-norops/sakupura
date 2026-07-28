import type { Metadata } from "next";
import { withSocialMetadata } from "@/lib/metadata";
import { RedirectMapCheckerPage } from "@sakupla/redirect-map-checker";
import { ToolStructuredData } from "@sakupla/shared-ui";
import { ToolGuideWithRelated } from "@/components/ToolGuideWithRelated";
import { notFound } from "next/navigation";
import { getToolBySlug, isToolPublished } from "@/data/apps";
import { siteUrl } from "@/lib/site";

const tool = getToolBySlug("redirect-map-checker");

export const metadata: Metadata = withSocialMetadata({
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
    card: "summary_large_image",
    title: "サイト移転リダイレクトマップ検証",
    description:
      "旧URLと新URLの対応表を読み込み、転送漏れや重複、自己転送などを事前確認します。",
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
      <RedirectMapCheckerPage />
      <ToolGuideWithRelated tool={tool} />
    </>
  );
}
