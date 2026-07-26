"use client";

import { useMemo, useState } from "react";
import {
  graphemeCount,
  previewLimit,
  subjectWarnings,
  truncatePreview,
  type PreviewDevice,
} from "./utils";

export function EmailSubjectPreviewerPage() {
  const [sender, setSender] = useState("サクプラ運営チーム");
  const [subject, setSubject] = useState("新しい無料ツールを公開しました");
  const [preheader, setPreheader] = useState(
    "登録不要で、ブラウザからすぐにお試しいただけます。",
  );
  const [device, setDevice] = useState<PreviewDevice>("mobile");
  const warnings = useMemo(
    () => subjectWarnings(subject, preheader),
    [subject, preheader],
  );
  const limit = previewLimit(device);
  const cards = ["Gmail", "Outlook", "Apple Mail"];
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <p className="text-xs font-black uppercase tracking-[.2em] text-blue-600">
          メール運用
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          メール件名・プリヘッダープレビュー
        </h1>
        <p className="mt-4 max-w-3xl leading-7 text-slate-600">
          メールを送る前に、件名とプリヘッダーがPC・スマホの受信箱でどこまで見えるかを確認します。送信機能やAIは使用しません。
        </p>
        <div className="mt-8 grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
          <section className="space-y-4">
            <h2 className="text-xl font-black">1. 表示内容を入力</h2>
            {[
              ["差出人名", sender, setSender],
              ["メール件名", subject, setSubject],
              ["プリヘッダー", preheader, setPreheader],
            ].map(([label, value, setter]) => (
              <label
                key={label as string}
                className="block text-sm font-bold text-slate-700"
              >
                {label as string}
                <input
                  value={value as string}
                  onChange={(event) =>
                    (setter as (v: string) => void)(event.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal"
                />
              </label>
            ))}
            <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
              件名：<strong>{graphemeCount(subject)}文字</strong>
              <br />
              プリヘッダー：<strong>{graphemeCount(preheader)}文字</strong>
            </div>
            {warnings.length > 0 && (
              <div className="space-y-2">
                {warnings.map((warning) => (
                  <p
                    key={warning}
                    className="rounded-xl bg-amber-50 p-3 text-sm font-bold text-amber-900"
                  >
                    確認：{warning}
                  </p>
                ))}
              </div>
            )}
          </section>
          <section>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-black">2. 受信箱プレビュー</h2>
              <div className="flex rounded-full bg-slate-100 p-1">
                {(["mobile", "desktop"] as const).map((value) => (
                  <button
                    key={value}
                    onClick={() => setDevice(value)}
                    aria-pressed={device === value}
                    className={`rounded-full px-4 py-2 text-sm font-bold ${device === value ? "bg-white text-blue-700 shadow" : "text-slate-600"}`}
                  >
                    {value === "mobile" ? "スマホ" : "PC"}
                  </button>
                ))}
              </div>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              表示幅は端末、文字サイズ、受信アプリ、差出人名などで変わるため目安です。
            </p>
            <div
              className={`mx-auto mt-5 space-y-4 ${device === "mobile" ? "max-w-sm" : "max-w-2xl"}`}
            >
              {cards.map((name) => (
                <article
                  key={name}
                  className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm"
                >
                  <div className="border-b bg-slate-50 px-4 py-2 text-xs font-bold text-slate-500">
                    {name}・{device === "mobile" ? "スマホ" : "PC"}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between gap-3">
                      <strong className="truncate text-sm">
                        {sender || "差出人"}
                      </strong>
                      <span className="shrink-0 text-xs text-slate-400">
                        12:30
                      </span>
                    </div>
                    <p className="mt-1 truncate font-bold text-slate-900">
                      {truncatePreview(subject || "件名なし", limit)}
                    </p>
                    <p className="mt-1 truncate text-sm text-slate-500">
                      {truncatePreview(
                        preheader || "メール本文の先頭が表示されます",
                        limit + 12,
                      )}
                    </p>
                  </div>
                </article>
              ))}
            </div>
            <button
              type="button"
              data-analytics-event="tool_run"
              data-analytics-tool-id="email-subject-previewer"
              className="sr-only"
            >
              プレビューを確認
            </button>
          </section>
        </div>
      </section>
    </main>
  );
}
