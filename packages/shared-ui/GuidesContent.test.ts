import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { guides } from "../../apps/portal/src/data/guides";

const toolManifest = JSON.parse(
  readFileSync(
    resolve(__dirname, "../../apps/portal/src/data/tools.json"),
    "utf8",
  ),
) as { slug: string }[];
const toolSlugs = new Set(toolManifest.map((tool) => tool.slug));

describe("practical guides", () => {
  it("keeps four distinct, substantial guides with valid references", () => {
    expect(guides).toHaveLength(4);
    expect(new Set(guides.map((guide) => guide.slug)).size).toBe(guides.length);

    const sectionOrders = guides.map((guide) =>
      guide.sections.map((section) => section.kind).join("/"),
    );
    expect(new Set(sectionOrders).size).toBe(guides.length);

    for (const guide of guides) {
      expect(JSON.stringify(guide.sections).length).toBeGreaterThan(1800);
      expect(guide.sections).toHaveLength(6);
      expect(guide.sources.length).toBeGreaterThanOrEqual(2);
      expect(
        guide.sources.every((source) => source.url.startsWith("https://")),
      ).toBe(true);
      expect(guide.toolSlugs.length).toBeGreaterThanOrEqual(4);
      expect(guide.toolSlugs.every((slug) => toolSlugs.has(slug))).toBe(true);
    }
  });
});
