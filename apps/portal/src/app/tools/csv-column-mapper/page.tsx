import type { Metadata } from "next";
import { CsvColumnMapperPage } from "@sakupla/csv-column-mapper";
import { ToolStructuredData } from "@sakupla/shared-ui";
import { ToolGuideWithRelated } from "@/components/ToolGuideWithRelated";
import { notFound } from "next/navigation";
import { getToolBySlug, isToolPublished } from "@/data/apps";
import { siteUrl } from "@/lib/site";

const tool = getToolBySlug("csv-column-mapper");

export const metadata: Metadata = {
  title: "CSV列マッピング・変換テンプレート",
  description:
    "異なるシステム間のCSV列を対応付け、並べ替え・除外・固定値追加を確認して変換CSVを保存します。",
  alternates: { canonical: "/tools/csv-column-mapper" },
  openGraph: {
    title: "CSV列マッピング・変換テンプレート",
    description:
      "異なるシステム間のCSV列を対応付け、並べ替え・除外・固定値追加を確認して変換CSVを保存します。",
    url: "/tools/csv-column-mapper",
  },
  twitter: {
    card: "summary",
    title: "CSV列マッピング・変換テンプレート",
    description:
      "異なるシステム間のCSV列を対応付け、並べ替え・除外・固定値追加を確認して変換CSVを保存します。",
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
      <CsvColumnMapperPage />
      <ToolGuideWithRelated tool={tool} />
    </>
  );
}
