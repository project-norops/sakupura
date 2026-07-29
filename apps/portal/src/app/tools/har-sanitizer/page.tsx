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
  title: "HAR機密情報チェック・匿名化",
  description:
    "HARファイル内のCookie、認証ヘッダー、トークンや個人情報の候補を確認し、匿名化したHARをブラウザ内で作成します。",
  alternates: { canonical: "/tools/har-sanitizer" },
  openGraph: {
    title: "HAR機密情報チェック・匿名化",
    description:
      "HARファイル内のCookie、認証ヘッダー、トークンや個人情報の候補を確認し、匿名化したHARをブラウザ内で作成します。",
    url: "/tools/har-sanitizer",
  },
  twitter: {
    card: "summary_large_image",
    title: "HAR機密情報チェック・匿名化",
    description:
      "HARファイル内のCookie、認証ヘッダー、トークンや個人情報の候補を確認し、匿名化したHARをブラウザ内で作成します。",
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
