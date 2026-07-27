export type HarValue = Record<string, unknown>;

export type FindingRisk = "high" | "medium";

export type HarFinding = {
  id: string;
  entryIndex: number;
  entryLabel: string;
  location: string;
  name: string;
  risk: FindingRisk;
  reason: string;
  maskedPreview: string;
  path: Array<string | number>;
};

export type SanitizeResult = {
  har: HarValue;
  audit: HarFinding[];
  remaining: HarFinding[];
};

const REDACTED = "[REDACTED]";
const HIGH_HEADER_NAMES = new Set([
  "authorization",
  "proxy-authorization",
  "cookie",
  "set-cookie",
  "x-api-key",
  "x-auth-token",
  "x-access-token",
]);
const SENSITIVE_NAME =
  /(?:^|[-_.])(api[-_.]?key|access[-_.]?token|auth(?:orization)?|bearer|client[-_.]?secret|cookie|csrf|jwt|password|passwd|refresh[-_.]?token|secret|session(?:id)?|token)(?:$|[-_.])/i;
const SENSITIVE_VALUE =
  /^(?:Bearer\s+\S+|Basic\s+\S+|eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+|(?:sk|pk|api)[-_][A-Za-z0-9_-]{12,})$/i;

function isRecord(value: unknown): value is HarValue {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mask(value: unknown) {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  if (!text) return "（空欄）";
  if (text === REDACTED) return REDACTED;
  if (text.length <= 4) return "••••";
  return `${text.slice(0, 2)}••••${text.slice(-2)}（${text.length}文字）`;
}

function reasonForName(name: string, location: string) {
  const normalized = name.toLowerCase();
  if (HIGH_HEADER_NAMES.has(normalized)) {
    return `${name}は認証情報やセッション情報を含む可能性が高い項目です。`;
  }
  return `${location}の項目名「${name}」がトークン・秘密情報の候補に一致しました。`;
}

function riskFor(name: string, value: unknown): FindingRisk {
  return HIGH_HEADER_NAMES.has(name.toLowerCase()) ||
    SENSITIVE_VALUE.test(String(value ?? ""))
    ? "high"
    : "medium";
}

function entryLabel(entry: HarValue, index: number) {
  const request = isRecord(entry.request) ? entry.request : {};
  const method =
    typeof request.method === "string" ? request.method : "REQUEST";
  if (typeof request.url !== "string")
    return `${method} リクエスト ${index + 1}`;
  try {
    const url = new URL(request.url);
    return `${method} ${url.host}${url.pathname}`;
  } catch {
    return `${method} リクエスト ${index + 1}`;
  }
}

function addFinding(
  findings: HarFinding[],
  entry: HarValue,
  entryIndex: number,
  location: string,
  name: string,
  value: unknown,
  path: Array<string | number>,
) {
  if (value === REDACTED) return;
  findings.push({
    id: `${entryIndex}:${path.map(String).join(".")}`,
    entryIndex,
    entryLabel: entryLabel(entry, entryIndex),
    location,
    name,
    risk: riskFor(name, value),
    reason: reasonForName(name, location),
    maskedPreview: mask(value),
    path,
  });
}

function scanNameValueArray(
  findings: HarFinding[],
  entry: HarValue,
  entryIndex: number,
  value: unknown,
  path: Array<string | number>,
  location: string,
  includeAll: boolean,
) {
  if (!Array.isArray(value)) return;
  value.forEach((item, index) => {
    if (!isRecord(item) || typeof item.name !== "string") return;
    const itemValue = item.value;
    if (
      includeAll ||
      SENSITIVE_NAME.test(item.name) ||
      SENSITIVE_VALUE.test(String(itemValue ?? ""))
    ) {
      addFinding(findings, entry, entryIndex, location, item.name, itemValue, [
        ...path,
        index,
        "value",
      ]);
    }
  });
}

function scanJsonObject(
  findings: HarFinding[],
  entry: HarValue,
  entryIndex: number,
  value: unknown,
  basePath: Array<string | number>,
  jsonPath = "$",
) {
  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      scanJsonObject(
        findings,
        entry,
        entryIndex,
        item,
        [...basePath, index],
        `${jsonPath}[${index}]`,
      ),
    );
    return;
  }
  if (!isRecord(value)) return;
  for (const [key, child] of Object.entries(value)) {
    const childPath = [...basePath, key];
    if (
      SENSITIVE_NAME.test(key) ||
      (typeof child === "string" && SENSITIVE_VALUE.test(child))
    ) {
      addFinding(
        findings,
        entry,
        entryIndex,
        `本文 ${jsonPath}`,
        key,
        child,
        childPath,
      );
    } else {
      scanJsonObject(
        findings,
        entry,
        entryIndex,
        child,
        childPath,
        `${jsonPath}.${key}`,
      );
    }
  }
}

function scanJsonText(
  findings: HarFinding[],
  entry: HarValue,
  entryIndex: number,
  container: HarValue,
  textPath: Array<string | number>,
) {
  if (typeof container.text !== "string" || !container.text.trim()) return;
  const mimeType =
    typeof container.mimeType === "string" ? container.mimeType : "";
  if (!/json/i.test(mimeType) && !/^[\s]*[{[]/.test(container.text)) return;
  try {
    const parsed = JSON.parse(container.text) as unknown;
    scanJsonObject(findings, entry, entryIndex, parsed, textPath);
  } catch {
    // Invalid or non-JSON bodies are left untouched and explained in the UI.
  }
}

export function parseHar(text: string): HarValue {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text.replace(/^\uFEFF/, ""));
  } catch {
    throw new Error(
      "HARをJSONとして読み込めませんでした。ファイル内容を確認してください。",
    );
  }
  if (
    !isRecord(parsed) ||
    !isRecord(parsed.log) ||
    !Array.isArray(parsed.log.entries)
  ) {
    throw new Error(
      "log.entriesを含むHAR 1.2形式のファイルを選択してください。",
    );
  }
  return parsed;
}

