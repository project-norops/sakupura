export type CsvTable = {
  headers: string[];
  rows: Record<string, string>[];
};

export type Aggregate = "count" | "sum" | "average" | "min" | "max";

export type PivotOptions = {
  idColumns: string[];
  pivotColumn: string;
  valueColumn: string;
  aggregate: Aggregate;
};

export type UnpivotOptions = {
  idColumns: string[];
  valueColumns: string[];
  fieldColumnName: string;
  valueColumnName: string;
};

export type ReshapeResult = {
  output: CsvTable;
  inputRows: number;
  inputColumns: number;
  outputRows: number;
  outputColumns: number;
  blankValueCount: number;
  duplicateCombinationCount: number;
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

function requireColumns(
  table: CsvTable,
  columns: readonly string[],
  message: string,
) {
  if (
    !columns.length ||
    columns.some((column) => !table.headers.includes(column))
  ) {
    throw new Error(message);
  }
  if (new Set(columns).size !== columns.length) {
    throw new Error("同じ列を複数の役割へ重ねて選択できません。");
  }
}

function numericValue(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/.test(trimmed)) return undefined;
  const number = Number(trimmed);
  return Number.isFinite(number) ? number : undefined;
}

function formatNumber(value: number) {
  return Number.isInteger(value)
    ? String(value)
    : String(Number(value.toFixed(10)));
}

function uniqueOutputHeaders(
  idColumns: readonly string[],
  values: readonly string[],
) {
  const used = new Set(idColumns);
  return values.map((value) => {
    const base = value || "（空欄）";
    let candidate = used.has(base) ? `値_${base}` : base;
    let suffix = 2;
    while (used.has(candidate)) {
      candidate = `${base}_${suffix}`;
      suffix += 1;
    }
    used.add(candidate);
    return candidate;
  });
}

export function pivotTable(
  table: CsvTable,
  options: PivotOptions,
): ReshapeResult {
  requireColumns(table, options.idColumns, "識別列を1つ以上選択してください。");
  requireColumns(
    table,
    [options.pivotColumn, options.valueColumn],
    "展開列と値列を選択してください。",
  );
  if (
    options.pivotColumn === options.valueColumn ||
    options.idColumns.includes(options.pivotColumn) ||
    options.idColumns.includes(options.valueColumn)
  ) {
    throw new Error("識別列、展開列、値列は別の列を選択してください。");
  }

  const axisValues = [
    ...new Set(table.rows.map((row) => row[options.pivotColumn] ?? "")),
  ];
  const outputAxisHeaders = uniqueOutputHeaders(options.idColumns, axisValues);
  const numericIssues: Array<{ line: number; value: string }> = [];
  let blankValueCount = 0;
  if (options.aggregate !== "count") {
    table.rows.forEach((row, index) => {
      const value = row[options.valueColumn] ?? "";
      const parsed = numericValue(value);
      if (parsed === null) blankValueCount += 1;
      else if (parsed === undefined)
        numericIssues.push({ line: index + 2, value });
    });
    if (numericIssues.length) {
      const lines = numericIssues
        .slice(0, 5)
        .map((item) => item.line)
        .join("・");
      throw new Error(
        `数値集計できない値が${numericIssues.length}件あります（元行${lines}）。合計・平均・最小・最大では非数値を除外せず、修正を求めます。`,
      );
    }
  } else {
    blankValueCount = table.rows.filter(
      (row) => !(row[options.valueColumn] ?? "").trim(),
    ).length;
  }

  const combinations = new Map<string, number>();
  const groups = new Map<
    string,
    { ids: Record<string, string>; values: Map<string, string[]> }
  >();
  table.rows.forEach((row) => {
    const idValues = options.idColumns.map((column) => row[column] ?? "");
    const groupKey = JSON.stringify(idValues);
    const axis = row[options.pivotColumn] ?? "";
    const comboKey = JSON.stringify([...idValues, axis]);
    combinations.set(comboKey, (combinations.get(comboKey) ?? 0) + 1);
    const group = groups.get(groupKey) ?? {
      ids: Object.fromEntries(
        options.idColumns.map((column, index) => [column, idValues[index]]),
      ),
      values: new Map<string, string[]>(),
    };
    group.values.set(axis, [
      ...(group.values.get(axis) ?? []),
      row[options.valueColumn] ?? "",
    ]);
    groups.set(groupKey, group);
  });

  const aggregateValues = (values: string[]) => {
    if (!values.length) return "";
    if (options.aggregate === "count") return String(values.length);
    const numbers = values
      .map(numericValue)
      .filter((value): value is number => typeof value === "number");
    if (!numbers.length) return "";
    if (options.aggregate === "sum") {
      return formatNumber(numbers.reduce((total, value) => total + value, 0));
    }
    if (options.aggregate === "average") {
      return formatNumber(
        numbers.reduce((total, value) => total + value, 0) / numbers.length,
      );
    }
    if (options.aggregate === "min") return formatNumber(Math.min(...numbers));
    return formatNumber(Math.max(...numbers));
  };

  const rows = [...groups.values()].map((group) =>
    Object.fromEntries([
      ...Object.entries(group.ids),
      ...axisValues.map((axis, index) => [
        outputAxisHeaders[index],
        aggregateValues(group.values.get(axis) ?? []),
      ]),
    ]),
  );
  const headers = [...options.idColumns, ...outputAxisHeaders];
  return {
    output: { headers, rows },
    inputRows: table.rows.length,
    inputColumns: table.headers.length,
    outputRows: rows.length,
    outputColumns: headers.length,
    blankValueCount,
    duplicateCombinationCount: [...combinations.values()].reduce(
      (total, count) => total + Math.max(0, count - 1),
      0,
    ),
  };
}

export function unpivotTable(
  table: CsvTable,
  options: UnpivotOptions,
): ReshapeResult {
  requireColumns(table, options.idColumns, "識別列を1つ以上選択してください。");
  requireColumns(
    table,
    options.valueColumns,
    "縦持ちにする列を1つ以上選択してください。",
  );
  if (
    options.valueColumns.some((column) => options.idColumns.includes(column))
  ) {
    throw new Error("識別列と縦持ちにする列は別の列を選択してください。");
  }
  const fieldName = options.fieldColumnName.trim();
  const valueName = options.valueColumnName.trim();
  if (!fieldName || !valueName) {
    throw new Error("項目名列と値列の出力列名を入力してください。");
  }
  if (
    fieldName === valueName ||
    options.idColumns.includes(fieldName) ||
    options.idColumns.includes(valueName)
  ) {
    throw new Error("出力列名は識別列と重ならない別々の名前にしてください。");
  }
  let blankValueCount = 0;
  const rows = table.rows.flatMap((row) =>
    options.valueColumns.map((column) => {
      const value = row[column] ?? "";
      if (!value.trim()) blankValueCount += 1;
      return Object.fromEntries([
        ...options.idColumns.map((idColumn) => [idColumn, row[idColumn] ?? ""]),
        [fieldName, column],
        [valueName, value],
      ]);
    }),
  );
  const headers = [...options.idColumns, fieldName, valueName];
  return {
    output: { headers, rows },
    inputRows: table.rows.length,
    inputColumns: table.headers.length,
    outputRows: rows.length,
    outputColumns: headers.length,
    blankValueCount,
    duplicateCombinationCount: 0,
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
