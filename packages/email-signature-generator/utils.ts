export type SignatureTemplate = "minimal" | "accent";

export interface SignatureData {
  name: string;
  role: string;
  company: string;
  department: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  template: SignatureTemplate;
  accentColor: string;
}

export const EMPTY_SIGNATURE: SignatureData = {
  name: "",
  role: "",
  company: "",
  department: "",
  email: "",
  phone: "",
  website: "",
  address: "",
  template: "accent",
  accentColor: "#2563eb",
};

export const SAMPLE_SIGNATURE: SignatureData = {
  name: "山田 太郎",
  role: "代表",
  company: "サクプラデザイン",
  department: "クリエイティブ事業部",
  email: "taro@example.com",
  phone: "03-1234-5678",
  website: "https://example.com",
  address: "東京都千代田区1-2-3",
  template: "accent",
  accentColor: "#2563eb",
};

const DEFAULT_ACCENT_COLOR = "#2563eb";

export function normalizeAccentColor(value: string): string {
  return /^#[0-9a-f]{6}$/i.test(value)
    ? value.toLowerCase()
    : DEFAULT_ACCENT_COLOR;
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function normalizeWebsite(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const candidate = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

function emailHref(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed || !trimmed.includes("@") || /[\s<>]/.test(trimmed)) return null;
  return `mailto:${trimmed}`;
}

function phoneHref(value: string): string | null {
  const cleaned = value.replace(/[^\d+]/g, "");
  return cleaned ? `tel:${cleaned}` : null;
}

function contactLine(
  label: string,
  value: string,
  href: string | null,
): string {
  if (!value.trim()) return "";
  const escapedValue = escapeHtml(value.trim());
  const content = href
    ? `<a href="${escapeHtml(href)}" style="color:#334155;text-decoration:none;">${escapedValue}</a>`
    : escapedValue;
  return `<div style="margin:2px 0;color:#475569;font-size:13px;line-height:1.55;"><span style="display:inline-block;min-width:42px;color:#94a3b8;">${label}</span>${content}</div>`;
}

export function generateSignatureHtml(data: SignatureData): string {
  const color = normalizeAccentColor(data.accentColor);
  const website = normalizeWebsite(data.website);
  const companyLine = [data.department.trim(), data.company.trim()]
    .filter(Boolean)
    .join(" / ");
  const roleLine = data.role.trim();
  const details = [
    contactLine("メール", data.email, emailHref(data.email)),
    contactLine("電話", data.phone, phoneHref(data.phone)),
    contactLine("Web", data.website, website),
    contactLine("住所", data.address, null),
  ].join("");
  const border =
    data.template === "accent"
      ? `border-left:4px solid ${color};padding-left:16px;`
      : "";

  return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',Arial,'Noto Sans JP',sans-serif;color:#0f172a;${border}">
  <div style="font-size:18px;font-weight:700;line-height:1.4;">${escapeHtml(data.name.trim())}</div>
  ${roleLine ? `<div style="margin-top:2px;color:#475569;font-size:13px;line-height:1.5;">${escapeHtml(roleLine)}</div>` : ""}
  ${companyLine ? `<div style="color:#334155;font-size:13px;font-weight:600;line-height:1.5;">${escapeHtml(companyLine)}</div>` : ""}
  ${details ? `<div style="margin-top:10px;">${details}</div>` : ""}
</div>`;
}

export function generatePlainText(data: SignatureData): string {
  const lines = [
    data.name.trim(),
    [data.role.trim(), data.department.trim(), data.company.trim()]
      .filter(Boolean)
      .join(" / "),
    data.email.trim() ? `メール: ${data.email.trim()}` : "",
    data.phone.trim() ? `電話: ${data.phone.trim()}` : "",
    data.website.trim() ? `Web: ${data.website.trim()}` : "",
    data.address.trim() ? `住所: ${data.address.trim()}` : "",
  ];
  return lines.filter(Boolean).join("\n");
}

export function hasSignatureContent(data: SignatureData): boolean {
  return Boolean(data.name.trim());
}
