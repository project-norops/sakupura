import type { MetadataRoute } from "next";
import apps from "@/data/apps";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
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
