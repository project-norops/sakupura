export type Rgb = { r: number; g: number; b: number };

export function normalizeHex(value: string): string | null {
  const raw = value.trim().replace(/^#/, "");
  if (/^[0-9a-f]{3}$/i.test(raw))
    return `#${raw
      .split("")
      .map((char) => char + char)
      .join("")
      .toLowerCase()}`;
  if (/^[0-9a-f]{6}$/i.test(raw)) return `#${raw.toLowerCase()}`;
  return null;
}

export function hexToRgb(value: string): Rgb {
  const hex = normalizeHex(value);
  if (!hex) throw new Error("6桁のカラーコードを入力してください。");
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}

export function rgbToHex({ r, g, b }: Rgb): string {
  return `#${[r, g, b]
    .map((value) =>
      Math.max(0, Math.min(255, Math.round(value)))
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

function channel(value: number): number {
  const normalized = value / 255;
  return normalized <= 0.04045
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(value: string): number {
  const { r, g, b } = hexToRgb(value);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(first: string, second: string): number {
  const [lighter, darker] = [
    relativeLuminance(first),
    relativeLuminance(second),
  ].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

function mix(from: Rgb, to: Rgb, amount: number): Rgb {
  return {
    r: from.r + (to.r - from.r) * amount,
    g: from.g + (to.g - from.g) * amount,
    b: from.b + (to.b - from.b) * amount,
  };
}

export function nearestPassingColor(
  foreground: string,
  background: string,
  target = 4.5,
): string {
  if (contrastRatio(foreground, background) >= target)
    return normalizeHex(foreground)!;
  const source = hexToRgb(foreground);
  const endpoints: Rgb[] = [
    { r: 0, g: 0, b: 0 },
    { r: 255, g: 255, b: 255 },
  ];
  const candidates = endpoints
    .map((endpoint) => {
      if (contrastRatio(rgbToHex(endpoint), background) < target) return null;
      let low = 0;
      let high = 1;
      for (let i = 0; i < 24; i += 1) {
        const mid = (low + high) / 2;
        if (
          contrastRatio(rgbToHex(mix(source, endpoint, mid)), background) >=
          target
        )
          high = mid;
        else low = mid;
      }
      return { amount: high, color: rgbToHex(mix(source, endpoint, high)) };
    })
    .filter(
      (candidate): candidate is { amount: number; color: string } =>
        candidate !== null,
    );
  return (
    candidates.sort((a, b) => a.amount - b.amount)[0]?.color ??
    normalizeHex(foreground)!
  );
}

export function compliance(ratio: number) {
  return {
    normalAA: ratio >= 4.5,
    largeAA: ratio >= 3,
    uiAA: ratio >= 3,
    normalAAA: ratio >= 7,
    largeAAA: ratio >= 4.5,
  };
}
