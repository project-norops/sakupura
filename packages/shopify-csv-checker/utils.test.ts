import {
  diagnoseShopifyCsv,
  parseCsv,
  repairTable,
  serializeCsv,
} from "./utils";

describe("shopify csv utilities", () => {
  test("parses quoted commas and newlines", () => {
    const table = parseCsv(
      'Handle,Title,Variant Price\r\na,"商品, A",1200\r\n',
    );
    expect(table.rows[0].Title).toBe("商品, A");
  });
  test("reports invalid values and duplicate sku", () => {
    const table = parseCsv(
      "Handle,Title,Variant Price,Variant SKU,Image Src\na,A,abc,S1,bad\na,,100,S1,https://example.com/a.jpg",
    );
    const issues = diagnoseShopifyCsv(table);
    expect(
      issues.some(
        (issue) =>
          issue.field === "Variant Price" && issue.severity === "error",
      ),
    ).toBe(true);
    expect(issues.some((issue) => issue.field === "Variant SKU")).toBe(true);
    expect(issues.some((issue) => issue.field === "Image Src")).toBe(true);
  });
  test("repairs safe casing and preserves quoted values", () => {
    const table = repairTable(
      parseCsv(
        'Handle,Title,Variant Price,Published,Status\na," A, B ",100,yes,ACTIVE',
      ),
    );
    expect(table.rows[0].Published).toBe("TRUE");
    expect(table.rows[0].Status).toBe("active");
    expect(serializeCsv(table)).toContain('"A, B"');
  });
  test("warns about cells that spreadsheet apps may treat as formulas", () => {
    const table = parseCsv(
      'Handle,Title,Variant Price\na,=HYPERLINK(""https://bad.example""),100',
    );
    expect(
      diagnoseShopifyCsv(table).some((issue) =>
        issue.message.includes("数式として実行"),
      ),
    ).toBe(true);
  });
});
