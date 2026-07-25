import toolManifest from "./tools.json";
import type { ToolGuideContent } from "@sakupla/shared-ui";

export type AppDefinition = {
  id: string;
  slug: string;
  title: string;
  description: string;
  href: string;
  badge: string;
  packageName: string;
  componentName: string;
  content: ToolGuideContent;
  releasePost: string;
};

const apps: AppDefinition[] = toolManifest;

export function getToolBySlug(slug: string) {
  const tool = apps.find((app) => app.slug === slug);
  if (!tool) throw new Error(`Unknown tool slug: ${slug}`);
  return tool;
}

export default apps;
