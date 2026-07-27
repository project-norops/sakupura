import type { Metadata } from "next";
import { CsvJoinerPage } from "@sakupla/csv-joiner";
import { ToolStructuredData } from "@sakupla/shared-ui";
import { ToolGuideWithRelated } from "@/components/ToolGuideWithRelated";
import { notFound } from "next/navigation";
import { getToolBySlug, isToolPublished } from "@/data/apps";
import { siteUrl } from "@/lib/site";

const tool = getToolBySlug("csv-joiner");

export const metadata: Metadata = {
  title: "CSV結合・VLOOKUP代替",
  description: "2つのCSVをキー列で照合し、追加する列、結合方法、未一致や重複キーを確認して結合CSVを作成します。",
  alternates: { canonical: "/tools/csv-joiner" },
  openGraph: {
    title: "CSV結合・VLOOKUP代替",
    description: "2つのCSVをキー列で照合し、追加する列、結合方法、未一致や重複キーを確認して結合CSVを作成します。",
    url: "/tools/csv-joiner",
  },
  twitter: {
    card: "summary",
    title: "CSV結合・VLOOKUP代替",
    description: "2つのCSVをキー列で照合し、追加する列、結合方法、未一致や重複キーを確認して結合CSVを作成します。",
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
      <CsvJoinerPage />
      <ToolGuideWithRelated tool={tool} />
    </>
  );
}
