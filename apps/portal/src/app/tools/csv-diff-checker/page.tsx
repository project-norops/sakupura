import type { Metadata } from "next";
import { CsvDiffCheckerPage } from "@sakupla/csv-diff-checker";
import { ToolStructuredData } from "@sakupla/shared-ui";
import { ToolGuideWithRelated } from "@/components/ToolGuideWithRelated";
import { notFound } from "next/navigation";
import { getToolBySlug, isToolPublished } from "@/data/apps";
import { siteUrl } from "@/lib/site";

const tool = getToolBySlug("csv-diff-checker");

export const metadata: Metadata = {
  title: "CSV差分比較・変更抽出ツール",
  description:
    "変更前・変更後のCSVを商品コードやIDで照合し、追加・削除・変更された行とセルを確認できます。",
  alternates: { canonical: "/tools/csv-diff-checker" },
  openGraph: {
    title: "CSV差分比較・変更抽出ツール",
    description:
      "変更前・変更後のCSVを商品コードやIDで照合し、追加・削除・変更された行とセルを確認できます。",
    url: "/tools/csv-diff-checker",
  },
  twitter: {
    card: "summary",
    title: "CSV差分比較・変更抽出ツール",
    description:
      "変更前・変更後のCSVを商品コードやIDで照合し、追加・削除・変更された行とセルを確認できます。",
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
      <CsvDiffCheckerPage />
      <ToolGuideWithRelated tool={tool} />
    </>
  );
}
