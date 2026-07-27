"use client";

import { PremiumInterestCards } from "@sakupla/shared-ui/PremiumInterestCards";
import { useState, type Dispatch, type SetStateAction } from "react";
import {
  decodeUtf8,
  parseCsv,
  pivotTable,
  serializeCsv,
  unpivotTable,
  type Aggregate,
  type CsvTable,
  type ReshapeResult,
} from "./utils";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const PIVOT_SAMPLE = `地域,商品,月,売上
東日本,商品A,2026年1月,100
東日本,商品A,2026年1月,50
東日本,商品A,2026年2月,120
西日本,商品B,2026年1月,200
西日本,商品B,2026年2月,`;
const UNPIVOT_SAMPLE = `商品コード,商品名,2026年1月,2026年2月,2026年3月
P-001,春ジャケット,10,12,15
P-002,夏シャツ,20,,28`;
const PREMIUM_CANDIDATES = [
  {
    featureId: "reshape_recipe_save" as const,
    name: "縦横変換レシピ保存",
    description:
      "識別列、展開列、値列、集計方法を保存し、次回も同じ変換手順を呼び出せる候補です。",
  },
  {
    featureId: "batch_reshape" as const,
    name: "複数CSVの一括変換",
    description:
      "同じ列構成の複数CSVへ変換ルールを適用し、結果をまとめて保存する候補です。",
  },
];

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

