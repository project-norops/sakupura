import { joinTables, parseCsv, serializeCsv } from "./utils";

describe("CSV joiner utilities", () => {
  test("parses quoted CSV and rejects malformed input", () => {
    expect(parseCsv('id,name\n1,"A, B"').rows[0].name).toBe("A, B");
    expect(() => parseCsv('id,name\n1,"未完了')).toThrow(
      "引用符が閉じられていません。",
    );
  });

  test("left joins all matches and reports duplicates and unmatched rows", () => {
    const left = parseCsv("order,sku,qty\nO1,A,1\nO2,B,2\nO3,C,3");
    const right = parseCsv(
      "sku,name,price\nA,商品A,100\nB,商品B,200\nB,商品B別,250\nD,商品D,400",
    );
    const result = joinTables(left, right, {
      leftKey: "sku",
      rightKey: "sku",
      joinType: "left",
      selectedRightHeaders: ["name", "price"],
    });

    expect(result.outputRowCount).toBe(4);
    expect(result.expandedRowCount).toBe(1);
    expect(result.unmatchedLeftCount).toBe(1);
    expect(result.unmatchedRightCount).toBe(1);
    expect(result.duplicateRightKeys).toEqual([
      { key: "B", count: 2, sourceLines: [3, 4] },
    ]);
    expect(result.joined.rows[3]).toEqual(
      expect.objectContaining({ order: "O3", name: "", price: "" }),
    );
    expect(result.unmatched.rows).toHaveLength(2);
  });

  test("inner join omits unmatched left rows and prefixes conflicting columns", () => {
    const left = parseCsv("id,name\n1,基準1\n2,基準2");
    const right = parseCsv("id,name\n1,参照1\n3,参照3");
    const result = joinTables(left, right, {
      leftKey: "id",
      rightKey: "id",
      joinType: "inner",
      selectedRightHeaders: ["name"],
    });
    expect(result.joined.headers).toEqual(["id", "name", "参照_name"]);
    expect(result.joined.rows).toEqual([
      { id: "1", name: "基準1", 参照_name: "参照1" },
    ]);
  });

  test("requires an added column and serializes output safely", () => {
    const left = parseCsv("id\n1");
    const right = parseCsv("id,name\n1,A");
    expect(() =>
      joinTables(left, right, {
        leftKey: "id",
        rightKey: "id",
        joinType: "left",
        selectedRightHeaders: [],
      }),
    ).toThrow("追加する列を1つ以上選択");
    expect(
      serializeCsv({
        headers: ["id", "name"],
        rows: [{ id: "1", name: "A, B" }],
      }),
    ).toBe('id,name\r\n1,"A, B"');
  });
});
