import type { Metadata } from "next";
import { withSocialMetadata } from "@/lib/metadata";
import { RobotsSitemapCheckerPage } from "@sakupla/robots-sitemap-checker";
import { ToolStructuredData } from "@sakupla/shared-ui";
import { ToolGuideWithRelated } from "@/components/ToolGuideWithRelated";
import { notFound } from "next/navigation";
import { getToolBySlug, isToolPublished } from "@/data/apps";
import { siteUrl } from "@/lib/site";

const tool = getToolBySlug("robots-sitemap-checker");

export const metadata: Metadata = withSocialMetadata({
  title: "robots.txt・sitemap.xml事前チェック",
  description:
    "公開前のrobots.txtとsitemap.xmlを静的に照合し、構文・URL・重複・ホスト整合の注意点を行番号付きで確認します。",
  alternates: { canonical: "/tools/robots-sitemap-checker" },
  openGraph: {
    title: "robots.txt・sitemap.xml事前チェック",
    description:
      "公開前のrobots.txtとsitemap.xmlを静的に照合し、構文・URL・重複・ホスト整合の注意点を行番号付きで確認します。",
    url: "/tools/robots-sitemap-checker",
  },
  twitter: {
    card: "summary_large_image",
    title: "robots.txt・sitemap.xml事前チェック",
    description:
      "公開前のrobots.txtとsitemap.xmlを静的に照合し、構文・URL・重複・ホスト整合の注意点を行番号付きで確認します。",
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
      <RobotsSitemapCheckerPage />
      <ToolGuideWithRelated tool={tool} />
    </>
  );
}
