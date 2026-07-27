import {
  entriesToCsv,
  entriesToIcs,
  moveEntry,
  summarizeEntries,
  type CalendarEntry,
} from "./utils";

const entries: CalendarEntry[] = [
  {
    id: "a",
    date: "2026-08-03",
    platform: "X",
    theme: "商品,紹介",
    purpose: "来店",
    assetStatus: "準備完了",
    cta: "予約",
    memo: "写真",
  },
  {
    id: "b",
    date: "2026-08-05",
    platform: "Instagram",
    theme: "店内",
    purpose: "認知",
    assetStatus: "準備中",
    cta: "",
    memo: "動画",
  },
];

test("creates spreadsheet CSV with headers and escaped values", () => {
  const csv = entriesToCsv(entries);
  expect(csv).toContain('"投稿日","媒体","テーマ"');
  expect(csv).toContain('"商品,紹介"');
});

test("creates all-day ICS events without automatic posting data", () => {
  const ics = entriesToIcs(entries);
  expect(ics).toContain("BEGIN:VCALENDAR");
  expect(ics).toContain("DTSTART;VALUE=DATE:20260803");
  expect(ics).toContain("SUMMARY:[X] 商品\\,紹介");
});

test("moves entries and summarizes incomplete preparation", () => {
  expect(moveEntry(entries, "b", -1)[0].id).toBe("b");
  const summary = summarizeEntries(entries);
  expect(summary.platformCounts).toEqual({ X: 1, Instagram: 1 });
  expect(summary.incompleteCount).toBe(1);
});