export function scanHar(har: HarValue): HarFinding[] {
  const log = isRecord(har.log) ? har.log : {};
  const entries = Array.isArray(log.entries) ? log.entries : [];
  const findings: HarFinding[] = [];

  entries.forEach((rawEntry, entryIndex) => {
    if (!isRecord(rawEntry)) return;
    const request = isRecord(rawEntry.request) ? rawEntry.request : {};
    const response = isRecord(rawEntry.response) ? rawEntry.response : {};

    scanNameValueArray(
      findings,
      rawEntry,
      entryIndex,
      request.headers,
      ["log", "entries", entryIndex, "request", "headers"],
      "リクエストヘッダー",
      false,
    );
    scanNameValueArray(
      findings,
      rawEntry,
      entryIndex,
      response.headers,
      ["log", "entries", entryIndex, "response", "headers"],
      "レスポンスヘッダー",
      false,
    );
    scanNameValueArray(
      findings,
      rawEntry,
      entryIndex,
      request.cookies,
      ["log", "entries", entryIndex, "request", "cookies"],
      "リクエストCookie",
      true,
    );
    scanNameValueArray(
      findings,
      rawEntry,
      entryIndex,
      response.cookies,
      ["log", "entries", entryIndex, "response", "cookies"],
      "レスポンスCookie",
      true,
    );
    scanNameValueArray(
      findings,
      rawEntry,
      entryIndex,
      request.queryString,
      ["log", "entries", entryIndex, "request", "queryString"],
      "クエリ",
      false,
    );

    const postData = isRecord(request.postData) ? request.postData : null;
    if (postData) {
      scanNameValueArray(
        findings,
        rawEntry,
        entryIndex,
        postData.params,
        ["log", "entries", entryIndex, "request", "postData", "params"],
        "送信本文",
        false,
      );
      scanJsonText(findings, rawEntry, entryIndex, postData, [
        "log",
        "entries",
        entryIndex,
        "request",
        "postData",
        "text",
        "$json",
      ]);
    }
    const content = isRecord(response.content) ? response.content : null;
    if (content) {
      scanJsonText(findings, rawEntry, entryIndex, content, [
        "log",
        "entries",
        entryIndex,
        "response",
        "content",
        "text",
        "$json",
      ]);
    }
  });
  return findings;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function setPath(root: HarValue, path: Array<string | number>, value: unknown) {
  const jsonMarker = path.indexOf("$json");
  if (jsonMarker >= 0) {
    const textPath = path.slice(0, jsonMarker);
    let textParent: unknown = root;
    for (let index = 0; index < textPath.length - 1; index += 1) {
      textParent = (textParent as Record<string | number, unknown>)[
        textPath[index]
      ];
    }
    const textKey = textPath[textPath.length - 1];
    const currentText = (textParent as Record<string | number, unknown>)[
      textKey
    ];
    if (typeof currentText !== "string") return;
    const parsed = JSON.parse(currentText) as unknown;
    let jsonParent = parsed as Record<string | number, unknown>;
    const jsonPath = path.slice(jsonMarker + 1);
    for (let index = 0; index < jsonPath.length - 1; index += 1) {
      jsonParent = jsonParent[jsonPath[index]] as Record<
        string | number,
        unknown
      >;
    }
    jsonParent[jsonPath[jsonPath.length - 1]] = value;
    (textParent as Record<string | number, unknown>)[textKey] =
      JSON.stringify(parsed);
    return;
  }

  let parent: Record<string | number, unknown> = root;
  for (let index = 0; index < path.length - 1; index += 1) {
    parent = parent[path[index]] as Record<string | number, unknown>;
  }
  parent[path[path.length - 1]] = value;
}

function syncRequestUrls(har: HarValue, audit: HarFinding[]) {
  const redactedQueries = new Map<number, Set<string>>();
  for (const finding of audit) {
    if (finding.location !== "クエリ") continue;
    const names = redactedQueries.get(finding.entryIndex) ?? new Set<string>();
    names.add(finding.name);
    redactedQueries.set(finding.entryIndex, names);
  }
  const entries = (har.log as HarValue).entries as unknown[];
  for (const [entryIndex, names] of redactedQueries) {
    const entry = entries[entryIndex];
    if (
      !isRecord(entry) ||
      !isRecord(entry.request) ||
      typeof entry.request.url !== "string"
    )
      continue;
    try {
      const url = new URL(entry.request.url);
      for (const name of names) {
        if (url.searchParams.has(name)) url.searchParams.set(name, REDACTED);
      }
      entry.request.url = url.toString();
    } catch {
      // Keep an invalid URL unchanged; the queryString item itself is still redacted.
    }
  }
}

export function sanitizeHar(
  har: HarValue,
  selectedIds: ReadonlySet<string>,
): SanitizeResult {
  const findings = scanHar(har);
  const audit = findings.filter((finding) => selectedIds.has(finding.id));
  const sanitized = clone(har);
  for (const finding of audit) setPath(sanitized, finding.path, REDACTED);
  syncRequestUrls(sanitized, audit);
  return { har: sanitized, audit, remaining: scanHar(sanitized) };
}

export function serializeHar(har: HarValue) {
  return `${JSON.stringify(har, null, 2)}\n`;
}

export function entryCount(har: HarValue) {
  const log = isRecord(har.log) ? har.log : {};
  return Array.isArray(log.entries) ? log.entries.length : 0;
}
