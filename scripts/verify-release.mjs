import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const args = process.argv.slice(2);
const slugsIndex = args.indexOf("--slugs");
const slugs =
  slugsIndex >= 0
    ? (args[slugsIndex + 1] ?? "").split(",").filter(Boolean)
    : [];
const timeoutIndex = args.indexOf("--timeout-seconds");
const timeoutSeconds = Number(
  timeoutIndex >= 0 ? args[timeoutIndex + 1] : "900",
);

if (slugs.length === 0)
  throw new Error("--slugs slug1,slug2を指定してください。");
if (!Number.isFinite(timeoutSeconds) || timeoutSeconds < 1)
  throw new Error("--timeout-secondsは1以上の数値にしてください。");

const manifest = JSON.parse(
  fs.readFileSync(
    path.join(rootDir, "apps", "portal", "src", "data", "tools.json"),
    "utf8",
  ),
);
const tools = slugs.map((slug) => {
  const tool = manifest.find((entry) => entry.slug === slug);
  if (!tool) throw new Error(`サービス台帳にslugがありません: ${slug}`);
  if (tool.status !== "published")
    throw new Error(`published状態ではありません: ${slug}`);
  return tool;
});

const deadline = Date.now() + timeoutSeconds * 1000;
const pending = new Map(tools.map((tool) => [tool.slug, tool]));

while (pending.size > 0 && Date.now() < deadline) {
  for (const [slug, tool] of pending) {
    const url = new URL(tool.href, "https://www.norops.jp");
    url.searchParams.set("release_check", Date.now().toString());
    try {
      const response = await fetch(url, {
        headers: { "Cache-Control": "no-cache" },
        redirect: "follow",
      });
      const html = await response.text();
      if (response.ok && html.includes(tool.title)) {
        console.log(`本番確認成功: ${slug} (${response.status})`);
        pending.delete(slug);
      } else {
        console.log(`本番反映待ち: ${slug} (${response.status})`);
      }
    } catch (error) {
      console.log(`本番反映待ち: ${slug} (${error.message})`);
    }
  }
  if (pending.size > 0 && Date.now() < deadline)
    await new Promise((resolve) => setTimeout(resolve, 15_000));
}

if (pending.size > 0)
  throw new Error(
    `本番確認がタイムアウトしました: ${[...pending.keys()].join(", ")}`,
  );
