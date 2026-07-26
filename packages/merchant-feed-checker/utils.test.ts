import { diagnoseFeed, parseFeed, validGtin } from "./utils";

describe("merchant feed utilities", () => {
  test("parses csv", () =>
    expect(parseFeed("id,title\n1,商品").rows[0].title).toBe("商品"));
  test("parses tsv", () =>
    expect(parseFeed("id\ttitle\n1\t商品").headers).toEqual(["id", "title"]));
  test("validates gtin check digit", () =>
    expect(validGtin("4901234567894")).toBe(true));
  test("reports missing required columns", () =>
    expect(
      diagnoseFeed(parseFeed("id,title\n1,商品")).some(
        (issue) => issue.row === null && issue.field === "price",
      ),
    ).toBe(true));
  test("reports bad price and availability", () => {
    const table = parseFeed(
      "id,title,description,link,image_link,availability,price\n1,A,B,https://a.jp,https://a.jp/a.jpg,available,1000",
    );
    const issues = diagnoseFeed(table);
    expect(issues.some((issue) => issue.field === "price")).toBe(true);
    expect(issues.some((issue) => issue.field === "availability")).toBe(true);
  });
});
