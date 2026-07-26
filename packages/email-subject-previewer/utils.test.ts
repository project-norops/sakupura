import { graphemeCount, subjectWarnings, truncatePreview } from "./utils";

describe("email preview utilities", () => {
  test("counts emoji as one grapheme", () =>
    expect(graphemeCount("家族👨‍👩‍👧‍👦")).toBe(3));
  test("truncates by grapheme", () =>
    expect(truncatePreview("あいうえお", 3)).toBe("あいう…"));
  test("warns about empty preheader", () =>
    expect(
      subjectWarnings("件名", "").some((item) => item.includes("空欄")),
    ).toBe(true));
  test("warns about duplicated subject", () =>
    expect(
      subjectWarnings("セール", "セールを開催").some((item) =>
        item.includes("重複"),
      ),
    ).toBe(true));
});
