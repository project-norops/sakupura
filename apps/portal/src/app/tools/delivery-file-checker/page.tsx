import type { Metadata } from "next";
import { withSocialMetadata } from "@/lib/metadata";
import { DeliveryFileCheckerPage } from "@sakupla/delivery-file-checker";
import { ToolStructuredData } from "@sakupla/shared-ui";
import { ToolGuideWithRelated } from "@/components/ToolGuideWithRelated";
import { notFound } from "next/navigation";
import { getToolBySlug, isToolPublished } from "@/data/apps";
import { siteUrl } from "@/lib/site";

const tool = getToolBySlug("delivery-file-checker");

export const metadata: Metadata = withSocialMetadata({
  title: "制作物納品チェック・ファイル構成確認",
  description:
    "納品前のファイルを端末内で照合し、形式・画像寸法・名前・必要ファイルの抜けを確認します。",
  alternates: { canonical: "/tools/delivery-file-checker" },
  openGraph: {
    title: "制作物納品チェック・ファイル構成確認",
    description:
      "納品前のファイルを端末内で照合し、形式・画像寸法・名前・必要ファイルの抜けを確認します。",
    url: "/tools/delivery-file-checker",
  },
  twitter: {
    card: "summary_large_image",
    title: "制作物納品チェック・ファイル構成確認",
    description:
      "納品前のファイルを端末内で照合し、形式・画像寸法・名前・必要ファイルの抜けを確認します。",
  },
});

export default function Page() {
  const isPreview =
    process.env.VERCEL_ENV === "preview" ||
    process.env.NODE_ENV === "development";
  if (!isToolPublished(tool) && !isPreview) notFound();

  return (
    <>
      <ToolStructuredData
        title={tool.title}
        description={tool.description}
        url={`${siteUrl}${tool.href}`}
        content={tool.content}
      />
      <DeliveryFileCheckerPage />
      <ToolGuideWithRelated tool={tool} />
    </>
  );
}
