import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildReleasePost, findTool } from "./release-post.mjs";

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const args = process.argv.slice(2);
const slugIndex = args.indexOf("--slug");
const slug = slugIndex >= 0 ? args[slugIndex + 1] : undefined;
if (!slug) throw new Error("--slug <service-slug>を指定してください。");

const manifest = JSON.parse(
  fs.readFileSync(
    path.join(rootDir, "apps", "portal", "src", "data", "tools.json"),
    "utf8",
  ),
);
console.log(buildReleasePost(findTool(manifest, slug)));
