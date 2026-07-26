"use client";

import { useMemo, useState } from "react";
import {
  buildChapterText,
  buildChapterUrl,
  parseChapterTime,
  validateChapters,
  type Chapter,
} from "./utils";

const SAMPLE: Chapter[] = [
  { id: "sample-1", time: "0:00", title: "この動画でわかること" },
  { id: "sample-2", time: "0:42", title: "準備するもの" },
  { id: "sample-3", time: "2:15", title: "実際の操作手順" },
  { id: "sample-4", time: "5:30", title: "よくある失敗と対処法" },
  { id: "sample-5", time: "7:10", title: "まとめ" },
];

const newChapter = (index: number): Chapter => ({
  id: `${Date.now()}-${index}`,
  time: index === 0 ? "0:00" : "",
  title: "",
});

export function YoutubeChapterMakerPage() {
  const [chapters, setChapters] = useState<Chapter[]>([
    newChapter(0),
    newChapter(1),
    newChapter(2),
  ]);
  const [videoUrl, setVideoUrl] = useState("");
  const [copied, setCopied] = useState("");
  const issues = useMemo(() => validateChapters(chapters), [chapters]);
  const chapterText = useMemo(() => buildChapterText(chapters), [chapters]);
  const isValid = issues.length === 0;

  const update = (id: string, key: "time" | "title", value: string) =>
    setChapters((current) =>
      current.map((chapter) =>
        chapter.id === id ? { ...chapter, [key]: value } : chapter,
      ),
    );
  const move = (index: number, delta: number) => {
    const nextIndex = index + delta;
    if (nextIndex < 0 || nextIndex >= chapters.length) return;
    setChapters((current) => {
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  };
  const copy = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(""), 1600);
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <p className="text-xs font-black uppercase tracking-[.2em] text-blue-600">
          動画運用
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          YouTubeチャプター・タイムスタンプ作成
        </h1>
        <p className="mt-4 max-w-3xl leading-7 text-slate-600">
          動画内の時刻と見出しを並べ、YouTube概要欄へ貼り付けるチャプターを作成します。0:00開始、3件以上、昇順、10秒以上の区間を公開前に確認できます。
        </p>
        <div className="mt-5 rounded-2xl bg-blue-50 p-4 text-sm leading-6 text-blue-950">
          <strong>AIや動画解析は使用しません。</strong>{" "}
          動画を見ながら区切りたい時刻と見出しを入力すると、公式条件に合う書式へ整えます。
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.08fr_.92fr]">
          <section className="min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-black text-slate-950">
                1. 時刻と章タイトルを入力
              </h2>
              <button
                type="button"
                onClick={() =>
                  setChapters(SAMPLE.map((chapter) => ({ ...chapter })))
                }
                data-analytics-event="sample_load"
                data-analytics-tool-id="youtube-chapter-maker"
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:border-blue-400"
              >
                サンプルで試す
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {chapters.map((chapter, index) => {
                const rowIssues = issues.filter(
                  (issue) => issue.index === index,
                );
                return (
                  <div
                    key={chapter.id}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <div className="grid gap-3 sm:grid-cols-[7rem_1fr_auto] sm:items-start">
                      <label className="text-xs font-bold text-slate-600">
                        時刻
                        <input
                          value={chapter.time}
                          onChange={(event) =>
                            update(chapter.id, "time", event.target.value)
                          }
                          placeholder="0:00"
                          aria-label={`チャプター${index + 1}の時刻`}
                          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-mono text-sm"
                        />
                      </label>
                      <label className="text-xs font-bold text-slate-600">
                        章タイトル
                        <input
                          value={chapter.title}
                          onChange={(event) =>
                            update(chapter.id, "title", event.target.value)
                          }
                          placeholder="この章で説明する内容"
                          aria-label={`チャプター${index + 1}のタイトル`}
                          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
                        />
                      </label>
                      <div className="flex gap-1 pt-5">
                        <button
                          type="button"
                          onClick={() => move(index, -1)}
                          disabled={index === 0}
                          aria-label={`チャプター${index + 1}を上へ`}
                          className="rounded-lg border px-2 py-2 disabled:opacity-30"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => move(index, 1)}
                          disabled={index === chapters.length - 1}
                          aria-label={`チャプター${index + 1}を下へ`}
                          className="rounded-lg border px-2 py-2 disabled:opacity-30"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setChapters((current) =>
                              current.filter((item) => item.id !== chapter.id),
                            )
                          }
                          aria-label={`チャプター${index + 1}を削除`}
                          className="rounded-lg border border-rose-200 px-2 py-2 text-rose-700"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                    {rowIssues.map((issue) => (
                      <p
                        key={issue.message}
                        className="mt-2 text-xs font-bold text-rose-700"
                      >
                        要修正：{issue.message}
                      </p>
                    ))}
                  </div>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() =>
                setChapters((current) => [
                  ...current,
                  newChapter(current.length),
                ])
              }
              className="mt-4 w-full rounded-full border border-dashed border-blue-400 px-5 py-3 text-sm font-black text-blue-700 hover:bg-blue-50"
            >
              ＋ チャプターを追加
            </button>
          </section>

          <section className="min-w-0">
            <h2 className="text-xl font-black text-slate-950">
              2. 確認してコピー
            </h2>
            {issues.some((issue) => issue.index === null) && (
              <div className="mt-4 space-y-2">
                {issues
                  .filter((issue) => issue.index === null)
                  .map((issue) => (
                    <p
                      key={issue.message}
                      className="rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-800"
                    >
                      要修正：{issue.message}
                    </p>
                  ))}
              </div>
            )}
            <div
              className={`mt-4 rounded-2xl border p-4 ${isValid ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}
            >
              <p
                className={`text-sm font-black ${isValid ? "text-emerald-800" : "text-amber-900"}`}
              >
                {isValid
                  ? "公式の基本条件を満たしています"
                  : `確認事項が${issues.length}件あります`}
              </p>
              <textarea
                readOnly
                value={chapterText}
                rows={Math.max(8, chapters.length + 2)}
                aria-label="完成したチャプター"
                className="mt-3 w-full resize-none rounded-xl border border-slate-200 bg-white p-4 font-mono text-sm leading-7 text-slate-900"
              />
              <button
                type="button"
                onClick={() => copy(chapterText, "chapters")}
                disabled={!isValid}
                data-analytics-event="tool_run"
                data-analytics-tool-id="youtube-chapter-maker"
                className="mt-3 w-full rounded-full bg-blue-600 px-5 py-3 font-black text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {copied === "chapters"
                  ? "コピーしました"
                  : "概要欄用チャプターをコピー"}
              </button>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 p-4">
              <label className="text-sm font-black text-slate-800">
                動画URL（任意）
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(event) => setVideoUrl(event.target.value)}
                  placeholder="https://youtu.be/..."
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal"
                />
              </label>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                入力すると、その章から再生する確認・共有用URLを作れます。
              </p>
              {videoUrl && isValid && (
                <div className="mt-3 max-h-56 space-y-2 overflow-auto">
                  {chapters.map((chapter) => {
                    const seconds = parseChapterTime(chapter.time) ?? 0;
                    const url = buildChapterUrl(videoUrl, seconds);
                    return (
                      <button
                        key={chapter.id}
                        type="button"
                        disabled={!url}
                        onClick={() => url && copy(url, chapter.id)}
                        className="flex w-full items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 text-left text-sm disabled:text-slate-400"
                      >
                        <span className="min-w-0 truncate">
                          {chapter.time} {chapter.title}
                        </span>
                        <strong className="shrink-0 text-blue-700">
                          {copied === chapter.id ? "コピー済み" : "URLコピー"}
                        </strong>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <a
              href="https://support.google.com/youtube/answer/9884579?hl=ja"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-block text-sm font-bold text-blue-700 underline underline-offset-4"
            >
              YouTube公式：動画チャプターの条件を確認
            </a>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              条件を満たしてもチャプター表示は保証されません。公開後はYouTube上で表示と各時刻の内容を確認してください。
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
