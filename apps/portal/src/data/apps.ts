import toolManifest from "./tools.json";
import type { ToolGuideContent } from "@sakupla/shared-ui";

export type AppDefinition = {
  id: string;
  slug: string;
  title: string;
  description: string;
  href: string;
  badge: string;
  categoryId: string;
  categoryName: string;
  packageName: string;
  componentName: string;
  content: ToolGuideContent;
  releasePost: string;
  status: "draft" | "scheduled" | "published" | "archived";
  publishAt: string | null;
  announceOnX: boolean;
  announcedAt: string | null;
};

const allApps = toolManifest as AppDefinition[];

export function isToolPublished(tool: AppDefinition) {
  return tool.status === "published";
}

const apps = allApps.filter(isToolPublished);

export function getToolBySlug(slug: string) {
  const tool = allApps.find((app) => app.slug === slug);
  if (!tool) throw new Error(`Unknown tool slug: ${slug}`);
  return tool;
}

export function getRelatedTools(tool: AppDefinition, limit = 3) {
  return apps
    .filter(
      (candidate) =>
        candidate.slug !== tool.slug &&
        candidate.categoryId === tool.categoryId,
    )
    .slice(0, limit);
}

export default apps;
