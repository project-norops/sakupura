export type RedirectRow = { oldUrl: string; newUrl: string; row: number };
export type RedirectIssue = {
  row: number | null;
  severity: "error" | "warning";
  message: string;
};

function parseLine(line: string) {
  const values: string[] = [];
  let value = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        value += '"';
        i += 1;
      } else quoted = !quoted;
    } else if (char === "," && !quoted) {
      values.push(value.trim());
      value = "";
    } else value += char;
  }
  values.push(value.trim());
  return values;
}

export function parseRedirectMap(text: string): RedirectRow[] {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim());
  if (lines.length < 2)
    throw new Error("見出し行と1行以上の対応データが必要です。");
  const headers = parseLine(lines[0]).map((value) => value.toLowerCase());
  const oldIndex = headers.findIndex((value) =>
    ["old_url", "old", "source", "旧url"].includes(value),
  );
  const newIndex = headers.findIndex((value) =>
    ["new_url", "new", "destination", "新url"].includes(value),
  );
  if (oldIndex < 0 || newIndex < 0)
    throw new Error("old_url と new_url の列が必要です。");
  return lines.slice(1).map((line, index) => {
    const values = parseLine(line);
    return {
      oldUrl: values[oldIndex] ?? "",
      newUrl: values[newIndex] ?? "",
      row: index + 2,
    };
  });
}

export function diagnoseRedirectMap(rows: RedirectRow[]) {
  const issues: RedirectIssue[] = [];
  const sources = new Map<string, number>();
  const destinations = new Map<string, number>();
  for (const item of rows) {
    if (!item.oldUrl || !item.newUrl) {
      issues.push({
        row: item.row,
        severity: "error",
        message: "旧URLまたは新URLが空です。",
      });
      continue;
    }
    for (const [label, value] of [
      ["旧URL", item.oldUrl],
      ["新URL", item.newUrl],
    ] as const) {
      try {
        const parsed = new URL(value);
        if (!/^https?:$/.test(parsed.protocol)) throw new Error();
      } catch {
        issues.push({
          row: item.row,
          severity: "error",
          message: `${label}がhttp/httpsの絶対URLではありません。`,
        });
      }
    }
    if (item.oldUrl === item.newUrl)
      issues.push({
        row: item.row,
        severity: "error",
        message: "旧URLと新URLが同じ自己転送です。",
      });
    if (sources.has(item.oldUrl))
      issues.push({
        row: item.row,
        severity: "error",
        message: `旧URLが${sources.get(item.oldUrl)}行目と重複しています。`,
      });
    sources.set(item.oldUrl, item.row);
    destinations.set(item.newUrl, (destinations.get(item.newUrl) ?? 0) + 1);
  }
  for (const item of rows)
    if ((destinations.get(item.newUrl) ?? 0) >= 5)
      issues.push({
        row: item.row,
        severity: "warning",
        message:
          "同じ転送先へ5件以上集中しています。意図した統合か確認してください。",
      });
  const sourceSet = new Set(rows.map((item) => item.oldUrl));
  for (const item of rows)
    if (sourceSet.has(item.newUrl))
      issues.push({
        row: item.row,
        severity: "warning",
        message:
          "新URLが別行の旧URLにも存在します。転送チェーンになる可能性があります。",
      });
  return issues;
}

export function serializeRedirectMap(rows: RedirectRow[]) {
  const quote = (value: string) =>
    /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
  return [
    "old_url,new_url",
    ...rows.map((row) => `${quote(row.oldUrl)},${quote(row.newUrl)}`),
  ].join("\r\n");
}
