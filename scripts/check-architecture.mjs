import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const errors = [];
const checks = [];

function relative(targetPath) {
  return path.relative(rootDir, targetPath).replaceAll("\\", "/");
}

function pass(message) {
  checks.push(message);
}

function assert(condition, message) {
  if (condition) pass(message);
  else errors.push(message);
}

function readJson(...segments) {
  return JSON.parse(fs.readFileSync(path.join(rootDir, ...segments), "utf8"));
}

function readText(...segments) {
  return fs.readFileSync(path.join(rootDir, ...segments), "utf8");
}

function directoriesAt(...segments) {
  return fs
    .readdirSync(path.join(rootDir, ...segments), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

function findFiles(startDir, fileName = null, ignored = new Set()) {
  const results = [];
  for (const entry of fs.readdirSync(startDir, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const entryPath = path.join(startDir, entry.name);
    if (entry.isDirectory())
      results.push(...findFiles(entryPath, fileName, ignored));
    else if (fileName === null || entry.name === fileName)
      results.push(entryPath);
  }
  return results;
}

const rootPackage = readJson("package.json");
assert(rootPackage.private === true, "ルートpackageはprivate");
assert(
  rootPackage.workspaces?.includes("apps/*") &&
    rootPackage.workspaces?.includes("packages/*"),
  "npm workspacesはapps/*とpackages/*に限定",
);
assert(
  rootPackage.scripts?.["create:tool"] === "node scripts/create-tool.mjs",
  "標準生成コマンドが存在",
);
assert(
  rootPackage.scripts?.["check:architecture"] ===
    "node scripts/check-architecture.mjs",
  "構成検査コマンドが存在",
);
assert(
  rootPackage.scripts?.["check:content"] === "node scripts/check-content.mjs",
  "コンテンツ品質検査が存在",
);
assert(
  rootPackage.scripts?.["release:post"] ===
    "node scripts/generate-release-post.mjs",
  "X告知文生成コマンドが存在",
);
assert(
  rootPackage.scripts?.["release:due"] ===
    "node scripts/release-schedule.mjs" &&
    rootPackage.scripts?.["release:verify"] ===
      "node scripts/verify-release.mjs",
  "予約公開と本番確認コマンドが存在",
);
assert(
  rootPackage.scripts?.["test"] === "jest" &&
    rootPackage.scripts?.["test:packages"] ===
      "jest packages && npm run test:release" &&
    rootPackage.scripts?.["test:release"] === "node --test scripts/*.test.mjs",
  "アプリと予約公開のテストランナーが統合され、必須化",
);
assert(
  rootPackage.scripts?.["check"] ===
    "npm run check:architecture && npm run check:content && npm run test:packages && npm run lint && npm run build",
  "npm run check にテスト実行が含まれている",
);

const vercel = readJson("vercel.json");
assert(vercel.framework === "nextjs", "Vercel frameworkはNext.js");
assert(
  vercel.buildCommand === "npm run build:portal",
  "Vercelはポータルだけをビルド",
);
assert(
  vercel.outputDirectory === "apps/portal/.next",
  "Vercel出力先はapps/portal/.next",
);
const vercelFiles = findFiles(
  rootDir,
  "vercel.json",
  new Set([".git", ".next", "node_modules"]),
);
assert(
  vercelFiles.length === 1 && relative(vercelFiles[0]) === "vercel.json",
  "vercel.jsonはルートに1つだけ",
);

const allowedApps = new Set(["portal", "001-dynamic-pricing"]);
const unexpectedApps = directoriesAt("apps").filter(
  (name) => !allowedApps.has(name),
);
assert(
  unexpectedApps.length === 0,
  `独立アプリを増やしていない${unexpectedApps.length ? `: ${unexpectedApps.join(", ")}` : ""}`,
);

const manifest = readJson("apps", "portal", "src", "data", "tools.json");
assert(Array.isArray(manifest) && manifest.length > 0, "サービス台帳が存在");
const uniqueIds = new Set();
const uniqueSlugs = new Set();
const registeredPackages = new Set();
const portalPackage = readJson("apps", "portal", "package.json");

for (const tool of manifest) {
  const label = tool.slug || tool.id || "unknown";
  assert(
    /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(tool.slug),
    `${label}: slugはkebab-case`,
  );
  assert(!uniqueIds.has(tool.id), `${label}: idは一意`);
  assert(!uniqueSlugs.has(tool.slug), `${label}: slugは一意`);
  uniqueIds.add(tool.id);
  uniqueSlugs.add(tool.slug);

  const expectedPackageName = `@sakupla/${tool.slug}`;
  const expectedHref = `/tools/${tool.slug}`;
  assert(
    tool.packageName === expectedPackageName,
    `${label}: packageNameが規約どおり`,
  );
  assert(tool.href === expectedHref, `${label}: 公開URLが規約どおり`);
  assert(
    Boolean(
      tool.title &&
      tool.description &&
      tool.badge &&
      tool.componentName &&
      tool.content &&
      tool.releasePost &&
      tool.status &&
      "publishAt" in tool &&
      typeof tool.announceOnX === "boolean" &&
      "announcedAt" in tool,
    ),
    `${label}: 表示情報が揃っている`,
  );
  registeredPackages.add(tool.slug);

  const packagePath = path.join(rootDir, "packages", tool.slug, "package.json");
  const entryPath = path.join(rootDir, "packages", tool.slug, "index.ts");
  const routePath = path.join(
    rootDir,
    "apps",
    "portal",
    "src",
    "app",
    "tools",
    tool.slug,
    "page.tsx",
  );
  assert(fs.existsSync(packagePath), `${label}: package.jsonが存在`);
  assert(fs.existsSync(entryPath), `${label}: package entryが存在`);
  assert(fs.existsSync(routePath), `${label}: ポータルrouteが存在`);

  if (fs.existsSync(packagePath)) {
    assert(
      JSON.parse(fs.readFileSync(packagePath, "utf8")).name ===
        expectedPackageName,
      `${label}: package名が一致`,
    );
  }
  if (fs.existsSync(entryPath)) {
    assert(
      fs.readFileSync(entryPath, "utf8").includes(tool.componentName),
      `${label}: componentをexport`,
    );
  }
  if (fs.existsSync(routePath)) {
    const routeSource = fs.readFileSync(routePath, "utf8");
    assert(
      routeSource.includes(expectedPackageName) &&
        routeSource.includes(tool.componentName),
      `${label}: routeが登録componentを使用`,
    );
    assert(
      routeSource.includes("ToolGuide") && routeSource.includes("tool.content"),
      `${label}: routeが固有ガイドを表示`,
    );
    assert(
      routeSource.includes("ToolStructuredData") &&
        routeSource.includes("canonical") &&
        routeSource.includes("openGraph"),
      `${label}: routeがSEOメタデータと構造化データを表示`,
    );
    assert(
      routeSource.includes("isToolPublished") &&
        routeSource.includes("notFound"),
      `${label}: 未公開routeは404を返す`,
    );
  }
  assert(
    portalPackage.dependencies?.[expectedPackageName] ===
      `file:../../packages/${tool.slug}`,
    `${label}: portal依存が一致`,
  );
}

const unregisteredPackages = directoriesAt("packages").filter(
  (name) => name !== "shared-ui" && !registeredPackages.has(name),
);
assert(
  unregisteredPackages.length === 0,
  `未登録のサービスpackageがない${unregisteredPackages.length ? `: ${unregisteredPackages.join(", ")}` : ""}`,
);

const sitemapSource = readText("apps", "portal", "src", "app", "sitemap.ts");
assert(
  sitemapSource.includes('from "@/data/apps"') &&
    sitemapSource.includes("apps.map"),
  "sitemapは公開済みサービス台帳から生成",
);
const appDataSource = readText("apps", "portal", "src", "data", "apps.ts");
assert(
  appDataSource.includes('tool.status === "published"') &&
    appDataSource.includes("filter(isToolPublished)"),
  "カードとsitemapはpublishedだけを公開",
);
const tailwindSource = readText("apps", "portal", "tailwind.config.ts");
assert(
  tailwindSource.includes('"../../packages/**/*.{js,ts,jsx,tsx}"'),
  "Tailwindは全service packageを走査",
);
const siteSource = readText("apps", "portal", "src", "lib", "site.ts");
assert(
  siteSource.includes('"https://www.norops.jp"'),
  "本番基準URLはhttps://www.norops.jp",
);

for (const requiredPath of [
  ["apps", "portal", "src", "app", "robots.ts"],
  ["apps", "portal", "src", "app", "sitemap.ts"],
  ["apps", "portal", "src", "app", "ads.txt", "route.ts"],
  ["apps", "portal", "src", "app", "privacy", "page.tsx"],
  ["apps", "portal", "src", "app", "disclaimer", "page.tsx"],
  ["packages", "shared-ui", "GoogleServices.ts"],
  ["packages", "shared-ui", "AnalyticsEvents.tsx"],
  ["packages", "shared-ui", "BookmarkButton.tsx"],
  ["packages", "shared-ui", "assets", "sakupura-mark.png"],
  ["packages", "shared-ui", "ToolGuide.tsx"],
  ["apps", "portal", "src", "app", "icon.png"],
  ["apps", "portal", "src", "app", "apple-icon.png"],
  [".github", "copilot-instructions.md"],
  [".github", "instructions", "tools.instructions.md"],
  [".github", "workflows", "announce-tool.yml"],
  [".github", "workflows", "scheduled-release.yml"],
  ["scripts", "release-schedule.mjs"],
  ["scripts", "verify-release.mjs"],
  ["ARCHITECTURE.md"],
  ["ANALYTICS.md"],
  ["PRODUCT_RESEARCH.md"],
  ["PRODUCT_PLAN.md"],
  ["ROADMAP.md"],
  ["DEPLOYMENT.md"],
]) {
  assert(
    fs.existsSync(path.join(rootDir, ...requiredPath)),
    `${requiredPath.join("/")}が存在`,
  );
}

const agentsSource = readText("AGENTS.md");
const copilotSource = readText(".github", "copilot-instructions.md");
const toolInstructionsSource = readText(
  ".github",
  "instructions",
  "tools.instructions.md",
);
const productPlanSource = readText("PRODUCT_PLAN.md");
const roadmapSource = readText("ROADMAP.md");
for (const [label, source] of [
  ["AGENTS.md", agentsSource],
  ["Copilot instructions", copilotSource],
  ["ミニサービス固有ルール", toolInstructionsSource],
  ["PRODUCT_PLAN.md", productPlanSource],
  ["ROADMAP.md", roadmapSource],
]) {
  assert(
    source.includes("PRODUCT_RESEARCH.md"),
    `${label}が新規企画の調査基準を参照`,
  );
}

const footerSource = readText("packages", "shared-ui", "Footer.tsx");
assert(
  footerSource.includes("/privacy") && footerSource.includes("/disclaimer"),
  "共通footerに法務ページへのリンクが存在",
);
const headerSource = readText("packages", "shared-ui", "Header.tsx");
assert(
  headerSource.includes('from "./assets/sakupura-mark.png"') &&
    headerSource.includes("brandMark"),
  "共通headerがサクプラのブランドアイコンを表示",
);
const analyticsSource = readText(
  "packages",
  "shared-ui",
  "AnalyticsEvents.tsx",
);
const analyticsLoaderSource = readText(
  "packages",
  "shared-ui",
  "Analytics.tsx",
);
assert(
  analyticsSource.includes("data-analytics-event") &&
    analyticsSource.includes('window.gtag("event"') &&
    analyticsLoaderSource.includes("AnalyticsEvents"),
  "GA4操作イベントは共通処理から送信",
);
assert(
  readText("templates", "tool", "package", "ToolPage.tsx").includes(
    'data-analytics-event="tool_run"',
  ),
  "新規ツールtemplateに主処理のGA4計測を用意",
);
const qualityWorkflow = readText(".github", "workflows", "quality.yml");
assert(
  qualityWorkflow.includes("npm run check"),
  "CIがnpm run checkで全品質検査を実行",
);
const announceWorkflow = readText(".github", "workflows", "announce-tool.yml");
assert(
  announceWorkflow.includes("workflow_dispatch") &&
    !announceWorkflow.includes("branches:"),
  "X投稿は手動workflowだけで実行",
);
assert(
  announceWorkflow.includes("contents: write") &&
    announceWorkflow.includes("Record successful announcement") &&
    announceWorkflow.includes("git push"),
  "X投稿成功後に告知状態を台帳へ記録",
);
for (const secretName of [
  "X_API_KEY",
  "X_API_KEY_SECRET",
  "X_ACCESS_TOKEN",
  "X_ACCESS_TOKEN_SECRET",
]) {
  assert(
    announceWorkflow.includes(`secrets.${secretName}`),
    `手動X告知は${secretName}をRepository Secretから取得`,
  );
}
assert(
  !announceWorkflow.includes("X_USER_ACCESS_TOKEN"),
  "期限更新のない単一OAuth 2.0 Tokenへ依存しない",
);
const scheduledReleaseWorkflow = readText(
  ".github",
  "workflows",
  "scheduled-release.yml",
);
assert(
  scheduledReleaseWorkflow.includes("schedule:") &&
    scheduledReleaseWorkflow.includes("workflow_dispatch:") &&
    scheduledReleaseWorkflow.includes("SCHEDULED_RELEASES_ENABLED"),
  "予約公開は定期実行・手動確認・明示的な有効化スイッチを持つ",
);
assert(
  scheduledReleaseWorkflow.includes("npm run check") &&
    scheduledReleaseWorkflow.includes("release:verify") &&
    scheduledReleaseWorkflow.includes("Roll back failed release") &&
    scheduledReleaseWorkflow.includes("--now"),
  "予約公開は品質検査・本番確認・失敗時ロールバックを行う",
);
assert(
  scheduledReleaseWorkflow.includes("steps.verify.outcome == 'success'") &&
    scheduledReleaseWorkflow.includes("release:x"),
  "X告知は本番確認成功後だけ実行",
);
for (const secretName of [
  "X_API_KEY",
  "X_API_KEY_SECRET",
  "X_ACCESS_TOKEN",
  "X_ACCESS_TOKEN_SECRET",
]) {
  assert(
    scheduledReleaseWorkflow.includes(`secrets.${secretName}`),
    `予約X告知は${secretName}をRepository Secretから取得`,
  );
}
assert(
  scheduledReleaseWorkflow.includes("group: release-state-writes") &&
    announceWorkflow.includes("group: release-state-writes"),
  "予約公開と手動X告知は同時に台帳を変更しない",
);
const createToolSource = readText("scripts", "create-tool.mjs");
assert(
  createToolSource.includes('status: "draft"') &&
    createToolSource.includes("publishAt: null") &&
    createToolSource.includes("announceOnX: false") &&
    createToolSource.includes("announcedAt: null"),
  "新規ツールは安全な非公開状態で生成",
);

const googleValuePatterns = [/G-[A-Z0-9]{6,}/g, /ca-pub-\d{10,}/g];
const sourceRoots = [
  path.join(rootDir, "apps"),
  path.join(rootDir, "packages"),
];
const allowedGoogleFile = "packages/shared-ui/GoogleServices.ts";
for (const sourceRoot of sourceRoots) {
  const sourceFiles = findFiles(
    sourceRoot,
    null,
    new Set([".next", "node_modules"]),
  );
  for (const sourceFile of sourceFiles) {
    if (!/\.(?:ts|tsx|js|jsx)$/.test(sourceFile)) continue;
    const source = fs.readFileSync(sourceFile, "utf8");
    if (googleValuePatterns.some((pattern) => pattern.test(source))) {
      assert(
        relative(sourceFile) === allowedGoogleFile,
        `Google IDの直書き場所: ${relative(sourceFile)}`,
      );
    }
    for (const pattern of googleValuePatterns) pattern.lastIndex = 0;
  }
}

if (errors.length > 0) {
  console.error("\nサクプラ構成検査: FAILED\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`サクプラ構成検査: PASSED (${checks.length} checks)`);
