import {
  createIcs,
  mapCalendarEvents,
  parseCsv,
  suggestMapping,
} from "./utils";

const source = parseCsv(
  "件名,開始,終了,終日,場所,説明,タイムゾーン\n朝会,2026-08-03 09:00,2026-08-03 09:30,いいえ,会議室,共有,Asia/Tokyo",
);

test("parses CSV and suggests Japanese columns", () => {
  expect(source.rows).toHaveLength(1);
  expect(suggestMapping(source.headers)).toMatchObject({
    title: "件名",
    start: "開始",
    end: "終了",
  });
});

test("validates rows and creates RFC 5545 calendar text", () => {
  const events = mapCalendarEvents(source, suggestMapping(source.headers));
  expect(events[0].errors).toEqual([]);
  const ics = createIcs(events, new Date("2026-07-27T00:00:00Z"));
  expect(ics).toContain("BEGIN:VCALENDAR\r\nVERSION:2.0");
  expect(ics).toContain("DTSTART;TZID=Asia/Tokyo:20260803T090000");
  expect(ics).toContain("SUMMARY:朝会");
});

test("reports format and chronological errors", () => {
  const invalid = parseCsv("件名,開始,終了\n,2026/08/03,2026-08-02 10:00");
  const events = mapCalendarEvents(invalid, suggestMapping(invalid.headers));
  expect(events[0].errors).toEqual(
    expect.arrayContaining([
      "件名が空です",
      "開始はYYYY-MM-DD HH:mmで入力してください",
    ]),
  );
  expect(() => createIcs(events)).toThrow("エラーのない予定");
});

test("supports all-day date values", () => {
  const allDay = parseCsv(
    "件名,開始,終了,終日\n休業,2026-08-13,2026-08-16,はい",
  );
  const events = mapCalendarEvents(allDay, suggestMapping(allDay.headers));
  expect(createIcs(events, new Date("2026-07-27T00:00:00Z"))).toContain(
    "DTSTART;VALUE=DATE:20260813",
  );
});
