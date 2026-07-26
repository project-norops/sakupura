import type { Metadata } from "next";
import { RoutineTaskLoopPage } from "@sakupla/routine-task-loop";
import { ToolStructuredData } from "@sakupla/shared-ui";
import { ToolGuideWithRelated } from "@/components/ToolGuideWithRelated";
import { notFound } from "next/navigation";
import { getToolBySlug, isToolPublished } from "@/data/apps";
import { siteUrl } from "@/lib/site";

const tool = getToolBySlug("routine-task-loop");

export const metadata: Metadata = {
  title: "定期タスク専用チェックリスト｜次回日を自動更新",
  description:
    "毎週・毎月の定期業務だけを日常タスクから分けて管理し、完了すると次回予定日へ自動で繰り越します。",
  alternates: { canonical: "/tools/routine-task-loop" },
  openGraph: {
    title: "定期タスク専用チェックリスト",
    description:
      "繰り返す定期業務を一覧化し、完了すると次回予定日へ自動で繰り越します。",
    url: "/tools/routine-task-loop",
  },
  twitter: {
    card: "summary",
    title: "定期タスク専用チェックリスト",
    description: "定期業務を日常のToDoから分け、完了と次回予定日を管理します。",
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
      <RoutineTaskLoopPage />
      <ToolGuideWithRelated tool={tool} />
    </>
  );
}
