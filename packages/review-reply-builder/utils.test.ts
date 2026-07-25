import { buildReply } from "./utils";

describe("buildReply", () => {
  test("低評価には謝罪と改善を含める", () => {
    const result = buildReply({
      rating: 1,
      tone: "polite",
      customerName: "",
      storeName: "",
      detail: "待ち時間",
    });
    expect(result).toContain("申し訳ございません");
    expect(result).toContain("改善");
    expect(result).toContain("待ち時間");
  });

  test("高評価には店名と具体的な内容を反映する", () => {
    const result = buildReply({
      rating: 5,
      tone: "friendly",
      customerName: "田中",
      storeName: "サクラ店",
      detail: "接客",
    });
    expect(result).toContain("田中様");
    expect(result).toContain("接客");
    expect(result).toContain("サクラ店");
  });

  test("評価値を1〜5へ丸める", () => {
    expect(
      buildReply({
        rating: 99,
        tone: "short",
        customerName: "",
        storeName: "",
        detail: "",
      }),
    ).toContain("温かいお言葉");
  });
});
