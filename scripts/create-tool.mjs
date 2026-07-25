import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const manifestPath = path.join(
  rootDir,
  "apps",
  "portal",
  "src",
  "data",
  "tools.json",
);
const portalPackagePath = path.join(rootDir, "apps", "portal", "package.json");
const templateDir = path.join(rootDir, "templates", "tool");

function parseArguments(argv) {
  const options = {};

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (!argument.startsWith("--")) {
      throw new Error(`不明な引数です: ${argument}`);
    }

    const [rawKey, inlineValue] = argument.slice(2).split("=", 2);
    if (["dry-run", "skip-install", "help"].includes(rawKey)) {
      options[rawKey] = true;
      continue;
    }

    const value = inlineValue ?? argv[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`--${rawKey} の値が必要です。`);
    }
    options[rawKey] = value;
    if (inlineValue === undefined) index += 1;
  }

  return options;
}

function printHelp() {
  console.log(`サクプラ ミニサービス生成

使い方:
  npm run create:tool -- --slug invoice-calculator --title "請求計算" --description "請求額を計算します。" --badge "業務計算"

必須:
  --slug         半角英小文字のkebab-case
  --title        ポータルとページに表示する名称
  --description  サービスの説明
  --badge        カードの短い分類名

任意:
  --id           台帳ID（省略時は連番を自動採番）
  --dry-run      変更予定だけを表示
  --skip-install npm installを省略`);
}

function pascalCase(slug) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function renderTemplate(relativePath, replacements) {
  let content = fs.readFileSync(path.join(templateDir, relativePath), "utf8");
  for (const [token, value] of Object.entries(replacements)) {
    content = content.replaceAll(token, value);
  }
  return content;
}

function writeFile(targetPath, content) {
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, `${content.trimEnd()}\n`, "utf8");
}

const options = parseArguments(process.argv.slice(2));
if (options.help) {
  printHelp();
  process.exit(0);
}

for (const requiredOption of ["slug", "title", "description", "badge"]) {
  if (!options[requiredOption]?.trim()) {
    printHelp();
    throw new Error(`--${requiredOption} は必須です。`);
  }
}

const slug = options.slug.trim();
if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 50) {
  throw new Error("--slugは50文字以内のkebab-caseで指定してください。");
}

const title = options.title.trim();
const description = options.description.trim();
const badge = options.badge.trim();
const packageName = `@sakupla/${slug}`;
const componentName = `${pascalCase(slug)}Page`;
const href = `/tools/${slug}`;
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const nextSequence =
  Math.max(
    0,
    ...manifest.map((tool) =>
      Number.parseInt(tool.id.match(/^(\d{3})-/)?.[1] ?? "0", 10),
    ),
  ) + 1;
const id =
  options.id?.trim() || `${String(nextSequence).padStart(3, "0")}-${slug}`;

if (!/^[a-z0-9][a-z0-9-]*$/.test(id)) {
  throw new Error("--idは半角英小文字・数字・ハイフンで指定してください。");
}
if (manifest.some((tool) => tool.slug === slug || tool.id === id)) {
  throw new Error(`台帳に同じslugまたはidが存在します: ${slug}`);
}

const packageDir = path.join(rootDir, "packages", slug);
const routeDir = path.join(
  rootDir,
  "apps",
  "portal",
  "src",
  "app",
  "tools",
  slug,
);
if (fs.existsSync(packageDir) || fs.existsSync(routeDir)) {
  throw new Error(`生成先がすでに存在します: ${slug}`);
}

const replacements = {
  __SLUG__: slug,
  __COMPONENT_NAME__: componentName,
  __TITLE_JSON__: JSON.stringify(title),
  __DESCRIPTION_JSON__: JSON.stringify(description),
  __BADGE_JSON__: JSON.stringify(badge),
};
const plannedFiles = [
  path.join(packageDir, "package.json"),
  path.join(packageDir, `${componentName}.tsx`),
  path.join(packageDir, "index.ts"),
  path.join(routeDir, "page.tsx"),
  manifestPath,
  portalPackagePath,
];

console.log(`\n生成するサービス: ${title}`);
console.log(`公開URL: https://www.norops.jp${href}`);
for (const filePath of plannedFiles) {
  console.log(`- ${path.relative(rootDir, filePath)}`);
}

if (options["dry-run"]) {
  for (const templatePath of [
    path.join("package", "package.json"),
    path.join("package", "ToolPage.tsx"),
    path.join("package", "index.ts"),
    path.join("route", "page.tsx"),
  ]) {
    const rendered = renderTemplate(templatePath, replacements);
    if (/__[A-Z0-9_]+__/.test(rendered)) {
      throw new Error(`未置換のテンプレート変数があります: ${templatePath}`);
    }
  }
  console.log("\nドライランのためファイルは変更していません。");
  process.exit(0);
}

writeFile(
  path.join(packageDir, "package.json"),
  renderTemplate(path.join("package", "package.json"), replacements),
);
writeFile(
  path.join(packageDir, `${componentName}.tsx`),
  renderTemplate(path.join("package", "ToolPage.tsx"), replacements),
);
writeFile(
  path.join(packageDir, "index.ts"),
  renderTemplate(path.join("package", "index.ts"), replacements),
);
writeFile(
  path.join(routeDir, "page.tsx"),
  renderTemplate(path.join("route", "page.tsx"), replacements),
);

manifest.push({
  id,
  slug,
  title,
  description,
  href,
  badge,
  packageName,
  componentName,
});
writeFile(manifestPath, JSON.stringify(manifest, null, 2));

const portalPackage = JSON.parse(fs.readFileSync(portalPackagePath, "utf8"));
portalPackage.dependencies[packageName] = `file:../../packages/${slug}`;
portalPackage.dependencies = Object.fromEntries(
  Object.entries(portalPackage.dependencies).sort(([left], [right]) =>
    left.localeCompare(right),
  ),
);
writeFile(portalPackagePath, JSON.stringify(portalPackage, null, 2));

if (!options["skip-install"]) {
  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  const installResult = spawnSync(npmCommand, ["install", "--ignore-scripts"], {
    cwd: rootDir,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (installResult.status !== 0) {
    throw new Error(
      "npm installに失敗しました。生成ファイルを確認してください。",
    );
  }
}

const checkResult = spawnSync(
  process.execPath,
  [path.join(rootDir, "scripts", "check-architecture.mjs")],
  { cwd: rootDir, stdio: "inherit" },
);
if (checkResult.status !== 0) {
  throw new Error("生成後の構成検査に失敗しました。");
}

console.log(
  `\n${title}の骨組みを作成しました。${componentName}.tsxへ機能を実装してください。`,
);
