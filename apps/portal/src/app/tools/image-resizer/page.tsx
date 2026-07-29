import type { Metadata } from "next";
import { withSocialMetadata } from "@/lib/metadata";
import { ImageResizerPage } from "@sakupla/image-resizer";
import { ToolStructuredData } from "@sakupla/shared-ui";
import { ToolGuideWithRelated } from "@/components/ToolGuideWithRelated";
import { notFound } from "next/navigation";
import { getToolBySlug, isToolPublished } from "@/data/apps";
import { siteUrl } from "@/lib/site";

const tool = getToolBySlug("image-resizer");

export const metadata: Metadata = withSocialMetadata({
  title: "Web・SNS画像一括リサイザー",
  description:
    "1枚の画像からOGP・SNS・favicon向けサイズをブラウザ内で一括作成します。",
  alternates: { canonical: "/tools/image-resizer" },
  openGraph: {
    title: "Web・SNS画像一括リサイザー",
    description:
      "1枚の画像からOGP・SNS・favicon向けサイズをブラウザ内で一括作成します。",
    url: "/tools/image-resizer",
  },
  twitter: {
    card: "summary_large_image",
    title: "Web・SNS画像一括リサイザー",
    description:
      "1枚の画像からOGP・SNS・favicon向けサイズをブラウザ内で一括作成します。",
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
      <ImageResizerPage />
      <ToolGuideWithRelated tool={tool} />
    </>
  );
}
