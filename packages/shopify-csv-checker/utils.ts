export type CsvTable = { headers: string[]; rows: Record<string, string>[] };
export type CsvIssue = {
  row: number | null;
  field: string;
  severity: "error" | "warning";
  message: string;
};

export const REQUIRED_HEADERS = ["Handle", "Title", "Variant Price"];

function parseRecords(text: string): string[][] {
  const records: string[][] = [];
  let record: string[] = [];
  let field = "";
  let quoted = false;
  const source = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    if (quoted) {
      if (char === '"' && source[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") {
      record.push(field);
      field = "";
    } else if (char === "\n") {
      record.push(field.replace(/\r$/, ""));
      records.push(record);
      record = [];
      field = "";
    } else field += char;
  }
  if (quoted) throw new Error("引用符が閉じられていません。");
  if (field || record.length) {
    record.push(field.replace(/\r$/, ""));
    records.push(record);
  }
  return records.filter((row) => row.some((value) => value.trim() !== ""));
}

export function parseCsv(text: string): CsvTable {
  const records = parseRecords(text);
  if (records.length === 0) throw new Error("CSVにデータがありません。");
  const headers = records[0].map((header) => header.trim());
  if (new Set(headers).size !== headers.length)
    throw new Error("同じ列名が複数あります。");
  const rows = records
    .slice(1)
    .map((values) =>
      Object.fromEntries(
        headers.map((header, index) => [header, values[index] ?? ""]),
      ),
    );
  return { headers, rows };
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function diagnoseShopifyCsv(table: CsvTable): CsvIssue[] {
  const issues: CsvIssue[] = [];
  for (const header of REQUIRED_HEADERS)
    if (!table.headers.includes(header))
      issues.push({
        row: null,
        field: header,
        severity: "error",
        message: `必須列「${header}」がありません。`,
      });
  const skuRows = new Map<string, number>();
  table.rows.forEach((row, index) => {
    const rowNumber = index + 2;
    if (!row.Handle?.trim())
      issues.push({
        row: rowNumber,
        field: "Handle",
        severity: "error",
        message: "商品を識別するHandleが空です。",
      });
    if (!row.Title?.trim())
      issues.push({
        row: rowNumber,
        field: "Title",
        severity: "warning",
        message:
          "Titleが空です。同じHandleの追加バリエーションでなければ入力してください。",
      });
    if (
      row["Variant Price"] !== undefined &&
      (!/^\d+(?:\.\d{1,2})?$/.test(row["Variant Price"].trim()) ||
        Number(row["Variant Price"]) < 0)
    )
      issues.push({
        row: rowNumber,
        field: "Variant Price",
        severity: "error",
        message: "価格は0以上の数値（小数2桁まで）で入力してください。",
      });
    const compare = row["Variant Compare At Price"]?.trim();
    if (compare && Number(compare) <= Number(row["Variant Price"]))
      issues.push({
        row: rowNumber,
        field: "Variant Compare At Price",
        severity: "warning",
        message: "割引前価格は販売価格より大きい値か確認してください。",
      });
    const image = row["Image Src"]?.trim();
    if (image && !isHttpUrl(image))
      issues.push({
        row: rowNumber,
        field: "Image Src",
        severity: "error",
        message: "画像URLはhttp://またはhttps://から始めてください。",
      });
    const status = row.Status?.trim().toLowerCase();
    if (status && !["active", "draft", "archived"].includes(status))
      issues.push({
        row: rowNumber,
        field: "Status",
        severity: "warning",
        message: "Statusはactive、draft、archivedのいずれかです。",
      });
    const sku = row["Variant SKU"]?.trim();
    if (sku) {
      if (skuRows.has(sku))
        issues.push({
          row: rowNumber,
          field: "Variant SKU",
          severity: "warning",
          message: `SKU「${sku}」は${skuRows.get(sku)}行目にもあります。`,
        });
      else skuRows.set(sku, rowNumber);
    }
    for (const [field, value] of Object.entries(row)) {
      if (/^[=+@]/.test(value.trim()) || /^-\D/.test(value.trim())) {
        issues.push({
          row: rowNumber,
          field,
          severity: "warning",
          message:
            "表計算ソフトで数式として実行される可能性がある先頭文字です。意図した商品データか確認してください。",
        });
      }
    }
  });
  return issues;
}

function quote(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

export function repairTable(table: CsvTable): CsvTable {
  return {
    headers: table.headers,
    rows: table.rows.map((row) => {
      const repaired = Object.fromEntries(
        table.headers.map((header) => [header, (row[header] ?? "").trim()]),
      );
      if (repaired.Published)
        repaired.Published = /^(true|yes|1)$/i.test(repaired.Published)
          ? "TRUE"
          : /^(false|no|0)$/i.test(repaired.Published)
            ? "FALSE"
            : repaired.Published;
      if (repaired.Status) repaired.Status = repaired.Status.toLowerCase();
      return repaired;
    }),
  };
}

export function serializeCsv(table: CsvTable): string {
  return [
    table.headers.map(quote).join(","),
    ...table.rows.map((row) =>
      table.headers.map((header) => quote(row[header] ?? "")).join(","),
    ),
  ].join("\r\n");
}
