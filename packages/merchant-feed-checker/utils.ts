export type FeedTable = { headers: string[]; rows: Record<string, string>[] };
export type FeedIssue = {
  row: number | null;
  field: string;
  severity: "error" | "warning";
  message: string;
};

export function parseFeed(text: string): FeedTable {
  const delimiter = text.split(/\r?\n/, 1)[0].includes("\t") ? "\t" : ",";
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter(Boolean);
  if (lines.length < 2) throw new Error("見出し行と商品行が必要です。");
  const split = (line: string) => {
    const result: string[] = [];
    let value = "";
    let quoted = false;
    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];
      if (char === '"') {
        if (quoted && line[i + 1] === '"') {
          value += '"';
          i += 1;
        } else quoted = !quoted;
      } else if (char === delimiter && !quoted) {
        result.push(value);
        value = "";
      } else value += char;
    }
    result.push(value);
    return result;
  };
  const headers = split(lines[0]).map((value) => value.trim().toLowerCase());
  return {
    headers,
    rows: lines
      .slice(1)
      .map((line) =>
        Object.fromEntries(
          headers.map((header, index) => [header, split(line)[index] ?? ""]),
        ),
      ),
  };
}

export function validGtin(value: string) {
  if (!/^\d{8}$|^\d{12,14}$/.test(value)) return false;
  const digits = value.split("").map(Number);
  const check = digits.pop()!;
  const sum = digits
    .reverse()
    .reduce(
      (total, digit, index) => total + digit * (index % 2 === 0 ? 3 : 1),
      0,
    );
  return (10 - (sum % 10)) % 10 === check;
}

export function diagnoseFeed(table: FeedTable): FeedIssue[] {
  const issues: FeedIssue[] = [];
  const required = [
    "id",
    "title",
    "description",
    "link",
    "image_link",
    "availability",
    "price",
  ];
  for (const field of required)
    if (!table.headers.includes(field))
      issues.push({
        row: null,
        field,
        severity: "error",
        message: `必須属性「${field}」がありません。`,
      });
  table.rows.forEach((row, index) => {
    const line = index + 2;
    for (const field of required)
      if (table.headers.includes(field) && !row[field]?.trim())
        issues.push({
          row: line,
          field,
          severity: "error",
          message: "値が空です。",
        });
    if (row.price && !/^\d+(?:\.\d{1,2})?\s+[A-Z]{3}$/.test(row.price.trim()))
      issues.push({
        row: line,
        field: "price",
        severity: "error",
        message: "例「1200 JPY」のように金額と通貨コードを入力してください。",
      });
    if (
      row.availability &&
      !["in_stock", "out_of_stock", "preorder", "backorder"].includes(
        row.availability.trim(),
      )
    )
      issues.push({
        row: line,
        field: "availability",
        severity: "error",
        message: `「${row.availability.trim()}」は使用できません。availabilityには in_stock（在庫あり）、out_of_stock（在庫なし）、preorder（予約注文）、backorder（取り寄せ）のいずれかを半角英字で入力してください。`,
      });
    for (const field of ["link", "image_link"])
      if (row[field]) {
        try {
          new URL(row[field]);
        } catch {
          issues.push({
            row: line,
            field,
            severity: "error",
            message: "有効な絶対URLではありません。",
          });
        }
      }
    if (row.gtin && !validGtin(row.gtin.trim()))
      issues.push({
        row: line,
        field: "gtin",
        severity: "warning",
        message: "GTINの桁数またはチェックデジットを確認してください。",
      });
    if (row.title && Array.from(row.title).length > 150)
      issues.push({
        row: line,
        field: "title",
        severity: "warning",
        message: "商品名が150文字を超えています。",
      });
  });
  return issues;
}
