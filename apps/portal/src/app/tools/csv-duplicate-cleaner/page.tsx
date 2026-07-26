import type { Metadata } from "next";
import { CsvDuplicateCleanerPage } from "@sakupla/csv-duplicate-cleaner";
import { ToolStructuredData } from "@sakupla/shared-ui";
import { ToolGuideWithRelated } from "@/components/ToolGuideWithRelated";
import { notFound } from "next/navigation";
import { getToolBySlug, isToolPublished } from "@/data/apps";
import { siteUrl } from "@/lib/site";

const tool = getToolBySlug("csv-duplicate-cleaner");

export const metadata: Metadata = {
  title: "CSV重複・表記ゆれクリーナー",
  description: "CSVの重複行と表記ゆれ候補を見つけ、残す行を確認して整理済みCSVと除外行CSVを保存します。",
  alternates: { canonical: "/tools/csv-duplicate-cleaner" },
  openGraph: {
    title: "CSV重複・表記ゆれクリーナー",
    description: "CSVの重複行と表記ゆれ候補を見つけ、残す行を確認して整理済みCSVと除外行CSVを保存します。",
    url: "/tools/csv-duplicate-cleaner",
  },
  twitter: {
    card: "summary",
    title: "CSV重複・表記ゆれクリーナー",
    description: "CSVの重複行と表記ゆれ候補を見つけ、残す行を確認して整理済みCSVと除外行CSVを保存します。",
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
      <CsvDuplicateCleanerPage />
      <ToolGuideWithRelated tool={tool} />
    </>
  );
}
