import {
  diagnoseRedirectMap,
  parseRedirectMap,
  serializeRedirectMap,
} from "./utils";

describe("redirect map utilities", () => {
  test("parses expected headers", () =>
    expect(
      parseRedirectMap("old_url,new_url\nhttps://a.jp,https://b.jp")[0].row,
    ).toBe(2));
  test("rejects missing headers", () =>
    expect(() => parseRedirectMap("from,to\na,b")).toThrow("old_url"));
  test("detects self redirects", () =>
    expect(
      diagnoseRedirectMap(
        parseRedirectMap("old_url,new_url\nhttps://a.jp,https://a.jp"),
      ).some((issue) => issue.message.includes("自己転送")),
    ).toBe(true));
  test("detects duplicate source", () =>
    expect(
      diagnoseRedirectMap(
        parseRedirectMap(
          "old_url,new_url\nhttps://a.jp,https://b.jp\nhttps://a.jp,https://c.jp",
        ),
      ).some((issue) => issue.message.includes("重複")),
    ).toBe(true));
  test("serializes a reviewed map", () =>
    expect(
      serializeRedirectMap(
        parseRedirectMap("old_url,new_url\nhttps://a.jp,https://b.jp"),
      ),
    ).toContain("https://b.jp"));
});
