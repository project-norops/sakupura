export type UtmInput = {
  url: string;
  source: string;
  medium: string;
  campaign: string;
  term?: string;
  content?: string;
};

export function normalizeUtmValue(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFKC")
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9._~-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-_]+|[-_]+$/g, "");
}

export function validateDestination(value: string): string | null {
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol))
      return "http://またはhttps://のURLを入力してください。";
    return null;
  } catch {
    return "有効なWebページURLを入力してください。";
  }
}

export function buildUtmUrl(input: UtmInput, normalize = true): string {
  const destinationError = validateDestination(input.url);
  if (destinationError) throw new Error(destinationError);
  if (!input.source.trim() || !input.medium.trim() || !input.campaign.trim())
    throw new Error("流入元・配信手段・キャンペーン名は必須です。");
  if (
    normalize &&
    [input.source, input.medium, input.campaign].some(
      (value) => !normalizeUtmValue(value),
    )
  )
    throw new Error("必須項目には半角英数字を含む名前を入力してください。");
  const url = new URL(input.url);
  const values: Record<string, string | undefined> = {
    utm_source: input.source,
    utm_medium: input.medium,
    utm_campaign: input.campaign,
    utm_term: input.term,
    utm_content: input.content,
  };
  for (const [key, raw] of Object.entries(values)) {
    if (!raw?.trim()) {
      url.searchParams.delete(key);
      continue;
    }
    url.searchParams.set(key, normalize ? normalizeUtmValue(raw) : raw.trim());
  }
  return url.toString();
}

export function utmWarnings(input: UtmInput): string[] {
  const warnings: string[] = [];
  for (const [label, value] of [
    ["流入元", input.source],
    ["配信手段", input.medium],
    ["キャンペーン名", input.campaign],
  ] as const) {
    if (/[A-ZＡ-Ｚ]/.test(value))
      warnings.push(
        `${label}に大文字があります。GA4では別の値として集計されるため小文字化を推奨します。`,
      );
    if (/\s/.test(value))
      warnings.push(
        `${label}に空白があります。命名揺れを防ぐため「_」へ変換します。`,
      );
    if (!normalizeUtmValue(value) && value.trim())
      warnings.push(`${label}は半角英数字を含む名前にしてください。`);
  }
  if (input.url.includes("utm_"))
    warnings.push(
      "入力URLに既存のUTMパラメータがあります。今回の値で上書きします。",
    );
  return warnings;
}
