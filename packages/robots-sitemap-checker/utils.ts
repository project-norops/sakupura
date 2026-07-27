export type CheckIssue = {
  severity: "error" | "warning" | "info";
  source: "robots.txt" | "sitemap.xml" | "照合";
  line: number;
  message: string;
};
export type CheckResult = {
  issues: CheckIssue[];
  urlCount: number;
  sitemapHosts: string[];
  disallowCount: number;
};

const lineAt = (text: string, index: number) =>
  text.slice(0, index).split(/\r?\n/u).length;
const add = (issues: CheckIssue[], issue: CheckIssue) => issues.push(issue);

export function checkRobotsAndSitemap(
  robots: string,
  sitemap: string,
  expectedSite = "",
): CheckResult {
  const issues: CheckIssue[] = [];
  const disallows: { path: string; line: number }[] = [];
  const sitemapDirectives: { url: string; line: number }[] = [];
  let hasUserAgent = false;
  robots.split(/\r?\n/u).forEach((raw, index) => {
    const line = raw.replace(/#.*$/u, "").trim();
    if (!line) return;
    const separator = line.indexOf(":");
    if (separator < 1) {
      add(issues, {
        severity: "error",
        source: "robots.txt",
        line: index + 1,
        message: "ディレクティブ名と値をコロンで区切ってください。",
      });
      return;
    }
    const name = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();
    if (name === "user-agent") {
      hasUserAgent = Boolean(value);
      if (!value)
        add(issues, {
          severity: "error",
          source: "robots.txt",
          line: index + 1,
          message: "User-agentの値が空です。",
        });
    } else if (name === "allow" || name === "disallow") {
      if (!hasUserAgent)
        add(issues, {
          severity: "warning",
          source: "robots.txt",
          line: index + 1,
          message: `${name}がUser-agentより前にあります。`,
        });
      if (name === "disallow" && value)
        disallows.push({ path: value, line: index + 1 });
    } else if (name === "sitemap") {
      sitemapDirectives.push({ url: value, line: index + 1 });
      if (!absoluteUrl(value))
        add(issues, {
          severity: "error",
          source: "robots.txt",
          line: index + 1,
          message: "Sitemapにはhttp(s)の絶対URLを指定してください。",
        });
    } else if (!["crawl-delay", "host"].includes(name))
      add(issues, {
        severity: "warning",
        source: "robots.txt",
        line: index + 1,
        message: `未確認のディレクティブ「${name}」です。対象クローラーの仕様を確認してください。`,
      });
  });
  if (robots.trim() && !hasUserAgent)
    add(issues, {
      severity: "error",
      source: "robots.txt",
      line: 1,
      message: "User-agentが見つかりません。",
    });

  if (!/<(?:urlset|sitemapindex)(?:\s|>)/iu.test(sitemap))
    add(issues, {
      severity: "error",
      source: "sitemap.xml",
      line: 1,
      message: "urlsetまたはsitemapindexのルート要素が見つかりません。",
    });
  const locs: { url: string; line: number }[] = [];
  for (const match of sitemap.matchAll(/<loc\b[^>]*>([\s\S]*?)<\/loc>/giu)) {
    const value = match[1].trim().replace(/&amp;/gu, "&");
    const line = lineAt(sitemap, match.index ?? 0);
    locs.push({ url: value, line });
    if (!absoluteUrl(value))
      add(issues, {
        severity: "error",
        source: "sitemap.xml",
        line,
        message: "locはhttp(s)の絶対URLで入力してください。",
      });
  }
  if (locs.length === 0)
    add(issues, {
      severity: "error",
      source: "sitemap.xml",
      line: 1,
      message: "loc要素が見つかりません。",
    });
  if (locs.length > 50000)
    add(issues, {
      severity: "error",
      source: "sitemap.xml",
      line: 1,
      message: "1ファイルのURL数が50,000件を超えています。",
    });
  const firstLines = new Map<string, number>();
  locs.forEach(({ url, line }) => {
    if (firstLines.has(url))
      add(issues, {
        severity: "warning",
        source: "sitemap.xml",
        line,
        message: `URLが重複しています（最初は${firstLines.get(url)}行目）。`,
      });
    else firstLines.set(url, line);
  });

  let expectedHost = "";
  if (expectedSite.trim()) {
    try {
      expectedHost = new URL(expectedSite).host;
    } catch {
      add(issues, {
        severity: "error",
        source: "照合",
        line: 1,
        message: "想定サイトURLをhttp(s)の絶対URLで入力してください。",
      });
    }
  }
  if (!expectedHost)
    expectedHost = hostOf(locs.find(({ url }) => absoluteUrl(url))?.url ?? "");
  [
    ...locs.map((item) => ({ ...item, source: "sitemap.xml" as const })),
    ...sitemapDirectives.map((item) => ({
      ...item,
      source: "robots.txt" as const,
    })),
  ].forEach(({ url, line, source }) => {
    const host = hostOf(url);
    if (expectedHost && host && host !== expectedHost)
      add(issues, {
        severity: "warning",
        source,
        line,
        message: `想定ホスト「${expectedHost}」と異なるURLです。`,
      });
  });
  const urlEntries = locs.filter(({ url }) => absoluteUrl(url));
  disallows.forEach(({ path, line: robotsLine }) => {
    const prefix = path.split(/[\*$]/u)[0];
    if (!prefix || prefix === "/") return;
    urlEntries.forEach(({ url, line }) => {
      if (new URL(url).pathname.startsWith(prefix))
        add(issues, {
          severity: "warning",
          source: "照合",
          line,
          message: `sitemapのURLがrobots.txt ${robotsLine}行目のDisallow「${path}」に該当する候補です。`,
        });
    });
  });
  if (issues.length === 0)
    add(issues, {
      severity: "info",
      source: "照合",
      line: 1,
      message: "初期チェック範囲では指摘が見つかりませんでした。",
    });
  return {
    issues,
    urlCount: locs.length,
    sitemapHosts: [
      ...new Set(locs.map(({ url }) => hostOf(url)).filter(Boolean)),
    ],
    disallowCount: disallows.length,
  };
}

const absoluteUrl = (value: string) => {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};
const hostOf = (value: string) => {
  try {
    return new URL(value).host;
  } catch {
    return "";
  }
};

export function formatReport(result: CheckResult) {
  return [
    `診断URL数: ${result.urlCount}`,
    `Disallow: ${result.disallowCount}`,
    ...result.issues.map(
      (issue) =>
        `[${issue.severity}] ${issue.source} ${issue.line}行目: ${issue.message}`,
    ),
  ].join("\n");
}
