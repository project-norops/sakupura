import type { Metadata } from "next";
import { withSocialMetadata } from "@/lib/metadata";
import { CsvPivotReshapePage } from "@sakupla/csv-pivot-reshape";
import { ToolStructuredData } from "@sakupla/shared-ui";
import { ToolGuideWithRelated } from "@/components/ToolGuideWithRelated";
import { notFound } from "next/navigation";
import { getToolBySlug, isToolPublished } from "@/data/apps";
import { siteUrl } from "@/lib/site";

const tool = getToolBySlug("csv-pivot-reshape");

export const metadata: Metadata = withSocialMetadata({
  title: "CSVピボット・縦横変換",
  description:
    "月別・地域別・商品別のCSVを、集計用の横持ちまたは取込用の縦持ちへ変換し、行列数と注意点を確認して保存します。",
  alternates: { canonical: "/tools/csv-pivot-reshape" },
  openGraph: {
    title: "CSVピボット・縦横変換",
    description:
      "月別・地域別・商品別のCSVを、集計用の横持ちまたは取込用の縦持ちへ変換し、行列数と注意点を確認して保存します。",
    url: "/tools/csv-pivot-reshape",
  },
  twitter: {
    card: "summary_large_image",
    title: "CSVピボット・縦横変換",
    description:
      "月別・地域別・商品別のCSVを、集計用の横持ちまたは取込用の縦持ちへ変換し、行列数と注意点を確認して保存します。",
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
      <CsvPivotReshapePage />
      <ToolGuideWithRelated tool={tool} />
    </>
  );
}