export function CsvPivotReshapePage() {
  const [table, setTable] = useState<CsvTable | null>(null);
  const [fileName, setFileName] = useState("");
  const [mode, setMode] = useState<"pivot" | "unpivot">("pivot");
  const [idColumns, setIdColumns] = useState<string[]>([]);
  const [pivotColumn, setPivotColumn] = useState("");
  const [valueColumn, setValueColumn] = useState("");
  const [aggregate, setAggregate] = useState<Aggregate>("sum");
  const [valueColumns, setValueColumns] = useState<string[]>([]);
  const [fieldColumnName, setFieldColumnName] = useState("項目");
  const [outputValueColumnName, setOutputValueColumnName] = useState("値");
  const [result, setResult] = useState<ReshapeResult | null>(null);
  const [error, setError] = useState("");

  const setPivotDefaults = (next: CsvTable) => {
    setMode("pivot");
    setIdColumns(next.headers.slice(0, Math.min(2, next.headers.length - 2)));
    setPivotColumn(next.headers.at(-2) ?? "");
    setValueColumn(next.headers.at(-1) ?? "");
    setAggregate("sum");
    setValueColumns([]);
  };

  const setUnpivotDefaults = (next: CsvTable) => {
    setMode("unpivot");
    setIdColumns(next.headers.slice(0, Math.min(2, next.headers.length - 1)));
    setValueColumns(next.headers.slice(2));
    setPivotColumn("");
    setValueColumn("");
    setFieldColumnName("月");
    setOutputValueColumnName("数量");
  };

  const loadTable = (
    next: CsvTable,
    nextName: string,
    nextMode?: "pivot" | "unpivot",
  ) => {
    setTable(next);
    setFileName(nextName);
    if (nextMode === "unpivot") setUnpivotDefaults(next);
    else setPivotDefaults(next);
    setResult(null);
    setError("");
  };

  const loadFile = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setError("初期版では10MB以下のUTF-8 CSVを読み込めます。");
      return;
    }
    try {
      loadTable(
        parseCsv(decodeUtf8(await file.arrayBuffer())),
        file.name,
        mode,
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "CSVを読み込めませんでした。",
      );
    }
  };

  const toggleColumn = (
    setter: Dispatch<SetStateAction<string[]>>,
    column: string,
  ) => {
    setter((current) =>
      current.includes(column)
        ? current.filter((item) => item !== column)
        : [...current, column],
    );
    setResult(null);
  };

  const runReshape = () => {
    if (!table) return;
    try {
      setResult(
        mode === "pivot"
          ? pivotTable(table, {
              idColumns,
              pivotColumn,
              valueColumn,
              aggregate,
            })
          : unpivotTable(table, {
              idColumns,
              valueColumns,
              fieldColumnName,
              valueColumnName: outputValueColumnName,
            }),
      );
      setError("");
    } catch (caught) {
      setResult(null);
      setError(
        caught instanceof Error
          ? caught.message
          : "CSVを変換できませんでした。",
      );
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <p className="text-xs font-black uppercase tracking-[.2em] text-amber-700">
          EC・CSV
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          CSVピボット・縦横変換
        </h1>
        <p className="mt-4 max-w-4xl leading-7 text-slate-600">
          月・地域・商品が行ごとに並ぶCSVを集計表へ変えたり、月ごとの列が並ぶ表を取込用の縦持ちCSVへ変えたりできます。変換前後の行列数、空欄、重複した組み合わせを確認してから保存します。
        </p>

        <section
          aria-labelledby="quick-steps"
          className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5"
        >
          <h2 id="quick-steps" className="text-lg font-black">
            かんたん操作手順
          </h2>
          <ol className="mt-3 grid gap-3 text-sm text-slate-700 sm:grid-cols-4">
            {[
              "CSVを読み込む",
              "縦横の変換方法を選ぶ",
              "列と集計方法を選ぶ",
              "件数を確認して保存",
            ].map((step, index) => (
              <li key={step} className="flex items-start gap-2">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-amber-700 font-black text-white">
                  {index + 1}
                </span>
                <span className="font-bold leading-6">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <label className="mt-6 block cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center hover:border-amber-500">
          <input
            className="sr-only"
            type="file"
            accept=".csv,text/csv"
            onChange={(event) => void loadFile(event.target.files?.[0])}
          />
          <strong className="block text-slate-950">変換するCSV</strong>
          <span className="mt-1 block text-sm text-slate-500">
            {table
              ? `${fileName}・${table.rows.length}行・${table.headers.length}列`
              : "UTF-8・10MB以下、見出し行と入力例を含むCSV"}
          </span>
          <span className="mt-3 inline-block rounded-full bg-white px-4 py-2 text-xs font-bold shadow-sm">
            CSVを選択
          </span>
        </label>

        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <button
            type="button"
            onClick={() =>
              loadTable(
                parseCsv(PIVOT_SAMPLE),
                "sales-long-sample.csv",
                "pivot",
              )
            }
            data-analytics-event="sample_load"
            data-analytics-tool-id="csv-pivot-reshape"
            className="rounded-full border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900"
          >
            集計サンプルを読み込む
          </button>
          <button
            type="button"
            onClick={() => downloadCsv(PIVOT_SAMPLE, "csv-pivot-sample.csv")}
            className="rounded-full border border-slate-300 px-4 py-3 text-sm font-bold"
          >
            集計サンプルCSVを保存
          </button>
          <button
            type="button"
            onClick={() =>
              loadTable(
                parseCsv(UNPIVOT_SAMPLE),
                "sales-wide-sample.csv",
                "unpivot",
              )
            }
            data-analytics-event="sample_load"
            data-analytics-tool-id="csv-pivot-reshape"
            className="rounded-full border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900"
          >
            縦持ちサンプルを読み込む
          </button>
          <button
            type="button"
            onClick={() =>
              downloadCsv(UNPIVOT_SAMPLE, "csv-unpivot-template.csv")
            }
            className="rounded-full border border-slate-300 px-4 py-3 text-sm font-bold"
          >
            縦持ちテンプレートを保存
          </button>
        </div>
        <p className="mt-3 text-xs leading-5 text-slate-500">
          集計サンプルは「地域・商品・月・売上」、縦持ちテンプレートは「商品コード・商品名・月別数量」の列名と入力例を含みます。入力と結果は外部へ送信しません。
        </p>

        {table ? (
          <section
            aria-labelledby="settings-title"
            className="mt-8 border-t border-slate-200 pt-7"
          >
            <h2
              id="settings-title"
              className="text-2xl font-black text-slate-950"
            >
              変換方法と列を選択
            </h2>
            <fieldset className="mt-4 grid gap-3 sm:grid-cols-2">
              <legend className="sr-only">変換方法</legend>
              <label className="rounded-2xl border border-slate-200 p-4 text-sm font-bold">
                <input
                  type="radio"
                  name="reshape-mode"
                  checked={mode === "pivot"}
                  onChange={() => setPivotDefaults(table)}
                  className="mr-2"
                />
                ピボット：行の項目を列へ展開して集計
              </label>
              <label className="rounded-2xl border border-slate-200 p-4 text-sm font-bold">
                <input
                  type="radio"
                  name="reshape-mode"
                  checked={mode === "unpivot"}
                  onChange={() => setUnpivotDefaults(table)}
                  className="mr-2"
                />
                縦持ち変換：複数列を項目・値の行へ変換
              </label>
            </fieldset>

            <fieldset className="mt-5">
              <legend className="text-sm font-black">
                識別列（結果でも残す列）
              </legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {table.headers.map((header) => (
                  <label
                    key={header}
                    className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm font-bold"
                  >
                    <input
                      type="checkbox"
                      checked={idColumns.includes(header)}
                      onChange={() => toggleColumn(setIdColumns, header)}
                      className="size-5"
                    />
                    {header}
                  </label>
                ))}
              </div>
            </fieldset>

            {mode === "pivot" ? (
              <div className="mt-5 grid gap-4 lg:grid-cols-3">
                <label className="text-sm font-bold">
                  展開列（新しい列名になる値）
                  <select
                    aria-label="展開列"
                    value={pivotColumn}
                    onChange={(event) => {
                      setPivotColumn(event.target.value);
                      setResult(null);
                    }}
                    className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3"
                  >
                    <option value="">選択してください</option>
                    {table.headers.map((header) => (
                      <option key={header}>{header}</option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-bold">
                  値列（集計する値）
                  <select
                    aria-label="値列"
                    value={valueColumn}
                    onChange={(event) => {
                      setValueColumn(event.target.value);
                      setResult(null);
                    }}
                    className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3"
                  >
                    <option value="">選択してください</option>
                    {table.headers.map((header) => (
                      <option key={header}>{header}</option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-bold">
                  集計方法
                  <select
                    aria-label="集計方法"
                    value={aggregate}
                    onChange={(event) => {
                      setAggregate(event.target.value as Aggregate);
                      setResult(null);
                    }}
                    className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3"
                  >
                    <option value="count">件数</option>
                    <option value="sum">合計</option>
                    <option value="average">平均</option>
                    <option value="min">最小</option>
                    <option value="max">最大</option>
                  </select>
                </label>
              </div>
            ) : (
              <div className="mt-5">
                <fieldset>
                  <legend className="text-sm font-black">縦持ちにする列</legend>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {table.headers.map((header) => (
                      <label
                        key={header}
                        className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm font-bold"
                      >
                        <input
                          type="checkbox"
                          checked={valueColumns.includes(header)}
                          onChange={() => toggleColumn(setValueColumns, header)}
                          className="size-5"
                        />
                        {header}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-bold">
                    項目名を入れる出力列名
                    <input
                      value={fieldColumnName}
                      onChange={(event) => {
                        setFieldColumnName(event.target.value);
                        setResult(null);
                      }}
                      className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-3"
                    />
                  </label>
                  <label className="text-sm font-bold">
                    値を入れる出力列名
                    <input
                      value={outputValueColumnName}
                      onChange={(event) => {
                        setOutputValueColumnName(event.target.value);
                        setResult(null);
                      }}
                      className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-3"
                    />
                  </label>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={runReshape}
              data-analytics-event="tool_run"
              data-analytics-tool-id="csv-pivot-reshape"
              className="mt-6 w-full rounded-full bg-amber-700 px-5 py-4 font-black text-white hover:bg-amber-800"
            >
              変換結果を確認
            </button>
          </section>
        ) : null}

        {error ? (
          <p
            role="alert"
            className="mt-5 rounded-xl bg-rose-50 p-4 text-sm font-bold text-rose-800"
          >
            {error}
          </p>
        ) : null}

        {table && result ? (
          <section
            aria-labelledby="result-title"
            className="mt-8 border-t border-slate-200 pt-7"
          >
            <p className="text-sm font-bold text-emerald-700">変換結果</p>
            <h2
              id="result-title"
              className="mt-1 text-2xl font-black text-slate-950"
            >
              {result.outputRows}行・{result.outputColumns}列のCSV
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                ["変換前", `${result.inputRows}行・${result.inputColumns}列`],
                ["変換後", `${result.outputRows}行・${result.outputColumns}列`],
                ["値の空欄", `${result.blankValueCount}件`],
                ["重複組み合わせ", `${result.duplicateCombinationCount}件`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-slate-50 p-4">
                  <span className="text-xs font-bold text-slate-500">
                    {label}
                  </span>
                  <strong className="mt-1 block text-xl">{value}</strong>
                </div>
              ))}
            </div>
            {result.blankValueCount ? (
              <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-950">
                値列の空欄が{result.blankValueCount}
                件あります。合計・平均・最小・最大では空欄を計算へ含めず、全件空欄の組み合わせは空欄で出力します。
              </p>
            ) : null}
            {result.duplicateCombinationCount ? (
              <p className="mt-3 rounded-xl bg-blue-50 p-4 text-sm leading-6 text-blue-950">
                同じ識別列と展開列の組み合わせが
                {result.duplicateCombinationCount}
                行分重複しています。選んだ集計方法で1セルへまとめた結果です。
              </p>
            ) : null}
            <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    {result.output.headers.map((header) => (
                      <th key={header} className="px-4 py-3 font-black">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.output.rows.slice(0, 10).map((row, index) => (
                    <tr key={index} className="border-t border-slate-200">
                      {result.output.headers.map((header) => (
                        <td key={header} className="px-4 py-3">
                          {row[header] || "（空欄）"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              onClick={() =>
                downloadCsv(
                  serializeCsv(result.output),
                  "csv-pivot-reshape-result.csv",
                )
              }
              className="mt-5 w-full rounded-full bg-emerald-700 px-5 py-4 font-black text-white sm:w-auto"
            >
              変換CSVを保存
            </button>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              単純に表を90度回転する機能ではありません。識別列を保ち、項目の値を列へ集計するか、複数列を項目・値の行へ展開します。保存前に行列数と空欄を確認してください。
            </p>
            <PremiumInterestCards
              toolId="csv-pivot-reshape"
              placement="result_after"
              candidates={PREMIUM_CANDIDATES}
            />
          </section>
        ) : null}

        <div className="mt-7 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
          <p>
            初期版はUTF-8・10MB以下のカンマ区切りCSVを対象に、1つの値列を集計または複数列を縦持ちへ変換します。非数値は数値集計から黙って除外せず、元行番号付きで修正を求めます。
          </p>
          <p className="mt-2">
            一般的なCSV形式の根拠：
            <a
              href="https://www.rfc-editor.org/rfc/rfc4180"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-blue-700 underline"
            >
              RFC 4180
            </a>
            、
            <a
              href="https://www.w3.org/TR/tabular-data-model/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-blue-700 underline"
            >
              W3C CSV on the Web
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
