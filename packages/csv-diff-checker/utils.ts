export type CsvTable = { headers: string[]; rows: Record<string, string>[] };

export type DiffRow = {
  key: string;
  status: "added" | "removed" | "changed" | "unchanged";
  before?: Record<string, string>;
  after?: Record<string, string>;
  changedFields: string[];
};

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
      } else quoted = !quoted;
    } else if (char === "," && !quoted) {
      record.push(field);
      field = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && source[index + 1] === "\n") index += 1;
      record.push(field);
      if (record.some((value) => value !== "")) records.push(record);
      record = [];
      field = "";
    } else field += char;
  }
  if (quoted) throw new Error("引用符が閉じられていません。");
  record.push(field);
  if (record.some((value) => value !== "")) records.push(record);
  if (records.length < 2)
    throw new Error("見出し行と1行以上のデータが必要です。");
  const headers = records[0].map((value) => value.trim());
  if (headers.some((value) => !value)) throw new Error("空の列名があります。");
  if (new Set(headers).size !== headers.length)
    throw new Error("同じ列名が複数あります。");
  return {
    headers,
    rows: records
      .slice(1)
      .map((values) =>
        Object.fromEntries(
          headers.map((header, index) => [header, values[index] ?? ""]),
        ),
      ),
  };
}

export function compareCsv(
  before: CsvTable,
  after: CsvTable,
  keyField: string,
): DiffRow[] {
  if (!before.headers.includes(keyField) || !after.headers.includes(keyField)) {
    throw new Error("両方のCSVに存在するキー列を選択してください。");
  }
  const toMap = (rows: Record<string, string>[]) => {
    const map = new Map<string, Record<string, string>>();
    for (const row of rows) {
      const key = row[keyField]?.trim();
      if (!key) throw new Error(`キー列「${keyField}」に空欄があります。`);
      if (map.has(key)) throw new Error(`キー「${key}」が重複しています。`);
      map.set(key, row);
    }
    return map;
  };
  const left = toMap(before.rows);
  const right = toMap(after.rows);
  const fields = Array.from(new Set([...before.headers, ...after.headers]));
  return Array.from(new Set([...left.keys(), ...right.keys()])).map((key) => {
    const oldRow = left.get(key);
    const newRow = right.get(key);
    if (!oldRow)
      return { key, status: "added", after: newRow, changedFields: fields };
    if (!newRow)
      return { key, status: "removed", before: oldRow, changedFields: fields };
    const changedFields = fields.filter(
      (name) => (oldRow[name] ?? "") !== (newRow[name] ?? ""),
    );
    return {
      key,
      status: changedFields.length ? "changed" : "unchanged",
      before: oldRow,
      after: newRow,
      changedFields,
    };
  });
}

function csvCell(value: string) {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function serializeDiff(rows: DiffRow[]) {
  const output = [["key", "status", "changed_fields"]];
  for (const row of rows.filter((item) => item.status !== "unchanged")) {
    output.push([row.key, row.status, row.changedFields.join("|")]);
  }
  return output.map((record) => record.map(csvCell).join(",")).join("\r\n");
}
