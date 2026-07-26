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
    const issues = diagnoseShopifyCsv(table, "new");
    expect(
      issues.some(
        (issue) =>
          issue.field === "Variant Price" && issue.severity === "error",
      ),
    ).toBe(true);
    expect(issues.some((issue) => issue.field === "Variant SKU")).toBe(true);
    expect(issues.some((issue) => issue.field === "Image Src")).toBe(true);
  });
  test("does not require price for a new-product CSV", () => {
    const issues = diagnoseShopifyCsv(parseCsv("Title\n商品A"), "new");
    expect(issues.some((issue) => issue.field.includes("Price"))).toBe(false);
    expect(issues.some((issue) => issue.severity === "error")).toBe(false);
  });
  test("requires handle and title columns when updating", () => {
    const issues = diagnoseShopifyCsv(parseCsv("Price\n1000"), "update");
    expect(
      issues.some(
        (issue) => issue.row === null && issue.field.includes("handle"),
      ),
    ).toBe(true);
    expect(
      issues.some(
        (issue) => issue.row === null && issue.field === "Title",
      ),
    ).toBe(true);
  });
  test("accepts current Shopify header names", () => {
    const table = parseCsv(
      "URL handle,Title,Price,SKU,Product image URL,Option1 name,Option1 value\na,商品A,1000,S1,https://example.com/a.jpg,Title,Default Title",
    );
    expect(diagnoseShopifyCsv(table, "update")).toEqual([]);
  });
  test("requires a handle when a new product has variants", () => {
    const table = parseCsv("Title,Option1 name,Option1 value\n商品A,Color,Red");
    expect(
      diagnoseShopifyCsv(table, "new").some(
        (issue) => issue.row === null && issue.field.includes("handle"),
      ),
    ).toBe(true);
  });
  test("blocks variant updates without option identity columns", () => {
    const table = parseCsv("URL handle,Title,Price\na,商品A,1000");
    expect(
      diagnoseShopifyCsv(table, "update").some((issue) =>
        issue.field.includes("Option1"),
      ),
    ).toBe(true);
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
