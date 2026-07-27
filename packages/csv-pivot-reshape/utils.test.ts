import { parseCsv, pivotTable, serializeCsv, unpivotTable } from "./utils";

const longTable = parseCsv(`地域,商品,月,売上
東,商品A,1月,100
東,商品A,1月,50
東,商品A,2月,120
西,商品B,1月,200
西,商品B,2月,`);

test("parses and serializes quoted CSV", () => {
  const table = parseCsv('コード,名称\r\n1,"A,B"');
  expect(table.rows[0].名称).toBe("A,B");
  expect(serializeCsv(table)).toContain('"A,B"');
  expect(() => parseCsv("列,列\n1,2")).toThrow("同じ列名");
});

test("pivots rows with sum and reports blanks and duplicate combinations", () => {
  const result = pivotTable(longTable, {
    idColumns: ["地域", "商品"],
    pivotColumn: "月",
    valueColumn: "売上",
    aggregate: "sum",
  });
  expect(result.output.headers).toEqual(["地域", "商品", "1月", "2月"]);
  expect(result.output.rows).toEqual([
    { 地域: "東", 商品: "商品A", "1月": "150", "2月": "120" },
    { 地域: "西", 商品: "商品B", "1月": "200", "2月": "" },
  ]);
  expect(result.blankValueCount).toBe(1);
  expect(result.duplicateCombinationCount).toBe(1);
});

test.each([
  ["count", "2"],
  ["average", "75"],
  ["min", "50"],
  ["max", "100"],
] as const)("supports %s aggregation", (aggregate, expected) => {
  const result = pivotTable(longTable, {
    idColumns: ["地域", "商品"],
    pivotColumn: "月",
    valueColumn: "売上",
    aggregate,
  });
  expect(result.output.rows[0]["1月"]).toBe(expected);
});

test("rejects non-numeric values instead of silently excluding them", () => {
  const table = parseCsv("地域,月,売上\n東,1月,100\n東,2月,未定");
  expect(() =>
    pivotTable(table, {
      idColumns: ["地域"],
      pivotColumn: "月",
      valueColumn: "売上",
      aggregate: "sum",
    }),
  ).toThrow("元行3");
});

test("un-pivots selected value columns and preserves blanks", () => {
  const table = parseCsv("商品,1月,2月\nA,10,12\nB,20,");
  const result = unpivotTable(table, {
    idColumns: ["商品"],
    valueColumns: ["1月", "2月"],
    fieldColumnName: "月",
    valueColumnName: "数量",
  });
  expect(result.output.headers).toEqual(["商品", "月", "数量"]);
  expect(result.output.rows).toHaveLength(4);
  expect(result.output.rows[3]).toEqual({ 商品: "B", 月: "2月", 数量: "" });
  expect(result.blankValueCount).toBe(1);
});

test("rejects overlapping roles and output names", () => {
  expect(() =>
    unpivotTable(longTable, {
      idColumns: ["地域"],
      valueColumns: ["地域"],
      fieldColumnName: "項目",
      valueColumnName: "値",
    }),
  ).toThrow("別の列");
});
