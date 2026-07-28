import type { Metadata } from "next";
import { CommissionRateCardMakerPage } from "@sakupla/commission-rate-card-maker";
import { ToolStructuredData } from "@sakupla/shared-ui";
import { ToolGuideWithRelated } from "@/components/ToolGuideWithRelated";
import { notFound } from "next/navigation";
import { getToolBySlug, isToolPublished } from "@/data/apps";
import { siteUrl } from "@/lib/site";

const tool = getToolBySlug("commission-rate-card-maker");

export const metadata: Metadata = {
  title: "コミッション料金表・受付条件メーカー",
  description:
    "メニューと価格、追加料金、納期、受付状況を整理し、SNS画像・Markdown・印刷用の料金表を作成します。",
  alternates: { canonical: "/tools/commission-rate-card-maker" },
  openGraph: {
    title: "コミッション料金表・受付条件メーカー",
    description:
      "メニューと価格、追加料金、納期、受付状況を整理し、SNS画像・Markdown・印刷用の料金表を作成します。",
    url: "/tools/commission-rate-card-maker",
  },
  twitter: {
    card: "summary",
    title: "コミッション料金表・受付条件メーカー",
    description:
      "メニューと価格、追加料金、納期、受付状況を整理し、SNS画像・Markdown・印刷用の料金表を作成します。",
  },
};

export default function Page() {
  const isPreview =
    process.env.VERCEL_ENV === "preview" ||
    process.env.NODE_ENV === "development";
  if (!isToolPublished(tool) && !isPreview) notFound();

  return (
    <>
      <ToolStructuredData
        title={tool.title}
        description={tool.description}
        url={`${siteUrl}${tool.href}`}
        content={tool.content}
      />
      <CommissionRateCardMakerPage />
      <ToolGuideWithRelated tool={tool} />
    </>
  );
}
