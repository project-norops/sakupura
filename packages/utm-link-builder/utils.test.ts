import {
  buildUtmUrl,
  normalizeUtmValue,
  utmWarnings,
  validateDestination,
} from "./utils";

describe("utm link utilities", () => {
  test("normalizes names consistently", () => {
    expect(normalizeUtmValue(" Summer Sale 2026 ")).toBe("summer_sale_2026");
  });
  test("preserves existing query and fragment", () => {
    const url = buildUtmUrl({
      url: "https://example.com/item?id=1#buy",
      source: "X",
      medium: "social",
      campaign: "Launch",
    });
    const parsed = new URL(url);
    expect(parsed.searchParams.get("id")).toBe("1");
    expect(parsed.searchParams.get("utm_source")).toBe("x");
    expect(parsed.hash).toBe("#buy");
  });
  test("rejects unsafe schemes and warns about naming", () => {
    expect(validateDestination("javascript:alert(1)")).toContain("http");
    expect(
      utmWarnings({
        url: "https://example.com",
        source: "X Ads",
        medium: "social",
        campaign: "Launch",
      }).length,
    ).toBeGreaterThan(1);
  });
});
