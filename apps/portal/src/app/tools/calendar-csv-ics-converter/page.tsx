import type { Metadata } from "next";
import { CalendarCsvIcsConverterPage } from "@sakupla/calendar-csv-ics-converter";
import { ToolStructuredData } from "@sakupla/shared-ui";
import { ToolGuideWithRelated } from "@/components/ToolGuideWithRelated";
import { notFound } from "next/navigation";
import { getToolBySlug, isToolPublished } from "@/data/apps";
import { siteUrl } from "@/lib/site";

const tool = getToolBySlug("calendar-csv-ics-converter");

export const metadata: Metadata = {
  title: "予定CSV・ICS一括変換",
  description:
    "予定CSVの列を割り当てて検証し、Google CalendarやApple Calendarへ読み込めるICSファイルを作成します。",
  alternates: { canonical: "/tools/calendar-csv-ics-converter" },
  openGraph: {
    title: "予定CSV・ICS一括変換",
    description:
      "予定CSVの列を割り当てて検証し、Google CalendarやApple Calendarへ読み込めるICSファイルを作成します。",
    url: "/tools/calendar-csv-ics-converter",
  },
  twitter: {
    card: "summary",
    title: "予定CSV・ICS一括変換",
    description:
      "予定CSVの列を割り当てて検証し、Google CalendarやApple Calendarへ読み込めるICSファイルを作成します。",
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
      <CalendarCsvIcsConverterPage />
      <ToolGuideWithRelated tool={tool} />
    </>
  );
}
