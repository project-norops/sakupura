export type CsvTable = {
  headers: string[];
  rows: Record<string, string>[];
};

export type ColumnMapping = {
  targetHeader: string;
  mode: "unassigned" | "source" | "fixed";
  sourceHeader: string;
  fixedValue: string;
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

export function parseCsv(text: string, requireRows = true): CsvTable {
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
  if (records.length === 0) throw new Error("CSVに見出し行がありません。");
  if (requireRows && records.length < 2) {
    throw new Error("変換元CSVには見出し行と1行以上のデータが必要です。");
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

function normalizedHeader(value: string) {
  return value
    .normalize("NFKC")
    .trim()
    .toLocaleLowerCase("ja-JP")
    .replace(/[\s_-]+/g, "");
}

export function suggestMappings(
  sourceHeaders: string[],
  targetHeaders: string[],
) {
  const sourcesByName = new Map<string, string[]>();
  for (const header of sourceHeaders) {
    const normalized = normalizedHeader(header);
    sourcesByName.set(normalized, [
      ...(sourcesByName.get(normalized) ?? []),
      header,
    ]);
  }

  return Object.fromEntries(
    targetHeaders.map((target) => {
      const candidates = sourcesByName.get(normalizedHeader(target)) ?? [];
      return [target, candidates.length === 1 ? candidates[0] : ""];
    }),
  );
}

export function createEmptyMappings(targetHeaders: string[]): ColumnMapping[] {
  return targetHeaders.map((targetHeader) => ({
    targetHeader,
    mode: "unassigned",
    sourceHeader: "",
    fixedValue: "",
  }));
}

export function validateMappings(
  sourceHeaders: string[],
  mappings: ColumnMapping[],
) {
  const unassigned = mappings
    .filter((mapping) => mapping.mode === "unassigned")
    .map((mapping) => mapping.targetHeader);
  if (unassigned.length > 0) {
    throw new Error(`未割当の出力列があります: ${unassigned.join("、")}`);
  }

  for (const mapping of mappings) {
    if (
      mapping.mode === "source" &&
      (!mapping.sourceHeader || !sourceHeaders.includes(mapping.sourceHeader))
    ) {
      throw new Error(
        `「${mapping.targetHeader}」の変換元列を選択してください。`,
      );
    }
  }
}

export function getExcludedSourceHeaders(
  sourceHeaders: string[],
  mappings: ColumnMapping[],
) {
  const used = new Set(
    mappings
      .filter((mapping) => mapping.mode === "source")
      .map((mapping) => mapping.sourceHeader),
  );
  return sourceHeaders.filter((header) => !used.has(header));
}

export function transformCsv(
  source: CsvTable,
  mappings: ColumnMapping[],
): CsvTable {
  validateMappings(source.headers, mappings);
  return {
    headers: mappings.map((mapping) => mapping.targetHeader),
    rows: source.rows.map((row) =>
      Object.fromEntries(
        mappings.map((mapping) => [
          mapping.targetHeader,
          mapping.mode === "source"
            ? (row[mapping.sourceHeader] ?? "")
            : mapping.fixedValue,
        ]),
      ),
    ),
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
