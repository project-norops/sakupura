export type DetectedEncoding = "utf-8" | "shift_jis";

export function detectEncoding(bytes: Uint8Array): DetectedEncoding {
  try {
    new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    return "utf-8";
  } catch {
    return "shift_jis";
  }
}

export function decodeBytes(bytes: Uint8Array, encoding: DetectedEncoding) {
  return new TextDecoder(encoding).decode(bytes).replace(/^\uFEFF/, "");
}

export function encodingWarnings(text: string) {
  const warnings: string[] = [];
  if (text.includes("�"))
    warnings.push(
      "置換文字（�）が含まれています。元データが欠損している可能性があります。",
    );
  if (!/[,\t;]/.test(text.split(/\r?\n/, 1)[0] ?? ""))
    warnings.push("見出し行から区切り文字を判定できませんでした。");
  if (/\r(?!\n)/.test(text))
    warnings.push("古いMac形式の改行コードが含まれています。");
  return warnings;
}

export function encodeUtf8(text: string, bom = false) {
  const body = new TextEncoder().encode(text.replace(/\r?\n/g, "\r\n"));
  if (!bom) return body;
  const result = new Uint8Array(body.length + 3);
  result.set([0xef, 0xbb, 0xbf]);
  result.set(body, 3);
  return result;
}
