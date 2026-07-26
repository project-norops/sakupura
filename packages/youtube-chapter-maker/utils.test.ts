import {
  buildChapterText,
  buildChapterUrl,
  formatChapterTime,
  parseChapterTime,
  validateChapters,
} from "./utils";

const valid = [
  { id: "a", time: "0:00", title: "はじめに" },
  { id: "b", time: "0:15", title: "手順" },
  { id: "c", time: "1:20", title: "まとめ" },
];

describe("YouTube chapter utilities", () => {
  test("parses and formats chapter times", () => {
    expect(parseChapterTime("1:02:03")).toBe(3723);
    expect(formatChapterTime(3723)).toBe("1:02:03");
    expect(parseChapterTime("0:70")).toBeNull();
  });

  test("accepts official minimum conditions", () => {
    expect(validateChapters(valid)).toEqual([]);
  });

  test("requires 0:00, three chapters and ten-second intervals", () => {
    const issues = validateChapters([
      { id: "a", time: "0:01", title: "a" },
      { id: "b", time: "0:05", title: "b" },
    ]);
    expect(issues.map((issue) => issue.message).join(" ")).toMatch(/3件以上/);
    expect(issues.map((issue) => issue.message).join(" ")).toMatch(/0:00/);
    expect(issues.map((issue) => issue.message).join(" ")).toMatch(/10秒以上/);
  });

  test("builds paste-ready text and timestamp URL", () => {
    expect(buildChapterText(valid)).toContain("0:15 手順");
    expect(buildChapterUrl("https://youtu.be/example", 80)).toContain("t=80s");
  });
});
