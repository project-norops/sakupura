import type { Metadata } from "next";
import { OgpCardPreviewPage } from "@sakupla/ogp-card-preview";
import { ToolStructuredData } from "@sakupla/shared-ui";
import { ToolGuideWithRelated } from "@/components/ToolGuideWithRelated";
import { notFound } from "next/navigation";
import { getToolBySlug, isToolPublished } from "@/data/apps";
import { siteUrl } from "@/lib/site";

const tool = getToolBySlug("ogp-card-preview");

export const metadata: Metadata = {
  title: "OGP・SNSシェアカードプレビュー／タグ作成",
  description:
    "タイトル・説明・画像情報からシェアカード見本とOGP・X向けタグを作り、head断片の不足も公開前に確認します。",
  alternates: { canonical: "/tools/ogp-card-preview" },
  openGraph: {
    title: "OGP・SNSシェアカードプレビュー／タグ作成",
    description:
      "タイトル・説明・画像情報からシェアカード見本とOGP・X向けタグを作り、head断片の不足も公開前に確認します。",
    url: "/tools/ogp-card-preview",
  },
  twitter: {
    card: "summary",
    title: "OGP・SNSシェアカードプレビュー／タグ作成",
    description:
      "タイトル・説明・画像情報からシェアカード見本とOGP・X向けタグを作り、head断片の不足も公開前に確認します。",
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
      <OgpCardPreviewPage />
      <ToolGuideWithRelated tool={tool} />
    </>
  );
}
