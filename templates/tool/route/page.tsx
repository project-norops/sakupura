import type { Metadata } from "next";
import { __COMPONENT_NAME__ } from "@sakupla/__SLUG__";
import { ToolStructuredData } from "@sakupla/shared-ui";
import { ToolGuideWithRelated } from "@/components/ToolGuideWithRelated";
import { notFound } from "next/navigation";
import { getToolBySlug, isToolPublished } from "@/data/apps";
import { siteUrl } from "@/lib/site";

const tool = getToolBySlug("__SLUG__");

export const metadata: Metadata = {
  title: __TITLE_JSON__,
  description: __DESCRIPTION_JSON__,
  alternates: { canonical: "/tools/__SLUG__" },
  openGraph: {
    title: __TITLE_JSON__,
    description: __DESCRIPTION_JSON__,
    url: "/tools/__SLUG__",
  },
  twitter: {
    card: "summary",
    title: __TITLE_JSON__,
    description: __DESCRIPTION_JSON__,
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
      <__COMPONENT_NAME__ />
      <ToolGuideWithRelated tool={tool} />
    </>
  );
}
