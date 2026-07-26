import type { Metadata } from "next";
import { EmailSignatureGeneratorPage } from "@sakupla/email-signature-generator";
import { ToolStructuredData } from "@sakupla/shared-ui";
import { ToolGuideWithRelated } from "@/components/ToolGuideWithRelated";
import { notFound } from "next/navigation";
import { getToolBySlug, isToolPublished } from "@/data/apps";
import { siteUrl } from "@/lib/site";

const tool = getToolBySlug("email-signature-generator");

export const metadata: Metadata = {
  title: "無料メール署名ジェネレーター｜Gmail・Outlook対応",
  description:
    "登録不要のメール署名ジェネレーター。名前や会社情報を入力して、Gmail・Outlookへ貼り付けられるビジネス署名を無料で作成できます。",
  alternates: { canonical: "/tools/email-signature-generator" },
  openGraph: {
    title: "無料メール署名ジェネレーター｜Gmail・Outlook対応",
    description:
      "名前や会社情報を入力して、Gmail・Outlookへ貼り付けられるビジネス署名を無料で作成できます。",
    url: "/tools/email-signature-generator",
  },
  twitter: {
    card: "summary",
    title: "無料メール署名ジェネレーター｜Gmail・Outlook対応",
    description: "登録不要でGmail・Outlook対応のビジネス署名を作成できます。",
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
      <EmailSignatureGeneratorPage />
      <ToolGuideWithRelated tool={tool} />
    </>
  );
}
