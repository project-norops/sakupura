import {
  calculateBusinessDeadline,
  dayStatus,
  formatJapaneseDate,
} from "./utils";

describe("business day calculator", () => {
  test("skips weekends when calculating forward", () => {
    expect(
      calculateBusinessDeadline("2026-07-27", 5, "forward").resultDate,
    ).toBe("2026-08-03");
  });

  test("skips Japanese holidays and citizen holiday", () => {
    expect(dayStatus("2026-09-22")).toEqual({
      business: false,
      reason: "国民の休日",
    });
    expect(
      calculateBusinessDeadline("2026-09-18", 2, "forward").resultDate,
    ).toBe("2026-09-25");
  });

  test("calculates backward and excludes custom holidays", () => {
    const result = calculateBusinessDeadline("2026-08-03", 2, "backward", {
      customHolidays: ["2026-07-31"],
    });
    expect(result.resultDate).toBe("2026-07-29");
  });

  test("can treat Saturday as a business day", () => {
    expect(
      calculateBusinessDeadline("2026-07-31", 1, "forward", {
        saturdayBusiness: true,
      }).resultDate,
    ).toBe("2026-08-01");
  });

  test("formats a Japanese date with weekday", () => {
    expect(formatJapaneseDate("2026-07-27")).toContain("月曜日");
  });
});
