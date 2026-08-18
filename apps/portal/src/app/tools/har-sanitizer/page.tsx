import type { Metadata } from "next";
import { withSocialMetadata } from "@/lib/metadata";
import { HarSanitizerPage } from "@sakupla/har-sanitizer";
import { ToolStructuredData } from "@sakupla/shared-ui";
import { ToolGuideWithRelated } from "@/components/ToolGuideWithRelated";
import { notFound } from "next/navigation";
import { getToolBySlug, isToolPublished } from "@/data/apps";
import { siteUrl } from "@/lib/site";

const tool = getToolBySlug("har-sanitizer");

export const metadata: Metadata = withSocialMetadata({
  title: "HARファイル匿名化ツール｜Cookie・トークンを共有前チェック",
  description:
    "HARファイルを共有する前にCookie、Authorization、トークンなどの機密候補を検出し、ブラウザ内で匿名化したHARを無料作成します。",
  alternates: { canonical: "/tools/har-sanitizer" },
  openGraph: {
    title: "HARファイル匿名化ツール",
    description:
      "問い合わせ先へ共有する前に、HAR内のCookieやトークンを検出・匿名化します。",
    url: "/tools/har-sanitizer",
  },
  twitter: {
    card: "summary_large_image",
    title: "HARファイル匿名化ツール",
    description:
      "HAR共有前にCookieやトークンを検出し、ブラウザ内で匿名化します。",
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
      <HarSanitizerPage />
      <ToolGuideWithRelated tool={tool} />
    </>
  );
}
