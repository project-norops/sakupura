import type { Metadata } from "next";
import { CsvRuleValidatorPage } from "@sakupla/csv-rule-validator";
import { ToolStructuredData } from "@sakupla/shared-ui";
import { ToolGuideWithRelated } from "@/components/ToolGuideWithRelated";
import { notFound } from "next/navigation";
import { getToolBySlug, isToolPublished } from "@/data/apps";
import { siteUrl } from "@/lib/site";

const tool = getToolBySlug("csv-rule-validator");

export const metadata: Metadata = {
  title: "CSVルール検証・データ品質チェック",
  description:
    "CSVの必須値、型、値域、文字数、許可値、重複をルールに沿って確認し、元行番号付きのエラー一覧と検証結果CSVを作成します。",
  alternates: { canonical: "/tools/csv-rule-validator" },
  openGraph: {
    title: "CSVルール検証・データ品質チェック",
    description:
      "CSVの必須値、型、値域、文字数、許可値、重複をルールに沿って確認し、元行番号付きのエラー一覧と検証結果CSVを作成します。",
    url: "/tools/csv-rule-validator",
  },
  twitter: {
    card: "summary",
    title: "CSVルール検証・データ品質チェック",
    description:
      "CSVの必須値、型、値域、文字数、許可値、重複をルールに沿って確認し、元行番号付きのエラー一覧と検証結果CSVを作成します。",
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
      <CsvRuleValidatorPage />
      <ToolGuideWithRelated tool={tool} />
    </>
  );
}
