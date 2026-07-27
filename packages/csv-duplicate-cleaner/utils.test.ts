import {
  DEFAULT_NORMALIZATION,
  analyzeDuplicates,
  buildCleanedOutputs,
  normalizeKey,
  parseCsv,
  serializeCsv,
} from "./utils";

describe("CSV duplicate cleaner utilities", () => {
  test("parses quoted CSV and rejects malformed input", () => {
    const table = parseCsv('id,name\r\n1,"山田, 太郎"');
    expect(table.rows[0].name).toBe("山田, 太郎");
    expect(() => parseCsv('id,name\n1,"未完了')).toThrow(
      "引用符が閉じられていません。",
    );
  });

  test("normalizes only the enabled differences", () => {
    expect(normalizeKey(" ＡＢＣ　商店 ", DEFAULT_NORMALIZATION)).toBe(
      "abc 商店",
    );
    expect(
      normalizeKey(" ＡＢＣ-商店 ", {
        ...DEFAULT_NORMALIZATION,
        ignoreSymbols: true,
      }),
    ).toBe("abc商店");
  });

  test("separates exact duplicates, normalized candidates, and blank keys", () => {
    const table = parseCsv(
      "id,name\n1,山田 太郎\n2,山田太郎\n3,佐藤花子\n4,山田 太郎\n5,",
    );
    const analysis = analyzeDuplicates(table, "name", {
      ...DEFAULT_NORMALIZATION,
      ignoreSymbols: true,
    });

    expect(analysis.groups).toHaveLength(1);
    expect(analysis.groups[0].matchType).toBe("normalized");
    expect(analysis.groups[0].rows.map((row) => row.sourceLine)).toEqual([
      2, 3, 5,
    ]);
    expect(analysis.blankKeyRows).toEqual([6]);
  });

  test("requires a keep choice and adds reversible audit columns", () => {
    const table = parseCsv("id,email\n1,a@example.com\n2,a@example.com\n3,b@example.com");
    const analysis = analyzeDuplicates(
      table,
      "email",
      DEFAULT_NORMALIZATION,
    );
    expect(() => buildCleanedOutputs(table, analysis.groups, {})).toThrow(
      "各重複グループで残す行を選択してください。",
    );

    const outputs = buildCleanedOutputs(table, analysis.groups, {
      [analysis.groups[0].id]: 1,
    });
    expect(outputs.cleaned.rows).toHaveLength(2);
    expect(outputs.cleaned.rows[0].サクプラ_元行番号).toBe("3");
    expect(outputs.excluded.rows).toEqual([
      expect.objectContaining({
        id: "1",
        サクプラ_元行番号: "2",
        サクプラ_除外理由: "完全一致の重複",
        サクプラ_残した元行番号: "3",
      }),
    ]);
  });

  test("serializes commas and quotes safely", () => {
    expect(
      serializeCsv({
        headers: ["id", "name"],
        rows: [{ id: "1", name: 'A, "B"' }],
      }),
    ).toBe('id,name\r\n1,"A, ""B"""');
  });
});
