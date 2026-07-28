import type { MetadataRoute } from "next";
import apps from "@/data/apps";
import { categories } from "@/data/categories";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ["/about", "/privacy", "/disclaimer", "/categories"];

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...staticPages.map(
      (href) =>
        ({
          url: `${siteUrl}${href}`,
          lastModified: new Date(),
          changeFrequency: "yearly",
          priority: 0.4,
        }) satisfies MetadataRoute.Sitemap[number],
    ),
    ...apps.map(
      (app) =>
        ({
          url: `${siteUrl}${app.href}`,
          lastModified: new Date(),
          changeFrequency: "monthly",
          priority: 0.8,
        }) satisfies MetadataRoute.Sitemap[number],
    ),
    ...categories.map(
      (category) =>
        ({
          url: `${siteUrl}/categories/${category.id}`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.7,
        }) satisfies MetadataRoute.Sitemap[number],
    ),
  ];
}
