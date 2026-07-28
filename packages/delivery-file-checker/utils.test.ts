import {
  evaluateDeliveryFiles,
  normalizeExtensions,
  normalizeRequiredFiles,
  resultToCsv,
  resultToText,
} from "./utils";

const requirements = {
  allowedExtensions: ["png", "jpg", "pdf"],
  requiredFiles: ["autumn_main.png", "autumn_readme.pdf"],
  namePrefix: "autumn_",
  requireLowercase: true,
  disallowSpaces: true,
  minWidth: 1200,
  minHeight: 630,
};

test("normalizes extensions and required file lines", () => {
  expect(normalizeExtensions(".PNG, jpg　PDF png")).toEqual([
    "png",
    "jpg",
    "pdf",
  ]);
  expect(normalizeRequiredFiles("main.png\n\nreadme.pdf\nmain.png")).toEqual([
    "main.png",
    "readme.pdf",
  ]);
});

test("finds missing, extension, naming, dimension, and duplicate issues", () => {
  const result = evaluateDeliveryFiles(
    [
      { name: "autumn_main.png", size: 1, width: 1200, height: 630 },
      { name: "Preview Final.JPG", size: 1, width: 800, height: 500 },
      { name: "source.psd", size: 1 },
      { name: "AUTUMN_MAIN.PNG", size: 1, width: 1200, height: 630 },
    ],
    requirements,
  );

  expect(result.errorCount).toBeGreaterThanOrEqual(6);
  expect(result.warningCount).toBeGreaterThanOrEqual(2);
  expect(result.issues.map((issue) => issue.check)).toEqual(
    expect.arrayContaining([
      "必要ファイル",
      "拡張子",
      "ファイル名",
      "画像寸法",
      "重複名",
    ]),
  );
});

test("returns a clean result for files that meet the configured rules", () => {
  const result = evaluateDeliveryFiles(
    [
      { name: "autumn_main.png", size: 1, width: 1600, height: 900 },
      { name: "autumn_readme.pdf", size: 1 },
    ],
    requirements,
  );
  expect(result.issues).toEqual([]);
  expect(result.passedCount).toBe(2);
  expect(resultToText(result)).toContain("指摘はありません");
  expect(resultToCsv(result)).toContain("問題なし");
});

test("reports an unreadable image dimension without guessing", () => {
  const result = evaluateDeliveryFiles(
    [
      { name: "autumn_main.png", size: 1, imageReadError: true },
      { name: "autumn_readme.pdf", size: 1 },
    ],
    requirements,
  );
  expect(result.warningCount).toBe(1);
  expect(result.issues[0]).toMatchObject({
    check: "画像寸法",
    severity: "warning",
  });
});
