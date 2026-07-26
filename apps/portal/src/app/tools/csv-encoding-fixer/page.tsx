import type { Metadata } from "next";
import { CsvEncodingFixerPage } from "@sakupla/csv-encoding-fixer";
import { ToolGuide, ToolStructuredData } from "@sakupla/shared-ui";
import { notFound } from "next/navigation";
import { getToolBySlug, isToolPublished } from "@/data/apps";
import { siteUrl } from "@/lib/site";

const tool = getToolBySlug("csv-encoding-fixer");

export const metadata: Metadata = {
  title: "CSV文字化け修復・文字コード変換",
  description:
    "Excelで文字化けしたCSVの文字コードを判定し、日本語を確認しながらBOM付きUTF-8へ変換します。",
  alternates: { canonical: "/tools/csv-encoding-fixer" },
  openGraph: {
    title: "CSV文字化け修復・文字コード変換",
    description:
      "Excelで文字化けしたCSVの文字コードを判定し、日本語を確認しながらBOM付きUTF-8へ変換します。",
    url: "/tools/csv-encoding-fixer",
  },
  twitter: {
    card: "summary",
    title: "CSV文字化け修復・文字コード変換",
    description:
      "Excelで文字化けしたCSVの文字コードを判定し、日本語を確認しながらBOM付きUTF-8へ変換します。",
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
      <CsvEncodingFixerPage />
      <ToolGuide title={tool.title} content={tool.content} />
    </>
  );
}
