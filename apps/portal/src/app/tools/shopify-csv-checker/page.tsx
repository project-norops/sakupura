import type { Metadata } from "next";
import { ShopifyCsvCheckerPage } from "@sakupla/shopify-csv-checker";
import { ToolStructuredData } from "@sakupla/shared-ui";
import { ToolGuideWithRelated } from "@/components/ToolGuideWithRelated";
import { notFound } from "next/navigation";
import { getToolBySlug, isToolPublished } from "@/data/apps";
import { siteUrl } from "@/lib/site";

const tool = getToolBySlug("shopify-csv-checker");

export const metadata: Metadata = {
  title: "Shopify商品CSV診断・修正ツール",
  description:
    "商品CSVの列名や値の不備を行ごとに診断し、修正版CSVをブラウザ内で作成します。",
  alternates: { canonical: "/tools/shopify-csv-checker" },
  openGraph: {
    title: "Shopify商品CSV診断・修正ツール",
    description:
      "商品CSVの列名や値の不備を行ごとに診断し、修正版CSVをブラウザ内で作成します。",
    url: "/tools/shopify-csv-checker",
  },
  twitter: {
    card: "summary",
    title: "Shopify商品CSV診断・修正ツール",
    description:
      "商品CSVの列名や値の不備を行ごとに診断し、修正版CSVをブラウザ内で作成します。",
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
      <ShopifyCsvCheckerPage />
      <ToolGuideWithRelated tool={tool} />
    </>
  );
}
