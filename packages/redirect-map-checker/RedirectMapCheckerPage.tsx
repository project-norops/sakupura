"use client";

import { useMemo, useState } from "react";
import {
  diagnoseRedirectMap,
  parseRedirectMap,
  serializeRedirectMap,
  type RedirectRow,
} from "./utils";
const SAMPLE = `old_url,new_url\nhttps://old.example.com/about,https://new.example.com/company\nhttps://old.example.com/service,https://new.example.com/services\nhttps://old.example.com/contact,https://old.example.com/contact\nhttps://old.example.com/about,https://new.example.com/about-us`;
const TEMPLATE = `old_url,new_url\nhttps://old.example.com/about,https://new.example.com/company\nhttps://old.example.com/contact,https://new.example.com/contact`;

export function RedirectMapCheckerPage() {
  const [rows, setRows] = useState<RedirectRow[]>([]);
  const [error, setError] = useState("");
  const issues = useMemo(() => diagnoseRedirectMap(rows), [rows]);
  const inspect = (text: string) => {
    try {
      setRows(parseRedirectMap(text));
      setError("");
    } catch (caught) {
      setRows([]);
      setError(
        caught instanceof Error
          ? caught.message
          : "対応表を読み込めませんでした。",
      );
    }
  };
  const choose = async (file?: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("初期版では5MB以下のCSVを検証できます。");
      return;
    }
    inspect(await file.text());
  };
  const download = () => {
    const blob = new Blob(["\uFEFF", serializeRedirectMap(rows)], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "redirect-map-reviewed.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const downloadTemplate = () => {
    const blob = new Blob(["\uFEFF", TEMPLATE], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "redirect-map-template.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const errors = issues.filter((i) => i.severity === "error").length;
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <p className="text-xs font-black uppercase tracking-[.2em] text-blue-600">
          SEO
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          サイト移転リダイレクトマップ検証
        </h1>
        <p className="mt-4 max-w-3xl leading-7 text-slate-600">
          旧URLと新URLの対応表を公開前に検査し、空欄、重複、自己転送、転送チェーン候補を見つけます。初期版は実サイトへ通信せず、CSVの設計を確認します。
        </p>
        <div className="mt-8 grid gap-8 lg:grid-cols-[.75fr_1.25fr]">
          <section>
            <h2 className="text-xl font-black">1. 対応表CSVを読み込む</h2>
            <label className="mt-4 block cursor-pointer rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center hover:border-blue-400">
              <input
                type="file"
                accept=".csv,text/csv"
                className="sr-only"
                onChange={(e) => choose(e.target.files?.[0])}
              />
              <span className="text-3xl">🔀</span>
              <strong className="mt-2 block">CSVファイルを選択</strong>
              <span className="mt-1 block text-sm text-slate-500">
                列名：old_url, new_url
              </span>
            </label>
            <button
              onClick={() => inspect(SAMPLE)}
              data-analytics-event="sample_load"
              data-analytics-tool-id="redirect-map-checker"
              className="mt-3 w-full rounded-full border border-slate-300 px-5 py-3 text-sm font-bold"
            >
              問題入りサンプルで試す
            </button>
            <button
              type="button"
              onClick={downloadTemplate}
              data-analytics-event="tool_run"
              data-analytics-tool-id="redirect-map-checker"
              className="mt-2 w-full rounded-full border border-slate-300 px-5 py-3 text-sm font-bold"
            >
              入力用テンプレートCSVを保存
            </button>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              old_url列に移転前のURL、new_url列に対応する移転後のURLを1行ずつ入力します。
            </p>
            {error && (
              <p
                role="alert"
                className="mt-4 rounded-xl bg-rose-50 p-4 text-sm font-bold text-rose-800"
              >
                {error}
              </p>
            )}
            <div className="mt-5 rounded-2xl bg-blue-50 p-4 text-sm leading-6 text-blue-950">
              <strong>初期版で確認する内容</strong>
              <br />
              URL形式、空欄、重複、自己転送、同一転送先への集中、CSV内の転送チェーン候補です。HTTPステータスは確認しません。
            </div>
          </section>
          <section>
            <div className="flex flex-wrap justify-between gap-3">
              <h2 className="text-xl font-black">2. 検証結果</h2>
              {rows.length > 0 && (
                <span className="text-sm font-bold text-slate-500">
                  {rows.length}件・エラー{errors}件・警告
                  {issues.length - errors}件
                </span>
              )}
            </div>
            {rows.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
                CSVを選ぶと問題箇所が表示されます。
              </div>
            ) : (
              <div className="mt-4 max-h-[32rem] space-y-2 overflow-y-auto">
                {issues.length === 0 ? (
                  <p className="rounded-2xl bg-emerald-50 p-5 font-bold text-emerald-800">
                    ✓ CSV内の設計上の問題は検出されませんでした。
                  </p>
                ) : (
                  issues.map((issue, index) => (
                    <article
                      key={`${issue.row}-${index}`}
                      className={`rounded-xl border p-3 text-sm ${issue.severity === "error" ? "border-rose-200 bg-rose-50 text-rose-900" : "border-amber-200 bg-amber-50 text-amber-950"}`}
                    >
                      <strong>
                        {issue.severity === "error" ? "エラー" : "確認"}{" "}
                        {issue.row && `・${issue.row}行目`}
                      </strong>
                      <p className="mt-1 leading-6">{issue.message}</p>
                    </article>
                  ))
                )}
              </div>
            )}
            {rows.length > 0 && (
              <button
                onClick={download}
                data-analytics-event="tool_run"
                data-analytics-tool-id="redirect-map-checker"
                className="mt-5 w-full rounded-full bg-blue-600 px-5 py-4 font-black text-white hover:bg-blue-700"
              >
                確認済み対応表をCSV保存
              </button>
            )}
          </section>
        </div>
        <p className="mt-8 border-t pt-5 text-xs leading-5 text-slate-500">
          実際の301・302、最終到達URL、404、応答速度は、公開後にサーバーまたは専用クローラーで別途確認してください。
        </p>
      </section>
    </main>
  );
}
