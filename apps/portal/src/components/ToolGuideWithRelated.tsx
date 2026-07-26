import { ToolGuide } from "@sakupla/shared-ui";
import type { AppDefinition } from "@/data/apps";
import { getRelatedTools } from "@/data/apps";
import { getCategoryById } from "@/data/categories";

export function ToolGuideWithRelated({ tool }: { tool: AppDefinition }) {
  const category = getCategoryById(tool.categoryId);
  const relatedTools = getRelatedTools(tool).map((relatedTool) => ({
    title: relatedTool.title,
    description: relatedTool.description,
    href: relatedTool.href,
    slug: relatedTool.slug,
  }));

  return (
    <ToolGuide
      title={tool.title}
      content={tool.content}
      category={
        category
          ? {
              name: category.name,
              href: `/categories/${category.id}`,
              badgeClass: category.badgeClass,
            }
          : undefined
      }
      relatedTools={relatedTools}
    />
  );
}
