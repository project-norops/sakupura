import type { Metadata } from "next";
import { __COMPONENT_NAME__ } from "@sakupla/__SLUG__";
import { ToolGuide } from "@sakupla/shared-ui";
import { notFound } from "next/navigation";
import { getToolBySlug, isToolPublished } from "@/data/apps";

const tool = getToolBySlug("__SLUG__");

export const metadata: Metadata = {
  title: __TITLE_JSON__,
  description: __DESCRIPTION_JSON__,
};

export default function Page() {
  if (!isToolPublished(tool)) notFound();

  return (
    <>
      <__COMPONENT_NAME__ />
      <ToolGuide title={tool.title} content={tool.content} />
    </>
  );
}
