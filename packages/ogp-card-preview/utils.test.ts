import {
  diagnoseHead,
  generateMetaTags,
  validateOgpInput,
  type OgpInput,
} from "./utils";
const input: OgpInput = {
  title: 'A & "B"',
  description: "説明",
  url: "https://example.com/page",
  imageUrl: "https://example.com/og.png",
  imageWidth: "1200",
  imageHeight: "630",
  imageAlt: "代替説明",
  siteName: "サイト",
};
test("validates input and escapes generated tags", () => {
  expect(validateOgpInput(input)).toEqual({ errors: [], warnings: [] });
  const tags = generateMetaTags(input);
  expect(tags).toContain('og:title" content="A &amp; &quot;B&quot;');
  expect(tags).toContain('twitter:card" content="summary_large_image');
});
test("reports invalid URLs, dimensions, and optional warnings", () => {
  const result = validateOgpInput({
    ...input,
    url: "/relative",
    imageWidth: "100",
    imageHeight: "100",
    imageAlt: "",
  });
  expect(result.errors).toContain(
    "ページURLはhttp(s)の絶対URLで入力してください。",
  );
  expect(result.warnings).toHaveLength(2);
});
test("diagnoses pasted head fragments", () => {
  const issues = diagnoseHead(
    '<meta property="og:title" content="Title"><meta property="og:url" content="https://example.com">',
  );
  expect(issues.some((issue) => issue.message.includes("og:description"))).toBe(
    true,
  );
  expect(issues.some((issue) => issue.message.includes("twitter:card"))).toBe(
    true,
  );
});
test("accepts complete generated markup", () => {
  expect(diagnoseHead(generateMetaTags(input))).toEqual([
    {
      severity: "info",
      message: "初期チェック対象のOGP・X向けタグが見つかりました。",
    },
  ]);
});
