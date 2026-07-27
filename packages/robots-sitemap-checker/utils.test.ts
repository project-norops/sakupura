import { checkRobotsAndSitemap, formatReport } from "./utils";

test("accepts a basic matching pair", () => {
  const result = checkRobotsAndSitemap(
    "User-agent: *\nDisallow: /private/\nSitemap: https://example.com/sitemap.xml",
    "<urlset><url><loc>https://example.com/</loc></url></urlset>",
    "https://example.com",
  );
  expect(result.urlCount).toBe(1);
  expect(result.issues).toEqual([
    {
      severity: "info",
      source: "照合",
      line: 1,
      message: "初期チェック範囲では指摘が見つかりませんでした。",
    },
  ]);
});

test("reports syntax, duplicate, host, and disallow candidates with lines", () => {
  const result = checkRobotsAndSitemap(
    "Disallow /admin\nUser-agent: *\nDisallow: /admin/",
    "<urlset>\n<url><loc>https://example.com/admin/a</loc></url>\n<url><loc>https://other.example/admin/a</loc></url>\n<url><loc>https://other.example/admin/a</loc></url>\n</urlset>",
    "https://example.com",
  );
  expect(
    result.issues.some(
      (issue) =>
        issue.source === "robots.txt" &&
        issue.line === 1 &&
        issue.severity === "error",
    ),
  ).toBe(true);
  expect(result.issues.some((issue) => issue.message.includes("重複"))).toBe(
    true,
  );
  expect(
    result.issues.some((issue) => issue.message.includes("想定ホスト")),
  ).toBe(true);
  expect(
    result.issues.some(
      (issue) => issue.source === "照合" && issue.message.includes("Disallow"),
    ),
  ).toBe(true);
  expect(formatReport(result)).toContain("sitemap.xml 4行目");
});

test("requires absolute loc URLs and a sitemap root", () => {
  const result = checkRobotsAndSitemap(
    "User-agent: *",
    "<root><loc>/relative</loc></root>",
  );
  expect(result.issues.map((issue) => issue.message)).toEqual(
    expect.arrayContaining([
      expect.stringContaining("ルート要素"),
      expect.stringContaining("絶対URL"),
    ]),
  );
});
