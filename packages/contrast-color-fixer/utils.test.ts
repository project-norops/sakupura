import {
  compliance,
  contrastRatio,
  nearestPassingColor,
  normalizeHex,
} from "./utils";

describe("contrast utilities", () => {
  test("normalizes three and six digit colors", () => {
    expect(normalizeHex("#ABC")).toBe("#aabbcc");
    expect(normalizeHex("12abef")).toBe("#12abef");
    expect(normalizeHex("red")).toBeNull();
  });
  test("uses WCAG luminance contrast", () => {
    expect(contrastRatio("#000", "#fff")).toBeCloseTo(21, 5);
    expect(compliance(4.5).normalAA).toBe(true);
    expect(compliance(3).uiAA).toBe(true);
  });
  test("finds a nearby passing foreground", () => {
    const suggested = nearestPassingColor("#777777", "#ffffff", 4.5);
    expect(contrastRatio(suggested, "#ffffff")).toBeGreaterThanOrEqual(4.5);
  });
});
