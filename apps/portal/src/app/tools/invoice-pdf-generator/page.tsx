import type { Metadata } from "next";
import { InvoicePdfGeneratorPage } from "@sakupla/invoice-pdf-generator";
import { ToolGuide, ToolStructuredData } from "@sakupla/shared-ui";
import { notFound } from "next/navigation";
import { getToolBySlug, isToolPublished } from "@/data/apps";
import { siteUrl } from "@/lib/site";

const tool = getToolBySlug("invoice-pdf-generator");

export const metadata: Metadata = {
  title: "見積書・請求書PDF作成ツール",
  description:
    "見積書から請求書へ内容を引き継ぎ、税率別計算とPDF保存までブラウザ内で完結します。",
  alternates: { canonical: "/tools/invoice-pdf-generator" },
  openGraph: {
    title: "見積書・請求書PDF作成ツール",
    description:
      "見積書から請求書へ内容を引き継ぎ、税率別計算とPDF保存までブラウザ内で完結します。",
    url: "/tools/invoice-pdf-generator",
  },
  twitter: {
    card: "summary",
    title: "見積書・請求書PDF作成ツール",
    description:
      "見積書から請求書へ内容を引き継ぎ、税率別計算とPDF保存までブラウザ内で完結します。",
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
      <ToolGuide title={tool.title} content={tool.content} />
    </>
  );
}
