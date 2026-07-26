export type CsvTable = {
  headers: string[];
  rows: Record<string, string>[];
};

export type NormalizationOptions = {
  trim: boolean;
  collapseWhitespace: boolean;
  normalizeWidth: boolean;
  ignoreCase: boolean;
  ignoreSymbols: boolean;
};

export type DuplicateRow = {
  rowIndex: number;
  sourceLine: number;
  value: string;
  row: Record<string, string>;
};

export type DuplicateGroup = {
  id: string;
  normalizedKey: string;
  matchType: "exact" | "normalized";
  rows: DuplicateRow[];
};

export type DuplicateAnalysis = {
  groups: DuplicateGroup[];
  blankKeyRows: number[];
  duplicateRowCount: number;
};

export type CleanedOutputs = {
  cleaned: CsvTable;
  excluded: CsvTable;
};

export const DEFAULT_NORMALIZATION: NormalizationOptions = {
  trim: true,
  collapseWhitespace: true,
  normalizeWidth: true,
  ignoreCase: true,
  ignoreSymbols: false,
};

const AUDIT_SOURCE_LINE = "サクプラ_元行番号";
const AUDIT_REASON = "サクプラ_除外理由";
const AUDIT_KEPT_LINE = "サクプラ_残した元行番号";
const RESERVED_HEADERS = [AUDIT_SOURCE_LINE, AUDIT_REASON, AUDIT_KEPT_LINE];

export function decodeUtf8(buffer: ArrayBuffer) {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(buffer);
  } catch {
    throw new Error(
      "UTF-8として読み込めない文字があります。UTF-8形式で保存し直してください。",
    );
  }
}

export function parseCsv(text: string): CsvTable {
  const records: string[][] = [];
  let record: string[] = [];
  let field = "";
  let quoted = false;
  const source = text.replace(/^\uFEFF/, "");

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (char === '"') {
      if (quoted && source[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      record.push(field);
      field = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && source[index + 1] === "\n") index += 1;
      record.push(field);
      if (record.some((value) => value !== "")) records.push(record);
      record = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (quoted) throw new Error("引用符が閉じられていません。");
  record.push(field);
  if (record.some((value) => value !== "")) records.push(record);
  if (records.length < 2) {
    throw new Error("CSVには見出し行と1行以上のデータが必要です。");
  }

  const headers = records[0].map((value) => value.trim());
  if (headers.some((value) => !value)) throw new Error("空の列名があります。");
  if (new Set(headers).size !== headers.length) {
    throw new Error("同じ列名が複数あります。");
  }
  if (headers.some((header) => RESERVED_HEADERS.includes(header))) {
    throw new Error(
      "サクプラの監査列と同じ列名があります。該当列の名称を変更してください。",
    );
  }

  const rows = records.slice(1).map((values, rowIndex) => {
    if (values.length > headers.length) {
      throw new Error(
        `${rowIndex + 2}行目の項目数が見出し列数を超えています。`,
      );
    }
    return Object.fromEntries(
      headers.map((header, index) => [header, values[index] ?? ""]),
    );
  });

  return { headers, rows };
}

export function normalizeKey(
  input: string,
  options: NormalizationOptions,
) {
  let value = input;
  if (options.trim) value = value.trim();
  if (options.normalizeWidth) value = value.normalize("NFKC");
  if (options.collapseWhitespace) value = value.replace(/\s+/g, " ");
  if (options.ignoreCase) value = value.toLocaleLowerCase("ja-JP");
  if (options.ignoreSymbols) {
    value = value.replace(/[\s\-_‐‑–—・･.．/／\\()（）［\][\]{}「」『』]+/g, "");
  }
  return value;
}

export function analyzeDuplicates(
  table: CsvTable,
  keyHeader: string,
  options: NormalizationOptions,
): DuplicateAnalysis {
  if (!table.headers.includes(keyHeader)) {
    throw new Error("重複確認に使うキー列を選択してください。");
  }

  const rowsByKey = new Map<string, DuplicateRow[]>();
  const blankKeyRows: number[] = [];
  table.rows.forEach((row, rowIndex) => {
    const value = row[keyHeader] ?? "";
    const normalized = normalizeKey(value, options);
    if (!normalized) {
      blankKeyRows.push(rowIndex + 2);
      return;
    }
    rowsByKey.set(normalized, [
      ...(rowsByKey.get(normalized) ?? []),
      { rowIndex, sourceLine: rowIndex + 2, value, row },
    ]);
  });

  const groups = [...rowsByKey.entries()]
    .filter((entry) => entry[1].length > 1)
    .map(([normalizedKey, rows], index) => ({
      id: `group-${index + 1}`,
      normalizedKey,
      matchType:
        new Set(rows.map((row) => row.value)).size === 1
          ? ("exact" as const)
          : ("normalized" as const),
      rows,
    }));

  return {
    groups,
    blankKeyRows,
    duplicateRowCount: groups.reduce(
      (total, group) => total + group.rows.length,
      0,
    ),
  };
}

export function buildCleanedOutputs(
  table: CsvTable,
  groups: DuplicateGroup[],
  keepByGroup: Record<string, number>,
): CleanedOutputs {
  const duplicateRowIndexes = new Set(
    groups.flatMap((group) => group.rows.map((row) => row.rowIndex)),
  );
  const excludedByIndex = new Map<
    number,
    { reason: string; keptSourceLine: number }
  >();

  for (const group of groups) {
    const keepIndex = keepByGroup[group.id];
    if (!group.rows.some((row) => row.rowIndex === keepIndex)) {
      throw new Error("各重複グループで残す行を選択してください。");
    }
    const kept = group.rows.find((row) => row.rowIndex === keepIndex)!;
    for (const row of group.rows) {
      if (row.rowIndex !== keepIndex) {
        excludedByIndex.set(row.rowIndex, {
          reason:
            group.matchType === "exact" ? "完全一致の重複" : "表記ゆれ候補",
          keptSourceLine: kept.sourceLine,
        });
      }
    }
  }

  const cleanedRows = table.rows.flatMap((row, rowIndex) => {
    const shouldKeep =
      !duplicateRowIndexes.has(rowIndex) || !excludedByIndex.has(rowIndex);
    return shouldKeep
      ? [{ ...row, [AUDIT_SOURCE_LINE]: String(rowIndex + 2) }]
      : [];
  });
  const excludedRows = table.rows.flatMap((row, rowIndex) => {
    const audit = excludedByIndex.get(rowIndex);
    return audit
      ? [
          {
            ...row,
            [AUDIT_SOURCE_LINE]: String(rowIndex + 2),
            [AUDIT_REASON]: audit.reason,
            [AUDIT_KEPT_LINE]: String(audit.keptSourceLine),
          },
        ]
      : [];
  });

  return {
    cleaned: {
      headers: [...table.headers, AUDIT_SOURCE_LINE],
      rows: cleanedRows,
    },
    excluded: {
      headers: [
        ...table.headers,
        AUDIT_SOURCE_LINE,
        AUDIT_REASON,
        AUDIT_KEPT_LINE,
      ],
      rows: excludedRows,
    },
  };
}

function csvCell(value: string) {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function serializeCsv(table: CsvTable) {
  return [
    table.headers,
    ...table.rows.map((row) =>
      table.headers.map((header) => row[header] ?? ""),
    ),
  ]
    .map((record) => record.map(csvCell).join(","))
    .join("\r\n");
}
