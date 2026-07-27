export type CsvTable = {
  headers: string[];
  rows: Record<string, string>[];
};

export type JoinType = "left" | "inner";

export type JoinOptions = {
  leftKey: string;
  rightKey: string;
  joinType: JoinType;
  selectedRightHeaders: string[];
};

export type JoinResult = {
  joined: CsvTable;
  unmatched: CsvTable;
  unmatchedLeftCount: number;
  unmatchedRightCount: number;
  duplicateRightKeys: Array<{
    key: string;
    count: number;
    sourceLines: number[];
  }>;
  matchedLeftCount: number;
  outputRowCount: number;
  expandedRowCount: number;
};

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

function outputHeader(leftHeaders: string[], rightHeader: string) {
  return leftHeaders.includes(rightHeader)
    ? `参照_${rightHeader}`
    : rightHeader;
}

export function joinTables(
  left: CsvTable,
  right: CsvTable,
  options: JoinOptions,
): JoinResult {
  if (!left.headers.includes(options.leftKey)) {
    throw new Error("基準CSVのキー列を選択してください。");
  }
  if (!right.headers.includes(options.rightKey)) {
    throw new Error("参照CSVのキー列を選択してください。");
  }
  const selected = options.selectedRightHeaders.filter(
    (header) => right.headers.includes(header) && header !== options.rightKey,
  );
  if (!selected.length) {
    throw new Error("参照CSVから追加する列を1つ以上選択してください。");
  }

  const rightByKey = new Map<
    string,
    Array<{ row: Record<string, string>; rowIndex: number }>
  >();
  right.rows.forEach((row, rowIndex) => {
    const key = row[options.rightKey] ?? "";
    if (!key) return;
    rightByKey.set(key, [...(rightByKey.get(key) ?? []), { row, rowIndex }]);
  });
  const duplicateRightKeys = [...rightByKey.entries()]
    .filter((entry) => entry[1].length > 1)
    .map(([key, rows]) => ({
      key,
      count: rows.length,
      sourceLines: rows.map((item) => item.rowIndex + 2),
    }));
  const usedRightRows = new Set<number>();
  const unmatchedRows: Record<string, string>[] = [];
  let matchedLeftCount = 0;
  const joinedRows = left.rows.flatMap((leftRow, leftIndex) => {
    const key = leftRow[options.leftKey] ?? "";
    const matches = key ? (rightByKey.get(key) ?? []) : [];
    if (!matches.length) {
      unmatchedRows.push({
        側: "基準CSV",
        元行番号: String(leftIndex + 2),
        キー値: key,
        内容: JSON.stringify(leftRow),
      });
      if (options.joinType === "inner") return [];
      return [
        Object.fromEntries([
          ...Object.entries(leftRow),
          ...selected.map((header) => [outputHeader(left.headers, header), ""]),
        ]),
      ];
    }
    matchedLeftCount += 1;
    return matches.map(({ row: rightRow, rowIndex }) => {
      usedRightRows.add(rowIndex);
      return Object.fromEntries([
        ...Object.entries(leftRow),
        ...selected.map((header) => [
          outputHeader(left.headers, header),
          rightRow[header] ?? "",
        ]),
      ]);
    });
  });

  right.rows.forEach((row, rowIndex) => {
    if (usedRightRows.has(rowIndex)) return;
    unmatchedRows.push({
      側: "参照CSV",
      元行番号: String(rowIndex + 2),
      キー値: row[options.rightKey] ?? "",
      内容: JSON.stringify(row),
    });
  });

  const baselineRows =
    options.joinType === "left" ? left.rows.length : matchedLeftCount;
  return {
    joined: {
      headers: [
        ...left.headers,
        ...selected.map((header) => outputHeader(left.headers, header)),
      ],
      rows: joinedRows,
    },
    unmatched: {
      headers: ["側", "元行番号", "キー値", "内容"],
      rows: unmatchedRows,
    },
    unmatchedLeftCount: unmatchedRows.filter((row) => row.側 === "基準CSV")
      .length,
    unmatchedRightCount: unmatchedRows.filter((row) => row.側 === "参照CSV")
      .length,
    duplicateRightKeys,
    matchedLeftCount,
    outputRowCount: joinedRows.length,
    expandedRowCount: Math.max(0, joinedRows.length - baselineRows),
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
