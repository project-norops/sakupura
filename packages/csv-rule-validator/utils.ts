export type CsvTable = {
  headers: string[];
  rows: Record<string, string>[];
};

export type RuleType = "string" | "number" | "date";

export type ColumnRule = {
  type: RuleType;
  required: boolean;
  min: string;
  max: string;
  minLength: string;
  maxLength: string;
  allowedValues: string;
  unique: boolean;
};

export type ValidationError = {
  sourceLine: number;
  column: string;
  rule: string;
  value: string;
  message: string;
};

export type ValidationResult = {
  errors: ValidationError[];
  validRowCount: number;
  invalidRowCount: number;
};

const AUDIT_HEADERS = [
  "サクプラ_元行番号",
  "サクプラ_検証結果",
  "サクプラ_エラー件数",
  "サクプラ_エラー内容",
];

export function createDefaultRule(): ColumnRule {
  return {
    type: "string",
    required: false,
    min: "",
    max: "",
    minLength: "",
    maxLength: "",
    allowedValues: "",
    unique: false,
  };
}

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
  if (headers.some((header) => AUDIT_HEADERS.includes(header))) {
    throw new Error(
      "サクプラの検証結果列と同じ列名があります。該当列の名称を変更してください。",
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

function isNumber(value: string) {
  return /^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/.test(value.trim());
}

function dateNumber(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return year * 10000 + month * 100 + day;
}

export function suggestType(values: string[]): RuleType {
  const nonBlank = values.map((value) => value.trim()).filter(Boolean);
  if (!nonBlank.length) return "string";
  if (nonBlank.every(isNumber)) return "number";
  if (nonBlank.every((value) => dateNumber(value) !== null)) return "date";
  return "string";
}

function numberSetting(value: string) {
  if (!value.trim() || !isNumber(value)) return null;
  return Number(value);
}

function lengthSetting(value: string) {
  if (!/^\d+$/.test(value.trim())) return null;
  return Number(value);
}

export function validateTable(
  table: CsvTable,
  rules: Record<string, ColumnRule>,
): ValidationResult {
  const errors: ValidationError[] = [];
  const addError = (
    rowIndex: number,
    column: string,
    rule: string,
    value: string,
    message: string,
  ) => {
    errors.push({
      sourceLine: rowIndex + 2,
      column,
      rule,
      value,
      message,
    });
  };

  for (const header of table.headers) {
    const rule = rules[header] ?? createDefaultRule();
    const allowed = rule.allowedValues
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    const seen = new Map<string, number[]>();

    table.rows.forEach((row, rowIndex) => {
      const value = row[header] ?? "";
      const trimmed = value.trim();
      if (!trimmed) {
        if (rule.required) {
          addError(rowIndex, header, "必須", value, "値が入力されていません。");
        }
        return;
      }

      if (rule.type === "number") {
        if (!isNumber(value)) {
          addError(
            rowIndex,
            header,
            "数値",
            value,
            "数値として読み取れません。",
          );
        } else {
          const numericValue = Number(trimmed);
          const minimum = numberSetting(rule.min);
          const maximum = numberSetting(rule.max);
          if (minimum !== null && numericValue < minimum) {
            addError(
              rowIndex,
              header,
              "最小値",
              value,
              `${minimum}以上にしてください。`,
            );
          }
          if (maximum !== null && numericValue > maximum) {
            addError(
              rowIndex,
              header,
              "最大値",
              value,
              `${maximum}以下にしてください。`,
            );
          }
        }
      } else if (rule.type === "date") {
        const current = dateNumber(value);
        if (current === null) {
          addError(
            rowIndex,
            header,
            "日付",
            value,
            "YYYY-MM-DD形式の実在する日付ではありません。",
          );
        } else {
          const minimum = dateNumber(rule.min);
          const maximum = dateNumber(rule.max);
          if (minimum !== null && current < minimum) {
            addError(
              rowIndex,
              header,
              "最小日付",
              value,
              `${rule.min}以降にしてください。`,
            );
          }
          if (maximum !== null && current > maximum) {
            addError(
              rowIndex,
              header,
              "最大日付",
              value,
              `${rule.max}以前にしてください。`,
            );
          }
        }
      } else {
        const minimum = lengthSetting(rule.minLength);
        const maximum = lengthSetting(rule.maxLength);
        if (minimum !== null && value.length < minimum) {
          addError(
            rowIndex,
            header,
            "最小文字数",
            value,
            `${minimum}文字以上にしてください。`,
          );
        }
        if (maximum !== null && value.length > maximum) {
          addError(
            rowIndex,
            header,
            "最大文字数",
            value,
            `${maximum}文字以下にしてください。`,
          );
        }
      }

      if (allowed.length && !allowed.includes(value)) {
        addError(
          rowIndex,
          header,
          "許可値",
          value,
          `許可値（${allowed.join("、")}）に含まれていません。`,
        );
      }
      if (rule.unique) {
        seen.set(value, [...(seen.get(value) ?? []), rowIndex]);
      }
    });

    if (rule.unique) {
      for (const [value, rowIndexes] of seen) {
        if (rowIndexes.length < 2) continue;
        for (const rowIndex of rowIndexes) {
          addError(
            rowIndex,
            header,
            "重複禁止",
            value,
            `同じ値が${rowIndexes.length}行あります。`,
          );
        }
      }
    }
  }

  const invalidLines = new Set(errors.map((error) => error.sourceLine));
  return {
    errors,
    validRowCount: table.rows.length - invalidLines.size,
    invalidRowCount: invalidLines.size,
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

export function buildValidationCsv(
  table: CsvTable,
  result: ValidationResult,
): CsvTable {
  return {
    headers: [...table.headers, ...AUDIT_HEADERS],
    rows: table.rows.map((row, rowIndex) => {
      const sourceLine = rowIndex + 2;
      const rowErrors = result.errors.filter(
        (error) => error.sourceLine === sourceLine,
      );
      return {
        ...row,
        サクプラ_元行番号: String(sourceLine),
        サクプラ_検証結果: rowErrors.length ? "エラー" : "OK",
        サクプラ_エラー件数: String(rowErrors.length),
        サクプラ_エラー内容: rowErrors
          .map((error) => `${error.column}：${error.message}`)
          .join(" / "),
      };
    }),
  };
}

export function buildErrorCsv(result: ValidationResult): CsvTable {
  return {
    headers: ["元行番号", "列名", "ルール", "入力値", "指摘内容"],
    rows: result.errors.map((error) => ({
      元行番号: String(error.sourceLine),
      列名: error.column,
      ルール: error.rule,
      入力値: error.value,
      指摘内容: error.message,
    })),
  };
}
