import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildReleasePost, findTool } from "./release-post.mjs";
import {
  createOAuthAuthorizationHeader,
  readXCredentials,
} from "./x-oauth1.mjs";

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const args = process.argv.slice(2);
const slugIndex = args.indexOf("--slug");
const slug = slugIndex >= 0 ? args[slugIndex + 1] : undefined;
const publish = args.includes("--publish");
if (!slug) throw new Error("--slug <service-slug>を指定してください。");

const manifestPath = path.join(
  rootDir,
  "apps",
  "portal",
  "src",
  "data",
  "tools.json",
);
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const tool = findTool(manifest, slug);
const text = buildReleasePost(tool);

if (!publish) {
  console.log(
    `${text}\n\nドライランです。投稿する場合だけ--publishを付けてください。`,
  );
  process.exit(0);
}

if (tool.status !== "published")
  throw new Error("published状態のサービスだけXへ告知できます。");
if (!tool.announceOnX)
  throw new Error("announceOnXがtrueのサービスだけXへ告知できます。");
if (tool.announcedAt)
  throw new Error(`このサービスは${tool.announcedAt}に告知済みです。`);
const credentials = readXCredentials();
const endpoint = "https://api.x.com/2/tweets";

const response = await fetch(endpoint, {
  method: "POST",
  headers: {
    Authorization: createOAuthAuthorizationHeader({
      method: "POST",
      url: endpoint,
      ...credentials,
    }),
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ text }),
});
const result = await response.json();
if (!response.ok) {
  throw new Error(
    `X API投稿に失敗しました (${response.status}): ${JSON.stringify(result)}`,
  );
}

tool.announcedAt = new Date().toISOString();
fs.writeFileSync(
  manifestPath,
  `${JSON.stringify(manifest, null, 2)}\n`,
  "utf8",
);
console.log(
  `Xへ投稿し、announcedAtを記録しました: ${result.data?.id ?? "ID不明"}`,
);
