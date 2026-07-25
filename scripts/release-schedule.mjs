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

export function findDueTools(manifest, now = new Date()) {
  const nowTime = now.getTime();
  if (Number.isNaN(nowTime)) throw new Error("現在日時が不正です。");

  return manifest.filter(
    (tool) =>
      tool.status === "scheduled" &&
      typeof tool.publishAt === "string" &&
      !Number.isNaN(Date.parse(tool.publishAt)) &&
      Date.parse(tool.publishAt) <= nowTime,
  );
}

export function publishDueTools(manifest, now = new Date()) {
  const dueTools = findDueTools(manifest, now);
  for (const tool of dueTools) tool.status = "published";
  return dueTools;
}

function parseNow(args) {
  const nowIndex = args.indexOf("--now");
  if (nowIndex < 0) return new Date();
  const value = args[nowIndex + 1];
  if (!value) throw new Error("--nowにはISO日時を指定してください。");
  const now = new Date(value);
  if (Number.isNaN(now.getTime())) throw new Error("--nowの日時が不正です。");
  return now;
}

function run() {
  const args = process.argv.slice(2);
  const apply = args.includes("--apply");
  const json = args.includes("--json");
  const now = parseNow(args);
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const dueTools = apply
    ? publishDueTools(manifest, now)
    : findDueTools(manifest, now);

  if (apply && dueTools.length > 0) {
    fs.writeFileSync(
      manifestPath,
      `${JSON.stringify(manifest, null, 2)}\n`,
      "utf8",
    );
  }

  const result = dueTools.map(({ slug, href, title, announceOnX }) => ({
    slug,
    href,
    title,
    announceOnX,
  }));

  if (json) console.log(JSON.stringify(result));
  else if (result.length === 0)
    console.log("公開時刻を迎えたツールはありません。");
  else {
    const action = apply ? "公開状態へ変更" : "公開予定";
    for (const tool of result) console.log(`${action}: ${tool.slug}`);
  }
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  run();
}
