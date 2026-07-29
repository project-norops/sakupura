import type { Metadata } from "next";
import { withSocialMetadata } from "@/lib/metadata";
import { UtmLinkBuilderPage } from "@sakupla/utm-link-builder";
import { ToolStructuredData } from "@sakupla/shared-ui";
import { ToolGuideWithRelated } from "@/components/ToolGuideWithRelated";
import { notFound } from "next/navigation";
import { getToolBySlug, isToolPublished } from "@/data/apps";
import { siteUrl } from "@/lib/site";

const tool = getToolBySlug("utm-link-builder");

export const metadata: Metadata = withSocialMetadata({
  title: "UTMリンク・QRコード作成ツール",
  description:
    "計測用UTMリンクを命名チェック付きで作成し、QRコードとして保存できます。",
  alternates: { canonical: "/tools/utm-link-builder" },
  openGraph: {
    title: "UTMリンク・QRコード作成ツール",
    description:
      "計測用UTMリンクを命名チェック付きで作成し、QRコードとして保存できます。",
    url: "/tools/utm-link-builder",
  },
  twitter: {
    card: "summary_large_image",
    title: "UTMリンク・QRコード作成ツール",
    description:
      "計測用UTMリンクを命名チェック付きで作成し、QRコードとして保存できます。",
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
      <UtmLinkBuilderPage />
      <ToolGuideWithRelated tool={tool} />
    </>
  );
}
