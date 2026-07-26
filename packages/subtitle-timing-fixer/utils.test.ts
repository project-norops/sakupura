import {
  formatSubtitle,
  formatTimecode,
  parseSubtitle,
  parseTimecode,
  shiftCues,
  updateCueTiming,
} from "./utils";

describe("subtitle utilities", () => {
  test("parses SRT cues and reports overlap", () => {
    const result = parseSubtitle(
      "1\n00:00:01,000 --> 00:00:03,000\n最初\n\n2\n00:00:02,500 --> 00:00:04,000\n次",
    );
    expect(result.format).toBe("srt");
    expect(result.cues).toHaveLength(2);
    expect(
      result.issues.some((issue) => issue.message.includes("重なって")),
    ).toBe(true);
  });

  test("parses WebVTT and ignores cue settings", () => {
    const result = parseSubtitle(
      "WEBVTT\n\n00:00:01.000 --> 00:00:02.000 align:start\nこんにちは",
    );
    expect(result.format).toBe("vtt");
    expect(result.cues[0].text).toBe("こんにちは");
  });

  test("rejects invalid time order", () => {
    const result = parseSubtitle("1\n00:00:03,000 --> 00:00:02,000\n逆転");
    expect(result.issues.some((issue) => issue.level === "error")).toBe(true);
  });

  test("shifts all cues equally and prevents negative time", () => {
    const result = shiftCues(
      [{ index: 1, startMs: 500, endMs: 1500, text: "a" }],
      -1000,
    );
    expect(result.appliedMs).toBe(-500);
    expect(result.cues[0]).toMatchObject({ startMs: 0, endMs: 1000 });
  });

  test("formats SRT and VTT separators", () => {
    expect(formatTimecode(3723004, "srt")).toBe("01:02:03,004");
    expect(formatTimecode(3723004, "vtt")).toBe("01:02:03.004");
    expect(
      formatSubtitle(
        [{ index: 9, startMs: 0, endMs: 1000, text: "字幕" }],
        "srt",
      ),
    ).toContain("1\n00:00:00,000");
  });

  test("accepts minute-based WebVTT timecodes", () => {
    expect(parseTimecode("02:03.250")).toBe(123250);
  });

  test("updates one cue without changing the others", () => {
    const cues = [
      { index: 1, startMs: 1000, endMs: 2000, text: "one" },
      { index: 2, startMs: 3000, endMs: 4000, text: "two" },
    ];
    const updated = updateCueTiming(cues, 1, 3250, 4750);
    expect(updated[0]).toEqual(cues[0]);
    expect(updated[1]).toMatchObject({ startMs: 3250, endMs: 4750 });
    expect(cues[1]).toMatchObject({ startMs: 3000, endMs: 4000 });
  });

  test("rejects a negative individual time", () => {
    const cues = [{ index: 1, startMs: 1000, endMs: 2000, text: "one" }];
    expect(updateCueTiming(cues, 0, -1, 1000)).toBe(cues);
  });
});
