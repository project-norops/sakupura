export type Direction = "forward" | "backward";

export type DayTrace = {
  date: string;
  business: boolean;
  counted: number;
  reason: string;
};

export type BusinessDayOptions = {
  saturdayBusiness?: boolean;
  sundayBusiness?: boolean;
  customHolidays?: string[];
};

export const HOLIDAY_DATA_RANGE = "2025年〜2027年";

export const JAPANESE_HOLIDAYS: Record<string, string> = {
  "2025-01-01": "元日",
  "2025-01-13": "成人の日",
  "2025-02-11": "建国記念の日",
  "2025-02-23": "天皇誕生日",
  "2025-02-24": "振替休日",
  "2025-03-20": "春分の日",
  "2025-04-29": "昭和の日",
  "2025-05-03": "憲法記念日",
  "2025-05-04": "みどりの日",
  "2025-05-05": "こどもの日",
  "2025-05-06": "振替休日",
  "2025-07-21": "海の日",
  "2025-08-11": "山の日",
  "2025-09-15": "敬老の日",
  "2025-09-23": "秋分の日",
  "2025-10-13": "スポーツの日",
  "2025-11-03": "文化の日",
  "2025-11-23": "勤労感謝の日",
  "2025-11-24": "振替休日",
  "2026-01-01": "元日",
  "2026-01-12": "成人の日",
  "2026-02-11": "建国記念の日",
  "2026-02-23": "天皇誕生日",
  "2026-03-20": "春分の日",
  "2026-04-29": "昭和の日",
  "2026-05-03": "憲法記念日",
  "2026-05-04": "みどりの日",
  "2026-05-05": "こどもの日",
  "2026-05-06": "振替休日",
  "2026-07-20": "海の日",
  "2026-08-11": "山の日",
  "2026-09-21": "敬老の日",
  "2026-09-22": "国民の休日",
  "2026-09-23": "秋分の日",
  "2026-10-12": "スポーツの日",
  "2026-11-03": "文化の日",
  "2026-11-23": "勤労感謝の日",
  "2027-01-01": "元日",
  "2027-01-11": "成人の日",
  "2027-02-11": "建国記念の日",
  "2027-02-23": "天皇誕生日",
  "2027-03-21": "春分の日",
  "2027-03-22": "振替休日",
  "2027-04-29": "昭和の日",
  "2027-05-03": "憲法記念日",
  "2027-05-04": "みどりの日",
  "2027-05-05": "こどもの日",
  "2027-07-19": "海の日",
  "2027-08-11": "山の日",
  "2027-09-20": "敬老の日",
  "2027-09-23": "秋分の日",
  "2027-10-11": "スポーツの日",
  "2027-11-03": "文化の日",
  "2027-11-23": "勤労感謝の日",
};

export function parseIsoDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  )
    return null;
  return date;
}

export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function formatJapaneseDate(value: string): string {
  const date = parseIsoDate(value);
  if (!date) return value;
  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "full",
    timeZone: "UTC",
  }).format(date);
}

export function dayStatus(value: string, options: BusinessDayOptions = {}) {
  const date = parseIsoDate(value);
  if (!date) return { business: false, reason: "日付が不正です" };
  if (options.customHolidays?.includes(value))
    return { business: false, reason: "任意休業日" };
  const holiday = JAPANESE_HOLIDAYS[value];
  if (holiday) return { business: false, reason: holiday };
  const weekday = date.getUTCDay();
  if (weekday === 0 && !options.sundayBusiness)
    return { business: false, reason: "日曜日" };
  if (weekday === 6 && !options.saturdayBusiness)
    return { business: false, reason: "土曜日" };
  return { business: true, reason: "営業日" };
}

export function calculateBusinessDeadline(
  start: string,
  businessDays: number,
  direction: Direction,
  options: BusinessDayOptions = {},
) {
  const startDate = parseIsoDate(start);
  if (!startDate) throw new Error("開始日が不正です。");
  const days = Math.max(0, Math.floor(businessDays));
  if (days > 366) throw new Error("一度に計算できるのは366営業日までです。");
  if (days === 0) return { resultDate: start, trace: [] as DayTrace[] };
  const step = direction === "forward" ? 1 : -1;
  const cursor = new Date(startDate);
  const trace: DayTrace[] = [];
  let counted = 0;
  let guard = 0;
  while (counted < days && guard < 800) {
    cursor.setUTCDate(cursor.getUTCDate() + step);
    const iso = toIsoDate(cursor);
    const status = dayStatus(iso, options);
    if (status.business) counted += 1;
    trace.push({
      date: iso,
      business: status.business,
      counted,
      reason: status.reason,
    });
    guard += 1;
  }
  if (counted < days)
    throw new Error("対応期間内で期限を計算できませんでした。");
  return { resultDate: toIsoDate(cursor), trace };
}
