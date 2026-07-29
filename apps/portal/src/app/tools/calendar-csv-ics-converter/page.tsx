import type { Metadata } from "next";
import { withSocialMetadata } from "@/lib/metadata";
import { CalendarCsvIcsConverterPage } from "@sakupla/calendar-csv-ics-converter";
import { ToolStructuredData } from "@sakupla/shared-ui";
import { ToolGuideWithRelated } from "@/components/ToolGuideWithRelated";
import { notFound } from "next/navigation";
import { getToolBySlug, isToolPublished } from "@/data/apps";
import { siteUrl } from "@/lib/site";

const tool = getToolBySlug("calendar-csv-ics-converter");

export const metadata: Metadata = withSocialMetadata({
  title: "予定CSV・ICS一括変換",
  description:
    "CSVで管理している予定表を、GoogleカレンダーやAppleカレンダーへまとめて取り込めるICSファイルに変換します。",
  alternates: { canonical: "/tools/calendar-csv-ics-converter" },
  openGraph: {
    title: "予定CSV・ICS一括変換",
    description:
      "CSVで管理している予定表を、GoogleカレンダーやAppleカレンダーへまとめて取り込めるICSファイルに変換します。",
    url: "/tools/calendar-csv-ics-converter",
  },
  twitter: {
    card: "summary_large_image",
    title: "予定CSV・ICS一括変換",
    description:
      "CSVで管理している予定表を、GoogleカレンダーやAppleカレンダーへまとめて取り込めるICSファイルに変換します。",
  },
});

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
      <CalendarCsvIcsConverterPage />
      <ToolGuideWithRelated tool={tool} />
    </>
  );
}
