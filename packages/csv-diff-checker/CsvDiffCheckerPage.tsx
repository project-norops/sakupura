"use client";

import { useMemo, useState } from "react";
import { compareCsv, parseCsv, serializeDiff, type CsvTable } from "./utils";

const BEFORE = `sku,title,price,stock\nA-001,トートバッグ,2800,12\nA-002,マグカップ,1800,8\nA-003,ポーチ,1200,5`;
const AFTER = `sku,title,price,stock\nA-001,トートバッグ,2980,10\nA-002,マグカップ,1800,8\nA-004,ボトル,2200,6`;

function downloadCsv(content: string, fileName: string) {
  const blob = new Blob(["\uFEFF", content], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function CsvDiffCheckerPage() {
  const [before, setBefore] = useState<CsvTable | null>(null);
  const [after, setAfter] = useState<CsvTable | null>(null);
  const [keyField, setKeyField] = useState("");
  const [error, setError] = useState("");
  const commonFields = useMemo(
    () =>
      before && after
        ? before.headers.filter((field) => after.headers.includes(field))
        : [],
    [before, after],
  );
  const comparison = useMemo(() => {
    if (!before || !after || !keyField) return { result: [], error: "" };
    try {
      return { result: compareCsv(before, after, keyField), error: "" };
    } catch (caught) {
      return {
        result: [],
        error:
          caught instanceof Error ? caught.message : "比較できませんでした。",
      };
    }
  }, [before, after, keyField]);
  const result = comparison.result;
  const changed = result.filter((row) => row.status !== "unchanged");
  const loadFile = async (
    file: File | undefined,
    setter: (value: CsvTable | null) => void,
  ) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError("初期版では10MB以下のCSVを比較できます。");
      return;
    }
    try {
      setter(parseCsv(await file.text()));
      setError("");
      setKeyField("");
    } catch (caught) {
      setter(null);
      setError(
        caught instanceof Error
          ? caught.message
          : "CSVを読み込めませんでした。",
      );
    }
  };
  const sample = () => {
    setBefore(parseCsv(BEFORE));
    setAfter(parseCsv(AFTER));
    setKeyField("sku");
    setError("");
  };
  const download = () => {
    const blob = new Blob(["\uFEFF", serializeDiff(result)], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "csv-diff-result.csv";
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <p className="text-xs font-black uppercase tracking-[.2em] text-blue-600">
          データ整理
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          CSV差分比較・変更抽出ツール
        </h1>
        <p className="mt-4 max-w-3xl leading-7 text-slate-600">
          商品一覧や会員名簿などの変更前・変更後CSVを比べ、追加・削除された行と、書き換わったセルを見つけます。SKUや会員IDのような「同じデータを見分ける列」を使うため、行の並び順が変わっていても比較できます。ファイルは外部送信しません。
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {[
            ["変更前CSV", setBefore, before],
            ["変更後CSV", setAfter, after],
          ].map(([label, setter, table], index) => (
            <label
              key={label as string}
              className="cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center hover:border-blue-400"
            >
              <input
                className="sr-only"
                type="file"
                accept=".csv,text/csv"
                onChange={(event) =>
                  loadFile(
                    event.target.files?.[0],
                    setter as (value: CsvTable | null) => void,
                  )
                }
              />
              <span className="text-2xl">{index === 0 ? "1️⃣" : "2️⃣"}</span>
              <strong className="mt-2 block text-slate-900">
                {label as string}
              </strong>
              <span className="mt-1 block text-sm text-slate-500">
                {table
                  ? `${(table as CsvTable).rows.length}行を読込済み`
                  : "クリックして選択"}
              </span>
            </label>
          ))}
        </div>
        <button
          type="button"
          onClick={sample}
          data-analytics-event="sample_load"
          data-analytics-tool-id="csv-diff-checker"
          className="mt-3 w-full rounded-full border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 hover:border-blue-400"
        >
          サンプルで比較する
        </button>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => downloadCsv(BEFORE, "csv-diff-before-template.csv")}
            data-analytics-event="tool_run"
            data-analytics-tool-id="csv-diff-checker"
            className="rounded-full border border-slate-300 px-4 py-3 text-sm font-bold text-slate-700 hover:border-blue-400"
          >
            変更前テンプレートCSVを保存
          </button>
          <button
            type="button"
            onClick={() => downloadCsv(AFTER, "csv-diff-after-template.csv")}
            data-analytics-event="tool_run"
            data-analytics-tool-id="csv-diff-checker"
            className="rounded-full border border-slate-300 px-4 py-3 text-sm font-bold text-slate-700 hover:border-blue-400"
          >
            変更後テンプレートCSVを保存
          </button>
        </div>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          テンプレートの列名は一例です。2つのCSVで共通する列名を使い、SKU・商品コード・会員IDなど重複しない値を入れてください。
        </p>
        {before && after && (
          <div className="mt-6">
            <label
              className="text-sm font-bold text-slate-700"
              htmlFor="diff-key"
            >
              同じ行を見分ける列（SKU・商品コード・会員IDなど）
            </label>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              変更前と変更後で同じ商品・同じ人を結び付ける、重複しない番号の列を選びます。例：SKUが「A-001」同士なら同じ商品として比較します。
            </p>
            <select
              id="diff-key"
              value={keyField}
              onChange={(event) => setKeyField(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
            >
              <option value="">選択してください</option>
              {commonFields.map((field) => (
                <option key={field}>{field}</option>
              ))}
            </select>
          </div>
        )}
        {(error || comparison.error) && (
          <p
            role="alert"
            className="mt-4 rounded-xl bg-rose-50 p-4 text-sm font-bold text-rose-800"
          >
            {error || comparison.error}
          </p>
        )}
        <section className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-black text-slate-950">比較結果</h2>
            {keyField && (
              <span className="text-sm font-bold text-slate-500">
                追加 {result.filter((r) => r.status === "added").length}・削除{" "}
                {result.filter((r) => r.status === "removed").length}・変更{" "}
                {result.filter((r) => r.status === "changed").length}
              </span>
            )}
          </div>
          {!keyField ? (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
              2つのCSVとキー列を選ぶと結果が表示されます。
            </div>
          ) : changed.length === 0 ? (
            <div className="mt-4 rounded-2xl bg-emerald-50 p-5 font-bold text-emerald-800">
              ✓ 差分はありません。
            </div>
          ) : (
            <div className="mt-4 max-h-[32rem] space-y-3 overflow-y-auto">
              {changed.map((row) => (
                <article
                  key={row.key}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <div className="flex gap-2">
                    <strong className="text-slate-950">{row.key}</strong>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-bold ${row.status === "added" ? "bg-emerald-100 text-emerald-800" : row.status === "removed" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-900"}`}
                    >
                      {row.status === "added"
                        ? "追加"
                        : row.status === "removed"
                          ? "削除"
                          : "変更"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    {row.changedFields.join("、")}
                  </p>
                  {row.status === "changed" && (
                    <div className="mt-3 space-y-2">
                      {row.changedFields.map((field) => (
                        <div
                          key={field}
                          className="grid gap-1 rounded-xl bg-slate-50 p-3 text-sm sm:grid-cols-[8rem_1fr_1fr]"
                        >
                          <strong>{field}</strong>
                          <span className="text-rose-700">
                            変更前: {row.before?.[field] || "（空欄）"}
                          </span>
                          <span className="text-emerald-700">
                            変更後: {row.after?.[field] || "（空欄）"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
        {changed.length > 0 && (
          <button
            type="button"
            onClick={download}
            data-analytics-event="tool_run"
            data-analytics-tool-id="csv-diff-checker"
            className="mt-6 w-full rounded-full bg-blue-600 px-5 py-4 font-black text-white hover:bg-blue-700"
          >
            差分一覧をCSV保存
          </button>
        )}
      </section>
    </main>
  );
}
