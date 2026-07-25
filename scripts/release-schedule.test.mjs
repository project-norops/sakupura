import assert from "node:assert/strict";
import test from "node:test";
import { findDueTools, publishDueTools } from "./release-schedule.mjs";

const scheduled = (overrides = {}) => ({
  slug: "example-tool",
  href: "/tools/example-tool",
  title: "Example",
  status: "scheduled",
  publishAt: "2026-07-25T12:00:00+09:00",
  announceOnX: true,
  ...overrides,
});

test("公開時刻を迎えたscheduledだけを返す", () => {
  const manifest = [
    scheduled(),
    scheduled({ slug: "future", publishAt: "2026-07-25T14:00:00+09:00" }),
    scheduled({ slug: "draft", status: "draft" }),
    scheduled({ slug: "published", status: "published" }),
  ];
  const due = findDueTools(manifest, new Date("2026-07-25T12:30:00+09:00"));
  assert.deepEqual(
    due.map((tool) => tool.slug),
    ["example-tool"],
  );
});

test("公開時刻と同時刻なら対象にする", () => {
  const due = findDueTools(
    [scheduled()],
    new Date("2026-07-25T12:00:00+09:00"),
  );
  assert.equal(due.length, 1);
});

test("不正な公開日時は対象にしない", () => {
  const due = findDueTools(
    [scheduled({ publishAt: "invalid" })],
    new Date("2026-07-25T12:30:00+09:00"),
  );
  assert.equal(due.length, 0);
});

test("適用時は対象だけをpublishedへ変更する", () => {
  const future = scheduled({
    slug: "future",
    publishAt: "2026-07-25T14:00:00+09:00",
  });
  const manifest = [scheduled(), future];
  const published = publishDueTools(
    manifest,
    new Date("2026-07-25T12:30:00+09:00"),
  );
  assert.equal(published[0].status, "published");
  assert.equal(future.status, "scheduled");
});
