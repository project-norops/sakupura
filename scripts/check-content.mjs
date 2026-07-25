import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildReleasePost } from "./release-post.mjs";

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const manifest = JSON.parse(
  fs.readFileSync(
    path.join(rootDir, "apps", "portal", "src", "data", "tools.json"),
    "utf8",
  ),
);
const errors = [];

const textLength = (value) =>
  typeof value === "string" ? Array.from(value.replace(/\s/g, "")).length : 0;
const hasPlaceholder = (value) =>
  typeof value === "string" && /TODO|TBD|Lorem ipsum|この領域に/i.test(value);
const releaseStatuses = new Set([
  "draft",
  "scheduled",
  "published",
  "archived",
]);

function isTimestamp(value) {
  return (
    typeof value === "string" &&
    /(?:Z|[+-]\d{2}:\d{2})$/.test(value) &&
    !Number.isNaN(Date.parse(value))
  );
}

function requireText(value, minimum, label) {
  if (textLength(value) < minimum)
    errors.push(`${label}: ${minimum}文字以上の固有説明が必要です。`);
  if (hasPlaceholder(value))
    errors.push(`${label}: TODOや仮文を公開できません。`);
}

function requireList(value, minimumItems, minimumTextLength, label) {
  if (!Array.isArray(value) || value.length < minimumItems) {
    errors.push(`${label}: ${minimumItems}件以上必要です。`);
    return;
  }
  value.forEach((item, index) =>
    requireText(item, minimumTextLength, `${label}[${index + 1}]`),
  );
}

const summaries = new Set();
for (const tool of manifest) {
  const label = tool.slug ?? tool.id ?? "unknown";
  const content = tool.content ?? {};

  if (!releaseStatuses.has(tool.status)) {
    errors.push(
      `${label}.status: draft / scheduled / published / archivedのいずれかが必要です。`,
    );
  }
  if (tool.publishAt !== null && !isTimestamp(tool.publishAt)) {
    errors.push(
      `${label}.publishAt: nullまたはタイムゾーン付きISO日時が必要です。`,
    );
  }
  if (
    ["scheduled", "published"].includes(tool.status) &&
    !isTimestamp(tool.publishAt)
  ) {
    errors.push(`${label}.publishAt: ${tool.status}では日時が必須です。`);
  }
  if (typeof tool.announceOnX !== "boolean") {
    errors.push(`${label}.announceOnX: trueまたはfalseが必要です。`);
  }
  if (tool.announcedAt !== null && !isTimestamp(tool.announcedAt)) {
    errors.push(
      `${label}.announcedAt: nullまたはタイムゾーン付きISO日時が必要です。`,
    );
  }
  if (tool.announcedAt && !tool.announceOnX) {
    errors.push(`${label}: announcedAt設定時はannounceOnXをtrueにします。`);
  }
  if (tool.announcedAt && !["published", "archived"].includes(tool.status)) {
    errors.push(`${label}: 未公開サービスにannouncedAtは設定できません。`);
  }
  if (
    isTimestamp(tool.publishAt) &&
    isTimestamp(tool.announcedAt) &&
    Date.parse(tool.announcedAt) < Date.parse(tool.publishAt)
  ) {
    errors.push(`${label}: announcedAtはpublishAt以降にしてください。`);
  }

  requireText(content.summary, 140, `${label}.summary`);
  requireText(content.audience, 70, `${label}.audience`);

  if (!Array.isArray(content.features) || content.features.length < 3) {
    errors.push(`${label}.features: 3件以上必要です。`);
  } else {
    content.features.forEach((feature, index) => {
      requireText(feature?.title, 4, `${label}.features[${index + 1}].title`);
      requireText(
        feature?.description,
        55,
        `${label}.features[${index + 1}].description`,
      );
    });
  }

  requireList(content.steps, 3, 40, `${label}.steps`);
  requireList(content.notes, 2, 55, `${label}.notes`);

  if (!Array.isArray(content.faq) || content.faq.length < 3) {
    errors.push(`${label}.faq: 3件以上必要です。`);
  } else {
    content.faq.forEach((item, index) => {
      requireText(item?.question, 12, `${label}.faq[${index + 1}].question`);
      requireText(item?.answer, 70, `${label}.faq[${index + 1}].answer`);
    });
  }

  if (textLength(JSON.stringify(content)) < 900) {
    errors.push(`${label}: ガイド全体に900文字以上の具体的な説明が必要です。`);
  }

  const normalizedSummary = content.summary?.replace(/\s/g, "");
  if (normalizedSummary && summaries.has(normalizedSummary)) {
    errors.push(`${label}: 他ツールと同一のsummaryは使用できません。`);
  }
  if (normalizedSummary) summaries.add(normalizedSummary);

  requireText(tool.releasePost, 70, `${label}.releasePost`);
  try {
    buildReleasePost(tool);
  } catch (error) {
    errors.push(`${label}.releasePost: ${error.message}`);
  }
}

if (errors.length > 0) {
  console.error("\nサクプラ コンテンツ品質検査: FAILED\n");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`サクプラ コンテンツ品質検査: PASSED (${manifest.length} tools)`);
