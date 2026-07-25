import {
  EMPTY_SIGNATURE,
  SAMPLE_SIGNATURE,
  escapeHtml,
  generatePlainText,
  generateSignatureHtml,
  hasSignatureContent,
  normalizeWebsite,
} from "./utils";

describe("email signature utilities", () => {
  test("escapes user-provided HTML in every visible field", () => {
    const html = generateSignatureHtml({
      ...SAMPLE_SIGNATURE,
      name: '<img src=x onerror="alert(1)">',
      company: "A&B <script>bad</script>",
    });

    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<img src=x");
    expect(html).toContain("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
    expect(html).toContain("A&amp;B &lt;script&gt;bad&lt;/script&gt;");
  });

  test("normalizes bare domains and rejects unsupported schemes", () => {
    expect(normalizeWebsite("example.com")).toBe("https://example.com/");
    expect(normalizeWebsite("https://example.com/about")).toBe(
      "https://example.com/about",
    );
    expect(normalizeWebsite("javascript:alert(1)")).toBeNull();
    expect(normalizeWebsite(" ")).toBeNull();
  });

  test("uses only the predefined accent colors", () => {
    const html = generateSignatureHtml({
      ...SAMPLE_SIGNATURE,
      accentColor: "red; background:url(javascript:alert(1))",
    });

    expect(html).toContain("border-left:4px solid #2563eb");
    expect(html).not.toContain("javascript:");
  });

  test("builds clickable email, telephone, and website links", () => {
    const html = generateSignatureHtml(SAMPLE_SIGNATURE);

    expect(html).toContain('href="mailto:taro@example.com"');
    expect(html).toContain('href="tel:0312345678"');
    expect(html).toContain('href="https://example.com/"');
  });

  test("generates a readable plain-text fallback without blank lines", () => {
    expect(generatePlainText(SAMPLE_SIGNATURE)).toBe(
      [
        "山田 太郎",
        "代表 / クリエイティブ事業部 / サクプラデザイン",
        "Email: taro@example.com",
        "Tel: 03-1234-5678",
        "Web: https://example.com",
        "Address: 東京都千代田区1-2-3",
      ].join("\n"),
    );
    expect(generatePlainText({ ...EMPTY_SIGNATURE, name: "山田" })).toBe(
      "山田",
    );
  });

  test("requires a name before enabling copy", () => {
    expect(hasSignatureContent(EMPTY_SIGNATURE)).toBe(false);
    expect(hasSignatureContent({ ...EMPTY_SIGNATURE, company: "会社" })).toBe(
      false,
    );
    expect(hasSignatureContent({ ...EMPTY_SIGNATURE, name: " 山田 " })).toBe(
      true,
    );
  });

  test("escapes the five HTML-sensitive characters", () => {
    expect(escapeHtml(`&<>"'`)).toBe("&amp;&lt;&gt;&quot;&#039;");
  });
});
