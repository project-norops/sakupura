import type { Metadata } from "next";
import { InvoicePdfGeneratorPage } from "@sakupla/invoice-pdf-generator";
import { ToolStructuredData } from "@sakupla/shared-ui";
import { ToolGuideWithRelated } from "@/components/ToolGuideWithRelated";
import { notFound } from "next/navigation";
import { getToolBySlug, isToolPublished } from "@/data/apps";
import { siteUrl } from "@/lib/site";

const tool = getToolBySlug("invoice-pdf-generator");

export const metadata: Metadata = {
  title: "見積書・請求書PDF作成ツール",
  description:
    "住所・取引年月日・登録番号・税率別金額を記載した見積書や請求書を作成し、PDF保存できます。",
  alternates: { canonical: "/tools/invoice-pdf-generator" },
  openGraph: {
    title: "見積書・請求書PDF作成ツール",
    description:
      "住所・取引年月日・登録番号・税率別金額を記載した見積書や請求書を作成し、PDF保存できます。",
    url: "/tools/invoice-pdf-generator",
  },
  twitter: {
    card: "summary",
    title: "見積書・請求書PDF作成ツール",
    description:
      "住所・取引年月日・登録番号・税率別金額を記載した見積書や請求書を作成し、PDF保存できます。",
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
      <InvoicePdfGeneratorPage />
      <ToolGuideWithRelated tool={tool} />
    </>
  );
}
