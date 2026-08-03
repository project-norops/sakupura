import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const homeSource = readFileSync(
  resolve(__dirname, "../../apps/portal/src/app/page.tsx"),
  "utf8",
);
const layoutSource = readFileSync(
  resolve(__dirname, "../../apps/portal/src/app/layout.tsx"),
  "utf8",
);

describe("home information architecture", () => {
  it("leads readers from purpose to guides and tools without dropping SEO context", () => {
    expect(homeSource).toContain("仕事の進め方がわかる。");
    expect(homeSource).toContain('id="by-purpose"');
    expect(homeSource).toContain('id="tools"');
    expect(homeSource).toContain('"@type": "ItemList"');
    expect(homeSource.match(/<CategoryNavigation \/>/g)).toHaveLength(1);

    const purposePosition = homeSource.indexOf('id="by-purpose"');
    const guidePosition = homeSource.indexOf("仕事の手順を知りたい方へ");
    const toolPosition = homeSource.indexOf('id="tools"');
    expect(purposePosition).toBeGreaterThan(-1);
    expect(guidePosition).toBeGreaterThan(purposePosition);
    expect(toolPosition).toBeGreaterThan(guidePosition);

    expect(layoutSource).toContain("仕事の進め方がわかる実践ガイド");
    expect(layoutSource).toContain("仕事の進め方");
    expect(layoutSource).toContain("実践ガイド");
  });
});
