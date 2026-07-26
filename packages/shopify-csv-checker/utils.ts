export type CsvTable = { headers: string[]; rows: Record<string, string>[] };
export type ImportMode = "new" | "update";
export type CsvIssue = {
  row: number | null;
  field: string;
  severity: "error" | "warning";
  message: string;
};

const HEADER_ALIASES = {
  handle: ["URL handle", "Handle"],
  title: ["Title"],
  price: ["Price", "Variant Price"],
  compareAtPrice: ["Compare-at price", "Variant Compare At Price"],
  sku: ["SKU", "Variant SKU"],
  image: ["Product image URL", "Image Src", "Image URL"],
  published: ["Published on online store", "Published"],
  status: ["Status"],
  option1Name: ["Option1 name", "Option1 Name"],
  option1Value: ["Option1 value", "Option1 Value"],
} as const;

type CanonicalField = keyof typeof HEADER_ALIASES;

function findHeader(
  table: CsvTable,
  field: CanonicalField,
): string | undefined {
  const lookup = new Map(
    table.headers.map((header) => [header.toLowerCase(), header]),
  );
  return HEADER_ALIASES[field]
    .map((alias) => lookup.get(alias.toLowerCase()))
    .find((header): header is string => Boolean(header));
}

function cell(row: Record<string, string>, header?: string): string {
  return header ? (row[header] ?? "") : "";
}

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

export function diagnoseShopifyCsv(
  table: CsvTable,
  mode: ImportMode = "new",
): CsvIssue[] {
  const issues: CsvIssue[] = [];
  const headers = {
    handle: findHeader(table, "handle"),
    title: findHeader(table, "title"),
    price: findHeader(table, "price"),
    compareAtPrice: findHeader(table, "compareAtPrice"),
    sku: findHeader(table, "sku"),
    image: findHeader(table, "image"),
    published: findHeader(table, "published"),
    status: findHeader(table, "status"),
    option1Name: findHeader(table, "option1Name"),
    option1Value: findHeader(table, "option1Value"),
  };
  const required: { key: "handle" | "title"; label: string }[] =
    mode === "update"
      ? [
          { key: "handle", label: "URL handle（旧形式: Handle）" },
          { key: "title", label: "Title" },
        ]
      : [{ key: "title", label: "Title" }];
  const hasVariantValues = Boolean(
    (headers.option1Name &&
      table.rows.some((row) => cell(row, headers.option1Name).trim())) ||
    (headers.option1Value &&
      table.rows.some((row) => cell(row, headers.option1Value).trim())),
  );
  if (mode === "new" && hasVariantValues)
    required.push({
      key: "handle",
      label: "URL handle（旧形式: Handle）",
    });
  for (const requirement of required)
    if (!headers[requirement.key])
      issues.push({
        row: null,
        field: requirement.label,
        severity: "error",
        message: `${mode === "update" ? "既存商品の更新" : "新規商品の登録"}に必要な列「${requirement.label}」がありません。`,
      });
  if (
    mode === "update" &&
    (headers.price || headers.sku) &&
    (!headers.option1Name || !headers.option1Value)
  )
    issues.push({
      row: null,
      field: "Option1 name / Option1 value",
      severity: "error",
      message:
        "価格またはSKUを更新する場合は、対象バリエーションを特定するOption1 nameとOption1 valueも含めてください。欠けたまま更新すると既存バリエーションへ影響する可能性があります。",
    });
  if (table.headers.some((header) => /\uFFFD/.test(header)))
    issues.push({
      row: null,
      field: "文字コード",
      severity: "error",
      message:
        "列名に読み取れない文字があります。CSVをUTF-8で保存し直してください。",
    });
  const skuRows = new Map<string, number>();
  const knownHandles = new Set<string>();
  table.rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const handle = cell(row, headers.handle).trim();
    const title = cell(row, headers.title).trim();
    const continuation = Boolean(handle && knownHandles.has(handle));
    if (handle) knownHandles.add(handle);
    if (mode === "update" && headers.handle && !handle)
      issues.push({
        row: rowNumber,
        field: headers.handle,
        severity: "error",
        message: "更新対象の商品を識別するURL handleが空です。",
      });
    if (headers.title && !title && !continuation)
      issues.push({
        row: rowNumber,
        field: headers.title,
        severity: mode === "new" ? "error" : "warning",
        message:
          "Titleが空です。同じURL handleの追加バリエーション行でなければ入力してください。",
      });
    const price = cell(row, headers.price).trim();
    if (price && (!/^\d+(?:\.\d{1,2})?$/.test(price) || Number(price) < 0))
      issues.push({
        row: rowNumber,
        field: headers.price ?? "Price",
        severity: "error",
        message: "価格は0以上の数値（小数2桁まで）で入力してください。",
      });
    const compare = cell(row, headers.compareAtPrice).trim();
    if (compare && !/^\d+(?:\.\d{1,2})?$/.test(compare))
      issues.push({
        row: rowNumber,
        field: headers.compareAtPrice ?? "Compare-at price",
        severity: "error",
        message: "割引前価格は0以上の数値（小数2桁まで）で入力してください。",
      });
    else if (compare && price && Number(compare) <= Number(price))
      issues.push({
        row: rowNumber,
        field: headers.compareAtPrice ?? "Compare-at price",
        severity: "warning",
        message: "割引前価格は販売価格より大きい値か確認してください。",
      });
    const image = cell(row, headers.image).trim();
    if (image && !isHttpUrl(image))
      issues.push({
        row: rowNumber,
        field: headers.image ?? "Product image URL",
        severity: "error",
        message: "画像URLはhttp://またはhttps://から始めてください。",
      });
    const status = cell(row, headers.status).trim().toLowerCase();
    if (status && !["active", "draft", "archived"].includes(status))
      issues.push({
        row: rowNumber,
        field: headers.status ?? "Status",
        severity: "warning",
        message: "Statusはactive、draft、archivedのいずれかです。",
      });
    const sku = cell(row, headers.sku).trim();
    if (sku) {
      if (skuRows.has(sku))
        issues.push({
          row: rowNumber,
          field: headers.sku ?? "SKU",
          severity: "warning",
          message: `SKU「${sku}」は${skuRows.get(sku)}行目にもあります。`,
        });
      else skuRows.set(sku, rowNumber);
    }
    for (const [field, value] of Object.entries(row)) {
      if (/\uFFFD/.test(value))
        issues.push({
          row: rowNumber,
          field,
          severity: "error",
          message:
            "読み取れない文字があります。CSVをUTF-8で保存し直してください。",
        });
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
  const publishedHeader = findHeader(table, "published");
  const statusHeader = findHeader(table, "status");
  return {
    headers: table.headers,
    rows: table.rows.map((row) => {
      const repaired = Object.fromEntries(
        table.headers.map((header) => [header, (row[header] ?? "").trim()]),
      );
      if (publishedHeader && repaired[publishedHeader])
        repaired[publishedHeader] = /^(true|yes|1)$/i.test(
          repaired[publishedHeader],
        )
          ? "TRUE"
          : /^(false|no|0)$/i.test(repaired[publishedHeader])
            ? "FALSE"
            : repaired[publishedHeader];
      if (statusHeader && repaired[statusHeader])
        repaired[statusHeader] = repaired[statusHeader].toLowerCase();
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
