import type { MetadataRoute } from "next";
import apps from "@/data/apps";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ["/privacy", "/disclaimer"];

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
  ];
}
