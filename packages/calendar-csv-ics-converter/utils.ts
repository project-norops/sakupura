export type CsvTable = { headers: string[]; rows: Record<string, string>[] };

export type CalendarMapping = {
  title: string;
  start: string;
  end: string;
  allDay: string;
  location: string;
  description: string;
  timezone: string;
};

export type CalendarEvent = {
  rowNumber: number;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  location: string;
  description: string;
  timezone: string;
  errors: string[];
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
  let row: string[] = [];
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
      row.push(field);
      field = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && source[index + 1] === "\n") index += 1;
      row.push(field);
      if (row.some(Boolean)) records.push(row);
      row = [];
      field = "";
    } else field += char;
  }
  if (quoted) throw new Error("引用符が閉じられていません。");
  row.push(field);
  if (row.some(Boolean)) records.push(row);
  if (records.length < 2)
    throw new Error("見出し行と1行以上の予定が必要です。");
  const headers = records[0].map((value) => value.trim());
  if (headers.some((value) => !value)) throw new Error("空の列名があります。");
  if (new Set(headers).size !== headers.length)
    throw new Error("同じ列名が複数あります。");
  const rows = records.slice(1).map((values, rowIndex) => {
    if (values.length > headers.length)
      throw new Error(
        `${rowIndex + 2}行目の項目数が見出し列数を超えています。`,
      );
    return Object.fromEntries(
      headers.map((header, index) => [header, values[index] ?? ""]),
    );
  });
  return { headers, rows };
}

const aliases: Record<keyof CalendarMapping, string[]> = {
  title: ["件名", "タイトル", "subject", "title"],
  start: ["開始", "開始日時", "start", "start date"],
  end: ["終了", "終了日時", "end", "end date"],
  allDay: ["終日", "all day", "allday"],
  location: ["場所", "location"],
  description: ["説明", "description"],
  timezone: ["タイムゾーン", "timezone", "time zone"],
};

export function suggestMapping(headers: string[]): CalendarMapping {
  const normalize = (value: string) =>
    value.normalize("NFKC").trim().toLowerCase();
  return Object.fromEntries(
    Object.entries(aliases).map(([key, names]) => [
      key,
      headers.find((header) =>
        names.map(normalize).includes(normalize(header)),
      ) ?? "",
    ]),
  ) as CalendarMapping;
}

function parseDate(value: string, allDay: boolean) {
  const trimmed = value.trim();
  const match = allDay
    ? /^(\d{4})-(\d{2})-(\d{2})$/u.exec(trimmed)
    : /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/u.exec(
        trimmed,
      );
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4] ?? 0);
  const minute = Number(match[5] ?? 0);
  const second = Number(match[6] ?? 0);
  const date = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day ||
    hour > 23 ||
    minute > 59 ||
    second > 59
  )
    return null;
  return { year, month, day, hour, minute, second, sort: date.getTime() };
}

export function mapCalendarEvents(
  table: CsvTable,
  mapping: CalendarMapping,
): CalendarEvent[] {
  if (!mapping.title || !mapping.start || !mapping.end)
    throw new Error("件名・開始・終了の列を割り当ててください。");
  return table.rows.map((row, index) => {
    const allDay = mapping.allDay
      ? /^(1|true|yes|はい|終日)$/iu.test(row[mapping.allDay]?.trim() ?? "")
      : false;
    const title = row[mapping.title]?.trim() ?? "";
    const start = row[mapping.start]?.trim() ?? "";
    const end = row[mapping.end]?.trim() ?? "";
    const timezone = mapping.timezone
      ? (row[mapping.timezone]?.trim() ?? "")
      : "";
    const startDate = parseDate(start, allDay);
    const endDate = parseDate(end, allDay);
    const errors: string[] = [];
    if (!title) errors.push("件名が空です");
    if (!startDate)
      errors.push(
        allDay
          ? "開始日はYYYY-MM-DDで入力してください"
          : "開始はYYYY-MM-DD HH:mmで入力してください",
      );
    if (!endDate)
      errors.push(
        allDay
          ? "終了日はYYYY-MM-DDで入力してください"
          : "終了はYYYY-MM-DD HH:mmで入力してください",
      );
    if (startDate && endDate && endDate.sort <= startDate.sort)
      errors.push("終了は開始より後にしてください");
    if (
      timezone &&
      !/^(UTC|[A-Za-z_]+\/[A-Za-z_+-]+(?:\/[A-Za-z_+-]+)?)$/u.test(timezone)
    )
      errors.push("タイムゾーンはAsia/Tokyoなどで入力してください");
    return {
      rowNumber: index + 2,
      title,
      start,
      end,
      allDay,
      timezone,
      location: mapping.location ? (row[mapping.location] ?? "") : "",
      description: mapping.description ? (row[mapping.description] ?? "") : "",
      errors,
    };
  });
}

const pad = (value: number) => String(value).padStart(2, "0");
function icsDate(value: string, allDay: boolean) {
  const parsed = parseDate(value, allDay)!;
  return allDay
    ? `${parsed.year}${pad(parsed.month)}${pad(parsed.day)}`
    : `${parsed.year}${pad(parsed.month)}${pad(parsed.day)}T${pad(parsed.hour)}${pad(parsed.minute)}${pad(parsed.second)}`;
}
const escapeIcs = (value: string) =>
  value
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");

export function createIcs(events: CalendarEvent[], stamp = new Date()) {
  if (events.length === 0 || events.some((event) => event.errors.length))
    throw new Error("エラーのない予定を1件以上用意してください。");
  const dtstamp = stamp
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//NOROPS//Sakupla Calendar CSV Converter//JA",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];
  events.forEach((event, index) => {
    const params = event.allDay
      ? ";VALUE=DATE"
      : event.timezone && event.timezone !== "UTC"
        ? `;TZID=${event.timezone}`
        : "";
    const suffix =
      !event.allDay && (!event.timezone || event.timezone === "UTC") ? "Z" : "";
    lines.push(
      "BEGIN:VEVENT",
      `UID:sakupla-${index + 1}-${dtstamp}@norops.jp`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART${params}:${icsDate(event.start, event.allDay)}${suffix}`,
      `DTEND${params}:${icsDate(event.end, event.allDay)}${suffix}`,
      `SUMMARY:${escapeIcs(event.title)}`,
    );
    if (event.location) lines.push(`LOCATION:${escapeIcs(event.location)}`);
    if (event.description)
      lines.push(`DESCRIPTION:${escapeIcs(event.description)}`);
    lines.push("END:VEVENT");
  });
  lines.push("END:VCALENDAR");
  return `${lines.join("\r\n")}\r\n`;
}
