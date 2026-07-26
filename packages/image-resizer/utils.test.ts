import {
  IMAGE_PRESETS,
  calculateSourceRect,
  outputFilename,
  validateImageFile,
} from "./utils";

describe("image resizer utilities", () => {
  test("center crops a wide image for a square target", () => {
    expect(calculateSourceRect(2000, 1000, 500, 500, "cover")).toEqual({
      sx: 500,
      sy: 0,
      sw: 1000,
      sh: 1000,
      dx: 0,
      dy: 0,
      dw: 500,
      dh: 500,
    });
  });
  test("contains an image without cropping", () => {
    expect(calculateSourceRect(2000, 1000, 500, 500, "contain")).toEqual({
      sx: 0,
      sy: 0,
      sw: 2000,
      sh: 1000,
      dx: 0,
      dy: 125,
      dw: 500,
      dh: 250,
    });
  });
  test("creates a safe output filename", () => {
    expect(outputFilename("商品 写真.JPG", IMAGE_PRESETS[0])).toBe(
      "商品-写真-ogp-1200x630.png",
    );
  });
  test("rejects svg and oversized images", () => {
    expect(validateImageFile({ type: "image/svg+xml", size: 10 })).toContain(
      "SVG",
    );
    expect(
      validateImageFile({ type: "image/png", size: 21 * 1024 * 1024 }),
    ).toContain("20MB");
    expect(validateImageFile({ type: "image/png", size: 10 })).toBeNull();
  });
});
