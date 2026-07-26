export type PreviewDevice = "mobile" | "desktop";

export function graphemeCount(value: string) {
  return Array.from(
    new Intl.Segmenter("ja", { granularity: "grapheme" }).segment(value),
  ).length;
}

export function previewLimit(device: PreviewDevice) {
  return device === "mobile" ? 24 : 38;
}

export function truncatePreview(value: string, limit: number) {
  const parts = Array.from(
    new Intl.Segmenter("ja", { granularity: "grapheme" }).segment(value),
    (item) => item.segment,
  );
  return parts.length > limit ? `${parts.slice(0, limit).join("")}…` : value;
}

export function subjectWarnings(subject: string, preheader: string) {
  const warnings: string[] = [];
  const length = graphemeCount(subject);
  if (!subject.trim()) warnings.push("件名を入力してください。");
  if (length > 40)
    warnings.push(
      "件名が長いため、多くの受信箱で後半が省略される可能性があります。",
    );
  if (!preheader.trim())
    warnings.push(
      "プリヘッダーが空欄です。メール本文の先頭が自動表示される場合があります。",
    );
  if (subject.trim() && preheader.includes(subject.trim()))
    warnings.push("件名とプリヘッダーが重複しています。");
  if ((subject.match(/[!！?？]/g) ?? []).length >= 3)
    warnings.push("感嘆符や疑問符が多く、強すぎる印象になる可能性があります。");
  return warnings;
}
