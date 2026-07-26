import {
  createEmptyMappings,
  decodeUtf8,
  getExcludedSourceHeaders,
  parseCsv,
  serializeCsv,
  suggestMappings,
  transformCsv,
  type ColumnMapping,
} from "./utils";

describe("csv column mapper utilities", () => {
  test("parses quoted commas, line breaks and BOM", () => {
    const table = parseCsv(
      '\uFEFFsku,title,note\r\nA-1,"バッグ, 青","1行目\n2行目"',
    );
    expect(table.rows[0]).toEqual({
      sku: "A-1",
      title: "バッグ, 青",
      note: "1行目\n2行目",
    });
  });

  test("allows a header-only target template", () => {
    expect(parseCsv("商品コード,商品名,公開状態", false).headers).toEqual([
      "商品コード",
      "商品名",
      "公開状態",
    ]);
  });

  test("rejects duplicate and overflowing columns", () => {
    expect(() => parseCsv("id,id\n1,2")).toThrow("同じ列名");
    expect(() => parseCsv("id,name\n1,A,extra")).toThrow("項目数");
  });

  test("rejects bytes that are not valid UTF-8", () => {
    const bytes = new Uint8Array([0x82, 0xa0]);
    expect(() => decodeUtf8(bytes.buffer)).toThrow("UTF-8");
  });

  test("suggests only uniquely normalized matching headers", () => {
    expect(
      suggestMappings(["商品 コード", "商品名"], ["商品コード", "公開状態"]),
    ).toEqual({ 商品コード: "商品 コード", 公開状態: "" });
  });

  test("starts every target column unassigned", () => {
    expect(createEmptyMappings(["sku"])[0].mode).toBe("unassigned");
  });

  test("renames, reorders, excludes and adds fixed values", () => {
    const source = parseCsv("sku,title,cost\nA-1,バッグ,1200\nA-2,帽子,900");
    const mappings: ColumnMapping[] = [
      {
        targetHeader: "商品名",
        mode: "source",
        sourceHeader: "title",
        fixedValue: "",
      },
      {
        targetHeader: "商品コード",
        mode: "source",
        sourceHeader: "sku",
        fixedValue: "",
      },
      {
        targetHeader: "公開状態",
        mode: "fixed",
        sourceHeader: "",
        fixedValue: "draft",
      },
    ];
    const result = transformCsv(source, mappings);
    expect(result.headers).toEqual(["商品名", "商品コード", "公開状態"]);
    expect(result.rows[0]).toEqual({
      商品名: "バッグ",
      商品コード: "A-1",
      公開状態: "draft",
    });
    expect(getExcludedSourceHeaders(source.headers, mappings)).toEqual([
      "cost",
    ]);
  });

  test("does not transform while target columns remain unassigned", () => {
    const source = parseCsv("sku\nA-1");
    expect(() =>
      transformCsv(source, createEmptyMappings(["商品コード"])),
    ).toThrow("未割当");
  });

  test("serializes quotes and line breaks safely", () => {
    expect(
      serializeCsv({
        headers: ["id", "title"],
        rows: [{ id: "1", title: 'A, "B"' }],
      }),
    ).toBe('id,title\r\n1,"A, ""B"""');
  });
});
