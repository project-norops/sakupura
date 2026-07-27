import {
  buildErrorCsv,
  buildValidationCsv,
  createDefaultRule,
  parseCsv,
  serializeCsv,
  suggestType,
  validateTable,
  type ColumnRule,
} from "./utils";

describe("CSV rule validator utilities", () => {
  test("parses quoted CSV and rejects malformed input", () => {
    const table = parseCsv('id,name\r\n1,"山田, 太郎"');
    expect(table.rows[0].name).toBe("山田, 太郎");
    expect(() => parseCsv('id,name\n1,"未完了')).toThrow(
      "引用符が閉じられていません。",
    );
    expect(() => parseCsv("id,id\n1,2")).toThrow("同じ列名が複数あります。");
  });

  test("suggests a type without changing a rule", () => {
    const untouched = createDefaultRule();
    expect(suggestType(["1", "2.5", "-3"])).toBe("number");
    expect(suggestType(["2026-01-01", "2026-12-31"])).toBe("date");
    expect(suggestType(["2026-02-30", "文字"])).toBe("string");
    expect(untouched.type).toBe("string");
  });

  test("checks required, type, range, length, allowed values, and duplicates", () => {
    const table = parseCsv(
      "code,name,price,date,status\nA-1,通常商品,1200,2026-01-02,販売中\nA-2,,未定,2026-02-30,販売中\nA-1,とても長い商品名,500,2025-12-31,確認中",
    );
    const rules: Record<string, ColumnRule> = {
      code: { ...createDefaultRule(), required: true, unique: true },
      name: { ...createDefaultRule(), required: true, maxLength: "5" },
      price: {
        ...createDefaultRule(),
        type: "number",
        min: "1000",
      },
      date: {
        ...createDefaultRule(),
        type: "date",
        min: "2026-01-01",
      },
      status: {
        ...createDefaultRule(),
        allowedValues: "販売中,販売終了",
      },
    };
    const result = validateTable(table, rules);

    expect(result.validRowCount).toBe(0);
    expect(result.invalidRowCount).toBe(3);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sourceLine: 3,
          column: "name",
          rule: "必須",
        }),
        expect.objectContaining({
          sourceLine: 3,
          column: "price",
          rule: "数値",
        }),
        expect.objectContaining({
          sourceLine: 3,
          column: "date",
          rule: "日付",
        }),
        expect.objectContaining({
          sourceLine: 4,
          column: "name",
          rule: "最大文字数",
        }),
        expect.objectContaining({
          sourceLine: 4,
          column: "price",
          rule: "最小値",
        }),
        expect.objectContaining({
          sourceLine: 4,
          column: "date",
          rule: "最小日付",
        }),
        expect.objectContaining({
          sourceLine: 4,
          column: "status",
          rule: "許可値",
        }),
      ]),
    );
    expect(
      result.errors.filter((error) => error.rule === "重複禁止"),
    ).toHaveLength(2);
  });

  test("adds audit columns and builds a full error list", () => {
    const table = parseCsv("id,price\n1,100\n2,invalid");
    const result = validateTable(table, {
      id: createDefaultRule(),
      price: { ...createDefaultRule(), type: "number" },
    });
    const validated = buildValidationCsv(table, result);
    const errors = buildErrorCsv(result);

    expect(validated.rows[0]).toEqual(
      expect.objectContaining({
        サクプラ_元行番号: "2",
        サクプラ_検証結果: "OK",
      }),
    );
    expect(validated.rows[1]).toEqual(
      expect.objectContaining({
        サクプラ_元行番号: "3",
        サクプラ_検証結果: "エラー",
        サクプラ_エラー件数: "1",
      }),
    );
    expect(errors.rows[0]).toEqual(
      expect.objectContaining({ 元行番号: "3", 列名: "price", ルール: "数値" }),
    );
    expect(serializeCsv(errors)).toContain(
      "元行番号,列名,ルール,入力値,指摘内容",
    );
  });
});
