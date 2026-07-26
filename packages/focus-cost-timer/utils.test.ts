import { calculateCost, formatDuration, sessionCsv } from "./utils";

describe("focus cost timer utilities", () => {
  test("calculates cost from milliseconds", () => {
    expect(calculateCost(90 * 60 * 1000, 4000)).toBe(6000);
  });
  test("formats duration without timezone effects", () => {
    expect(formatDuration(3_661_000)).toBe("01:01:01");
  });
  test("escapes task names in csv", () => {
    expect(
      sessionCsv([
        {
          id: "1",
          task: '確認,"修正"',
          elapsedMs: 1000,
          hourlyRate: 3000,
          finishedAt: "2026-07-26",
        },
      ]),
    ).toContain('"確認,""修正"""');
  });
});
