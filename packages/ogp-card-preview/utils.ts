export type OgpInput = {
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  imageWidth: string;
  imageHeight: string;
  imageAlt: string;
  siteName: string;
};
export type HeadIssue = {
  severity: "error" | "warning" | "info";
  message: string;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
const absoluteHttpUrl = (value: string) => {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};

export function validateOgpInput(input: OgpInput) {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!input.title.trim()) errors.push("タイトルを入力してください。");
  if (!input.description.trim()) errors.push("説明を入力してください。");
  if (!absoluteHttpUrl(input.url))
    errors.push("ページURLはhttp(s)の絶対URLで入力してください。");
  if (!absoluteHttpUrl(input.imageUrl))
    errors.push("画像URLはhttp(s)の絶対URLで入力してください。");
  const width = Number(input.imageWidth);
  const height = Number(input.imageHeight);
  if (
    !Number.isFinite(width) ||
    width <= 0 ||
    !Number.isFinite(height) ||
    height <= 0
  )
    errors.push("画像幅と高さは1以上の数値で入力してください。");
  else if (width < 1200 || height < 630)
    warnings.push(
      "画像が1200×630px未満です。利用先の最新推奨サイズを確認してください。",
    );
  if (!input.imageAlt.trim())
    warnings.push(
      "画像の代替説明（og:image:alt）を入力すると内容を伝えやすくなります。",
    );
  if (input.title.length > 70)
    warnings.push(
      "タイトルが70文字を超えています。表示先で省略される可能性があります。",
    );
  if (input.description.length > 200)
    warnings.push(
      "説明が200文字を超えています。表示先で省略される可能性があります。",
    );
  return { errors, warnings };
}

export function generateMetaTags(input: OgpInput) {
  const rows = [
    ["property", "og:type", "website"],
    ["property", "og:title", input.title],
    ["property", "og:description", input.description],
    ["property", "og:url", input.url],
    ["property", "og:image", input.imageUrl],
    ["property", "og:image:width", input.imageWidth],
    ["property", "og:image:height", input.imageHeight],
    ["property", "og:image:alt", input.imageAlt],
    ["name", "twitter:card", "summary_large_image"],
    ["name", "twitter:title", input.title],
    ["name", "twitter:description", input.description],
    ["name", "twitter:image", input.imageUrl],
    ["name", "twitter:image:alt", input.imageAlt],
  ];
  if (input.siteName.trim())
    rows.splice(5, 0, ["property", "og:site_name", input.siteName]);
  return rows
    .filter(([, , content]) => content.trim())
    .map(
      ([kind, key, content]) =>
        `<meta ${kind}="${escapeHtml(key)}" content="${escapeHtml(content.trim())}" />`,
    )
    .join("\n");
}

export function diagnoseHead(head: string): HeadIssue[] {
  if (!head.trim())
    return [
      {
        severity: "info",
        message: "head断片は未入力です。生成タグだけを利用できます。",
      },
    ];
  const found = new Map<string, string>();
  for (const match of head.matchAll(/<meta\b([^>]*)>/giu)) {
    const attrs = Object.fromEntries(
      [...match[1].matchAll(/([:\w-]+)\s*=\s*(["'])(.*?)\2/gu)].map((attr) => [
        attr[1].toLowerCase(),
        attr[3],
      ]),
    );
    const key = (attrs.property || attrs.name || "").toLowerCase();
    if (key) found.set(key, attrs.content ?? "");
  }
  const issues: HeadIssue[] = [];
  ["og:title", "og:description", "og:url", "og:image"].forEach((key) => {
    if (!found.get(key)?.trim())
      issues.push({
        severity: "error",
        message: `${key}が見つからないか、contentが空です。`,
      });
  });
  ["og:image:width", "og:image:height", "og:image:alt", "twitter:card"].forEach(
    (key) => {
      if (!found.get(key)?.trim())
        issues.push({
          severity: "warning",
          message: `${key}が見つかりません。表示先の要件に合わせて追加を検討してください。`,
        });
    },
  );
  if (issues.length === 0)
    issues.push({
      severity: "info",
      message: "初期チェック対象のOGP・X向けタグが見つかりました。",
    });
  return issues;
}
