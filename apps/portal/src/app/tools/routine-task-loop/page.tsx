import type { Metadata } from "next";
import { RoutineTaskLoopPage } from "@sakupla/routine-task-loop";
import { ToolGuide, ToolStructuredData } from "@sakupla/shared-ui";
import { notFound } from "next/navigation";
import { getToolBySlug, isToolPublished } from "@/data/apps";
import { siteUrl } from "@/lib/site";

const tool = getToolBySlug("routine-task-loop");

export const metadata: Metadata = {
  title: "定期タスク・ルーティン管理",
  description:
    "毎週・毎月の定期作業を登録し、完了すると次回予定日へ自動更新します。",
  alternates: { canonical: "/tools/routine-task-loop" },
  openGraph: {
    title: "定期タスク・ルーティン管理",
    description:
      "毎週・毎月の定期作業を登録し、完了すると次回予定日へ自動更新します。",
    url: "/tools/routine-task-loop",
  },
  twitter: {
    card: "summary",
    title: "定期タスク・ルーティン管理",
    description:
      "毎週・毎月の定期作業を登録し、完了すると次回予定日へ自動更新します。",
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
      <ToolGuide title={tool.title} content={tool.content} />
    </>
  );
}
