import { createSections, moveSection, toMarkdown } from "./utils";

describe("LP構成", () => {
  test("プリセットを独立した配列として作る", () => {
    expect(createSections("service").length).toBeGreaterThan(5);
    expect(createSections("service")[0].id).toBe("service-1");
  });

  test("セクションを上下へ移動し、範囲外は変更しない", () => {
    const items = createSections("event");
    expect(moveSection(items, 1, -1)[0]).toBe(items[1]);
    expect(moveSection(items, 0, -1)).toBe(items);
  });

  test("Markdownにタイトルと各セクションを含める", () => {
    const result = toMarkdown(
      "新商品",
      "子育て世代",
      createSections("product").slice(0, 2),
    );
    expect(result).toContain("# 新商品");
    expect(result).toContain("想定読者: 子育て世代");
    expect(result).toContain("## 1.");
  });

  test("Notion向けは制作チェックリストを含める", () => {
    const result = toMarkdown(
      "新サービス",
      "小規模事業者",
      createSections("service").slice(0, 1),
      "notion",
    );
    expect(result).toContain("- [ ] 見出しを決める");
    expect(result).toContain("- [ ] 画像・実績・リンクを用意する");
  });
});
