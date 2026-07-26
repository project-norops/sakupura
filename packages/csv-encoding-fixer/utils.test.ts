import {
  decodeBytes,
  detectEncoding,
  encodeUtf8,
  encodingWarnings,
} from "./utils";

describe("csv encoding utilities", () => {
  test("detects utf8", () =>
    expect(detectEncoding(new TextEncoder().encode("商品,価格"))).toBe(
      "utf-8",
    ));
  test("decodes utf8 bom", () =>
    expect(decodeBytes(Uint8Array.from([0xef, 0xbb, 0xbf, 65]), "utf-8")).toBe(
      "A",
    ));
  test("adds bom", () =>
    expect(Array.from(encodeUtf8("a,b", true).slice(0, 3))).toEqual([
      0xef, 0xbb, 0xbf,
    ]));
  test("normalizes line endings", () =>
    expect(new TextDecoder().decode(encodeUtf8("a,b\nc,d"))).toContain("\r\n"));
  test("warns about replacement characters", () =>
    expect(encodingWarnings("a,b\n�,1").length).toBeGreaterThan(0));
});
