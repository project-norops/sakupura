"use client";

import { useMemo, useState } from "react";
import {
  diagnoseShopifyCsv,
  parseCsv,
  repairTable,
  serializeCsv,
  type CsvIssue,
  type CsvTable,
} from "./utils";

const SAMPLE = `Handle,Title,Variant Price,Variant Compare At Price,Variant SKU,Image Src,Published,Status
canvas-bag,キャンバストート,2800,3500,BAG-01,https://example.com/bag.jpg,TRUE,active
canvas-bag,,abc,2500,BAG-01,bad-url,yes,ACTIVE`;

export function ShopifyCsvCheckerPage() {
  const [table, setTable] = useState<CsvTable | null>(null);
  const [fileName, setFileName] = useState("products.csv");
  const [error, setError] = useState("");
  const issues = useMemo(
    () => (table ? diagnoseShopifyCsv(table) : []),
    [table],
  );
  const counts = useMemo(
    () =>
      issues.reduce(
        (result, issue) => ({
          ...result,
          [issue.severity]: result[issue.severity] + 1,
        }),
        { error: 0, warning: 0 },
      ),
    [issues],
  );

  const inspect = (text: string, name = "products.csv") => {
    try {
      setTable(parseCsv(text));
      setFileName(name);
      setError("");
    } catch (caught) {
      setTable(null);
      setError(
        caught instanceof Error
          ? caught.message
          : "CSVを読み込めませんでした。",
      );
    }
  };
  const choose = async (file?: File) => {
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      setError("初期版では15MB以下のCSVを診断できます。");
      return;
    }
    inspect(await file.text(), file.name);
  };
  const download = () => {
    if (!table) return;
    const blob = new Blob(["\uFEFF", serializeCsv(repairTable(table))], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName.replace(/\.csv$/i, "") + "-checked.csv";
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const issueStyle = (issue: CsvIssue) =>
    issue.severity === "error"
      ? "border-rose-200 bg-rose-50 text-rose-900"
      : "border-amber-200 bg-amber-50 text-amber-950";

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
          EC運営
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          Shopify商品CSV診断・修正ツール
        </h1>
        <p className="mt-4 max-w-3xl leading-7 text-slate-600">
          Shopifyへ読み込む前に、必須列、価格、SKU、画像URL、公開状態を行番号付きで確認します。CSVはサーバーへ送信せず、ブラウザ内だけで診断します。
        </p>
        <div className="mt-8 grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
          <section>
            <h2 className="text-xl font-black text-slate-950">
              1. 商品CSVを読み込む
            </h2>
            <label className="mt-4 block cursor-pointer rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center hover:border-blue-400">
              <input
                type="file"
                accept=".csv,text/csv"
                className="sr-only"
                onChange={(event) => choose(event.target.files?.[0])}
              />
              <span className="text-3xl">📄</span>
              <span className="mt-2 block font-black text-slate-800">
                CSVファイルを選択
              </span>
              <span className="mt-1 block text-sm text-slate-500">
                UTF-8・15MBまで
              </span>
            </label>
            <button
              type="button"
              onClick={() => inspect(SAMPLE, "sample-products.csv")}
              data-analytics-event="sample_load"
              data-analytics-tool-id="shopify-csv-checker"
              className="mt-3 w-full rounded-full border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 hover:border-blue-400 hover:text-blue-700"
            >
              問題入りサンプルで試す
            </button>
            {error && (
              <p
                role="alert"
                className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-800"
              >
                {error}
              </p>
            )}
            <div className="mt-5 rounded-2xl bg-blue-50 p-4 text-sm leading-6 text-blue-950">
              <strong>診断対象</strong>
              <br />
              初期版はShopify商品CSV向けです。インポート成功や販売情報の正確性を保証するものではありません。
            </div>
          </section>
          <section>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-black text-slate-950">2. 診断結果</h2>
              {table && (
                <span className="text-sm font-bold text-slate-500">
                  {table.rows.length}行・{table.headers.length}列
                </span>
              )}
            </div>
            {!table ? (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
                CSVを選ぶと、ここにエラーと警告が表示されます。
              </div>
            ) : (
              <>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="rounded-2xl bg-slate-100 p-4 text-center">
                    <strong className="text-2xl text-slate-950">
                      {table.rows.length}
                    </strong>
                    <span className="block text-xs font-bold text-slate-500">
                      商品行
                    </span>
                  </div>
                  <div className="rounded-2xl bg-rose-50 p-4 text-center">
                    <strong className="text-2xl text-rose-700">
                      {counts.error}
                    </strong>
                    <span className="block text-xs font-bold text-rose-700">
                      エラー
                    </span>
                  </div>
                  <div className="rounded-2xl bg-amber-50 p-4 text-center">
                    <strong className="text-2xl text-amber-800">
                      {counts.warning}
                    </strong>
                    <span className="block text-xs font-bold text-amber-800">
                      警告
                    </span>
                  </div>
                </div>
                <div className="mt-4 max-h-[28rem] space-y-2 overflow-y-auto pr-1">
                  {issues.length === 0 ? (
                    <div className="rounded-2xl bg-emerald-50 p-5 font-bold text-emerald-800">
                      ✓ 現在の診断項目では問題を検出しませんでした。
                    </div>
                  ) : (
                    issues.map((issue, index) => (
                      <article
                        key={`${issue.row}-${issue.field}-${index}`}
                        className={`rounded-xl border p-3 text-sm ${issueStyle(issue)}`}
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <strong>
                            {issue.severity === "error" ? "エラー" : "確認"}
                          </strong>
                          <span className="rounded bg-white/70 px-2 py-0.5 text-xs font-bold">
                            {issue.row ? `${issue.row}行目` : "列名"}
                          </span>
                          <span className="font-mono text-xs">
                            {issue.field}
                          </span>
                        </div>
                        <p className="mt-1 leading-6">{issue.message}</p>
                      </article>
                    ))
                  )}
                </div>
                <button
                  type="button"
                  onClick={download}
                  data-analytics-event="tool_run"
                  data-analytics-tool-id="shopify-csv-checker"
                  className="mt-5 w-full rounded-full bg-blue-600 px-5 py-4 font-black text-white hover:bg-blue-700"
                >
                  安全に整形できる項目を直してCSV保存
                </button>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  前後の空白、PublishedのTRUE/FALSE、Statusの大文字小文字を整えます。価格やURLなど、判断が必要な値は自動変更しません。
                </p>
              </>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
