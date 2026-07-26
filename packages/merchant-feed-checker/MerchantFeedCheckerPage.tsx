"use client";

import { useMemo, useState } from "react";
import { diagnoseFeed, parseFeed, type FeedTable } from "./utils";

const SAMPLE = `id,title,description,link,image_link,availability,price,gtin,brand\nSKU-001,帆布トートバッグ,軽くて丈夫なトートバッグ,https://example.com/products/bag,https://example.com/images/bag.jpg,in_stock,2980 JPY,4901234567894,Sample\nSKU-002,,説明,invalid-url,https://example.com/a.jpg,available,1980,12345,Sample`;
const TEMPLATE = `id,title,description,link,image_link,availability,price,gtin,brand\nSKU-001,商品名,商品の説明,https://example.com/products/item,https://example.com/images/item.jpg,in_stock,2980 JPY,4901234567894,ブランド名`;

export function MerchantFeedCheckerPage() {
  const [table, setTable] = useState<FeedTable | null>(null);
  const [error, setError] = useState("");
  const issues = useMemo(() => (table ? diagnoseFeed(table) : []), [table]);
  const inspect = (text: string) => {
    try {
      setTable(parseFeed(text));
      setError("");
    } catch (caught) {
      setTable(null);
      setError(
        caught instanceof Error
          ? caught.message
          : "商品フィードを読み込めませんでした。",
      );
    }
  };
  const choose = async (file?: File) => {
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      setError("初期版では15MB以下のCSV・TSVを診断できます。");
      return;
    }
    inspect(await file.text());
  };
  const downloadTemplate = () => {
    const blob = new Blob(["\uFEFF", TEMPLATE], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "merchant-product-feed-template.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const errors = issues.filter((i) => i.severity === "error").length;
  const warnings = issues.length - errors;
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <p className="text-xs font-black uppercase tracking-[.2em] text-blue-600">
          EC広告
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          Google Merchant Center商品フィード診断
        </h1>
        <p className="mt-4 max-w-3xl leading-7 text-slate-600">
          商品フィードをアップロードする前に、必須属性、価格、在庫状況、URL、GTINを行番号付きで確認します。データはブラウザ内だけで処理します。
        </p>
        <div className="mt-8 grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
          <section>
            <h2 className="text-xl font-black">1. フィードを読み込む</h2>
            <label className="mt-4 block cursor-pointer rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center hover:border-blue-400">
              <input
                type="file"
                accept=".csv,.tsv,text/csv,text/tab-separated-values"
                className="sr-only"
                onChange={(e) => choose(e.target.files?.[0])}
              />
              <span className="text-3xl">🛍️</span>
              <strong className="mt-2 block">CSV・TSVを選択</strong>
              <span className="mt-1 block text-sm text-slate-500">
                UTF-8・15MBまで
              </span>
            </label>
            <button
              type="button"
              onClick={() => inspect(SAMPLE)}
              data-analytics-event="sample_load"
              data-analytics-tool-id="merchant-feed-checker"
              className="mt-3 w-full rounded-full border border-slate-300 px-5 py-3 text-sm font-bold"
            >
              問題入りサンプルで試す
            </button>
            <button
              type="button"
              onClick={downloadTemplate}
              data-analytics-event="tool_run"
              data-analytics-tool-id="merchant-feed-checker"
              className="mt-2 w-full rounded-full border border-slate-300 px-5 py-3 text-sm font-bold"
            >
              商品フィード用テンプレートCSVを保存
            </button>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              テンプレートには初期診断で使う主要属性と、入力形式の例を1商品分入れています。実際の商品情報へ置き換えてください。
            </p>
            {error && (
              <p
                role="alert"
                className="mt-4 rounded-xl bg-rose-50 p-4 text-sm font-bold text-rose-800"
              >
                {error}
              </p>
            )}
            <div className="mt-5 rounded-2xl border border-slate-200 p-4 text-sm leading-6 text-slate-600">
              <strong className="text-slate-900">公式仕様</strong>
              <br />
              <a
                className="font-bold text-blue-700 underline"
                href="https://support.google.com/merchants/answer/7052112?hl=ja"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Merchant Center 商品データ仕様
              </a>
              <p className="mt-2 text-xs">仕様確認日：2026年7月26日</p>
            </div>
          </section>
          <section>
            <h2 className="text-xl font-black">2. 診断結果</h2>
            {!table ? (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
                ファイルを選ぶと診断結果が表示されます。
              </div>
            ) : (
              <>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {[
                    {
                      value: table.rows.length,
                      label: "商品行",
                      boxClass: "bg-slate-50",
                      valueClass: "text-slate-800",
                    },
                    {
                      value: errors,
                      label: "エラー",
                      boxClass: "bg-rose-50",
                      valueClass: "text-rose-800",
                    },
                    {
                      value: warnings,
                      label: "警告",
                      boxClass: "bg-amber-50",
                      valueClass: "text-amber-800",
                    },
                  ].map(({ value, label, boxClass, valueClass }) => (
                    <div
                      key={label}
                      className={`rounded-2xl p-4 text-center ${boxClass}`}
                    >
                      <strong className={`text-2xl ${valueClass}`}>
                        {value}
                      </strong>
                      <span className="block text-xs font-bold text-slate-600">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 max-h-[32rem] space-y-2 overflow-y-auto">
                  {issues.length === 0 ? (
                    <p className="rounded-2xl bg-emerald-50 p-5 font-bold text-emerald-800">
                      ✓ 現在の診断項目では問題を検出しませんでした。
                    </p>
                  ) : (
                    issues.map((issue, index) => (
                      <article
                        key={`${issue.row}-${issue.field}-${index}`}
                        className={`rounded-xl border p-3 text-sm ${issue.severity === "error" ? "border-rose-200 bg-rose-50 text-rose-900" : "border-amber-200 bg-amber-50 text-amber-950"}`}
                      >
                        <div className="flex flex-wrap gap-2">
                          <strong>
                            {issue.severity === "error" ? "エラー" : "確認"}
                          </strong>
                          <span className="rounded bg-white/70 px-2 text-xs font-bold">
                            {issue.row ? `${issue.row}行目` : "列名"}
                          </span>
                          <code>{issue.field}</code>
                        </div>
                        <p className="mt-1 leading-6">{issue.message}</p>
                      </article>
                    ))
                  )}
                </div>
                <button
                  type="button"
                  data-analytics-event="tool_run"
                  data-analytics-tool-id="merchant-feed-checker"
                  className="sr-only"
                >
                  診断を実行
                </button>
              </>
            )}
          </section>
        </div>
        <p className="mt-8 border-t pt-5 text-xs leading-5 text-slate-500">
          本ツールはGoogleの公式ツールではありません。診断結果は商品承認や広告掲載を保証しません。最終判断はMerchant
          Centerの診断画面と最新の公式仕様で確認してください。
        </p>
      </section>
    </main>
  );
}
