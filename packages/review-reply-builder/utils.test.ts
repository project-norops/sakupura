import { buildReply } from "./utils";

describe("buildReply", () => {
  test("低評価には謝罪と改善を含める", () => {
    const result = buildReply({
      rating: 1,
      tone: "polite",
      customerName: "",
      storeName: "",
      staffName: "",
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
      staffName: "佐藤",
      detail: "接客",
    });
    expect(result).toContain("田中様");
    expect(result).toContain("接客");
    expect(result).toContain("サクラ店");
    expect(result).toContain("担当した佐藤");
  });

  test("評価値を1〜5へ丸める", () => {
    expect(
      buildReply({
        rating: 99,
        tone: "short",
        customerName: "",
        storeName: "",
        staffName: "",
        detail: "",
      }),
    ).toContain("温かいお言葉");
  });

  test.each(["待ち時間", "価格", "アクセス", "予約対応"])(
    "どの話題でも『お褒めいただき』と決めつけない: %s",
    (detail) => {
      const result = buildReply({
        rating: 5,
        tone: "polite",
        customerName: "",
        storeName: "",
        staffName: "",
        detail,
      });
      expect(result).toContain(`「${detail}」について高く評価していただき`);
      expect(result).not.toContain("お褒めいただき");
    },
  );

  test("低評価では対応者名を改善共有の文脈で使う", () => {
    const result = buildReply({
      rating: 2,
      tone: "short",
      customerName: "",
      storeName: "",
      staffName: "山田",
      detail: "接客",
    });
    expect(result).toContain("担当した山田とも内容を共有し");
  });

  test("星3の返信で感謝を不自然に繰り返さない", () => {
    const result = buildReply({
      rating: 3,
      tone: "polite",
      customerName: "",
      storeName: "",
      staffName: "",
      detail: "価格",
    });
    expect(result.match(/ありがとうございます/g)).toHaveLength(1);
  });
});
