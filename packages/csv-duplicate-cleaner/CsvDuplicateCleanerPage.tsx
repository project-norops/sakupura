"use client";

import { PremiumInterestCards } from "@sakupla/shared-ui/PremiumInterestCards";
import { useMemo, useState } from "react";
import {
  DEFAULT_NORMALIZATION,
  analyzeDuplicates,
  buildCleanedOutputs,
  decodeUtf8,
  parseCsv,
  serializeCsv,
  type CsvTable,
  type DuplicateAnalysis,
  type NormalizationOptions,
} from "./utils";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const SAMPLE_CSV = `顧客ID,氏名,メール,都道府県\nC-001,山田 太郎,TARO@example.com,東京都\nC-002,山田太郎,taro@example.com,東京\nC-003,佐藤花子,hanako@example.com,大阪府\nC-004,山田 太郎,taro-old@example.com,東京都`;
const TEMPLATE_CSV = `顧客ID,氏名,メール,都道府県\nC-001,山田 太郎,taro@example.com,東京都`;
const PREMIUM_CANDIDATES = [
  {
    featureId: "cleaning_rule_save" as const,
    name: "整理ルール保存",
    description:
      "キー列と正規化条件を保存し、次回も同じ確認ルールを呼び出せる候補です。",
  },
  {
    featureId: "batch_files" as const,
    name: "複数ファイル一括処理",
    description:
      "同じ整理ルールで複数CSVの重複候補をまとめて確認する候補です。",
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

export function CsvDuplicateCleanerPage() {
  const [table, setTable] = useState<CsvTable | null>(null);
  const [fileName, setFileName] = useState("");
  const [keyHeader, setKeyHeader] = useState("");
  const [options, setOptions] = useState<NormalizationOptions>(
    DEFAULT_NORMALIZATION,
  );
  const [analysis, setAnalysis] = useState<DuplicateAnalysis | null>(null);
  const [keepByGroup, setKeepByGroup] = useState<Record<string, number>>({});
  const [error, setError] = useState("");

  const confirmedGroups = analysis
    ? analysis.groups.filter((group) => keepByGroup[group.id] !== undefined)
        .length
    : 0;
  const allGroupsConfirmed = Boolean(
    analysis && confirmedGroups === analysis.groups.length,
  );
  const outputCounts = useMemo(() => {
    if (!table || !analysis || !allGroupsConfirmed) return null;
    const outputs = buildCleanedOutputs(
      table,
      analysis.groups,
      keepByGroup,
    );
    return {
      cleaned: outputs.cleaned.rows.length,
      excluded: outputs.excluded.rows.length,
    };
  }, [allGroupsConfirmed, analysis, keepByGroup, table]);

  const resetAnalysis = () => {
    setAnalysis(null);
    setKeepByGroup({});
    setError("");
  };

  const loadTable = (nextTable: CsvTable, nextFileName: string) => {
    setTable(nextTable);
    setFileName(nextFileName);
    setKeyHeader(nextTable.headers[0] ?? "");
    resetAnalysis();
  };

  const loadFile = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setError("初期版では10MB以下のUTF-8 CSVを読み込めます。");
      return;
    }
    try {
      loadTable(parseCsv(decodeUtf8(await file.arrayBuffer())), file.name);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "CSVを読み込めませんでした。",
      );
    }
  };

  const loadSample = () => {
    const sample = parseCsv(SAMPLE_CSV);
    loadTable(sample, "csv-duplicate-cleaner-sample.csv");
    setKeyHeader("氏名");
    setOptions({ ...DEFAULT_NORMALIZATION, ignoreSymbols: true });
  };

  const runAnalysis = () => {
    if (!table || !keyHeader) return;
    try {
      setAnalysis(analyzeDuplicates(table, keyHeader, options));
      setKeepByGroup({});
      setError("");
    } catch (caught) {
      setAnalysis(null);
      setError(
        caught instanceof Error
          ? caught.message
          : "重複候補を確認できませんでした。",
      );
    }
  };

  const saveOutput = (kind: "cleaned" | "excluded") => {
    if (!table || !analysis || !allGroupsConfirmed) return;
    const outputs = buildCleanedOutputs(
      table,
      analysis.groups,
      keepByGroup,
    );
    downloadCsv(
      serializeCsv(outputs[kind]),
      kind === "cleaned"
        ? "csv-duplicate-cleaner-cleaned.csv"
        : "csv-duplicate-cleaner-excluded.csv",
    );
  };

  const toggleOption = (key: keyof NormalizationOptions) => {
    setOptions((current) => ({ ...current, [key]: !current[key] }));
    resetAnalysis();
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <p className="text-xs font-black uppercase tracking-[.2em] text-amber-700">
          EC・CSV
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          CSV重複・表記ゆれクリーナー
        </h1>
        <p className="mt-4 max-w-4xl leading-7 text-slate-600">
          キー列を選び、完全一致と表記ゆれ候補をグループで確認します。残す行を利用者が決めてから、整理済みCSVと除外行CSVを保存できます。曖昧な候補を自動削除せず、ファイル内容はブラウザ内だけで処理します。
        </p>

        <section
          className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-4 sm:p-5"
          aria-labelledby="quick-start-heading"
        >
          <h2 id="quick-start-heading" className="text-lg font-black">
            かんたん操作手順
          </h2>
          <ol className="mt-3 grid gap-3 text-sm text-slate-700 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "CSVを読み込む",
              "キー列と表記ゆれ条件を選ぶ",
              "候補ごとに残す行を選ぶ",
              "整理済み・除外行CSVを保存する",
            ].map((text, index) => (
              <li key={text} className="flex items-start gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-700 text-xs font-black text-white">
                  {index + 1}
                </span>
                <span className="font-bold leading-6">{text}</span>
              </li>
            ))}
          </ol>
        </section>

        <label className="mt-7 block cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center hover:border-amber-500">
          <input
            className="sr-only"
            type="file"
            accept=".csv,text/csv"
            onChange={(event) => loadFile(event.target.files?.[0])}
          />
          <strong className="block text-slate-950">確認するCSV</strong>
          <span className="mt-1 block text-sm text-slate-500">
            {table
              ? `${fileName}・${table.rows.length}行・${table.headers.length}列`
              : "見出し行と1行以上のデータを含むUTF-8 CSV"}
          </span>
          <span className="mt-3 inline-block rounded-full bg-white px-4 py-2 text-xs font-bold shadow-sm">
            CSVを選択
          </span>
        </label>

        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <button
            type="button"
            onClick={loadSample}
            data-analytics-event="sample_load"
            data-analytics-tool-id="csv-duplicate-cleaner"
            className="rounded-full border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900 hover:border-amber-500"
          >
            操作サンプルを読み込む
          </button>
          <button
            type="button"
            onClick={() =>
              downloadCsv(SAMPLE_CSV, "csv-duplicate-cleaner-sample.csv")
            }
            className="rounded-full border border-slate-300 px-4 py-3 text-sm font-bold text-slate-700 hover:border-amber-500"
          >
            入力サンプルCSVを保存
          </button>
          <button
            type="button"
            onClick={() =>
              downloadCsv(TEMPLATE_CSV, "csv-duplicate-cleaner-template.csv")
            }
            className="rounded-full border border-slate-300 px-4 py-3 text-sm font-bold text-slate-700 hover:border-amber-500"
          >
            入力テンプレートCSVを保存
          </button>
        </div>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          初期版はUTF-8・10MB以下のCSVが対象です。空のキー値は重複判定から除外して元行番号を表示します。入力内容や整理結果は外部へ送信しません。
          CSVは
          <a
            href="https://www.rfc-editor.org/rfc/rfc4180"
            target="_blank"
            rel="noreferrer"
            className="mx-1 font-bold text-blue-700 underline"
          >
            RFC 4180
          </a>
          、全角半角の正規化は
          <a
            href="https://unicode.org/reports/tr15/"
            target="_blank"
            rel="noreferrer"
            className="mx-1 font-bold text-blue-700 underline"
          >
            Unicode Normalization Forms
          </a>
          を基準にします。
        </p>

        {table ? (
          <section className="mt-8" aria-labelledby="condition-heading">
            <h2 id="condition-heading" className="text-2xl font-black">
              重複確認の条件
            </h2>
            <label className="mt-4 block max-w-xl text-sm font-bold text-slate-700">
              重複確認に使うキー列
              <select
                value={keyHeader}
                onChange={(event) => {
                  setKeyHeader(event.target.value);
                  resetAnalysis();
                }}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-3"
              >
                {table.headers.map((header) => (
                  <option key={header}>{header}</option>
                ))}
              </select>
            </label>

            <fieldset className="mt-5">
              <legend className="text-sm font-black text-slate-800">
                表記ゆれとして同じ値に寄せる条件
              </legend>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {(
                  [
                    ["trim", "前後の空白を無視"],
                    ["collapseWhitespace", "連続空白を1つにする"],
                    ["normalizeWidth", "全角・半角をそろえる"],
                    ["ignoreCase", "英字の大文字・小文字を無視"],
                    ["ignoreSymbols", "空白・ハイフン・指定記号を無視"],
                  ] as const
                ).map(([key, label]) => (
                  <label
                    key={key}
                    className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm font-bold"
                  >
                    <input
                      type="checkbox"
                      checked={options[key]}
                      onChange={() => toggleOption(key)}
                      className="size-5"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>

            <button
              type="button"
              onClick={runAnalysis}
              data-analytics-event="tool_run"
              data-analytics-tool-id="csv-duplicate-cleaner"
              data-analytics-platform="browser"
              className="mt-5 w-full rounded-full bg-blue-600 px-5 py-4 font-black text-white hover:bg-blue-700"
            >
              重複・表記ゆれ候補を確認
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

        {analysis ? (
          <section className="mt-8" aria-labelledby="result-heading">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-emerald-700">確認結果</p>
                <h2 id="result-heading" className="mt-1 text-2xl font-black">
                  {analysis.groups.length}グループ・
                  {analysis.duplicateRowCount}行の候補
                </h2>
              </div>
              <p className="text-sm font-bold text-slate-600" aria-live="polite">
                残す行を選択済み {confirmedGroups} / {analysis.groups.length}
              </p>
            </div>

            {analysis.blankKeyRows.length ? (
              <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm font-bold text-amber-900">
                キーが空のため判定しなかった元行：
                {analysis.blankKeyRows.join("、")}
              </p>
            ) : null}

            {analysis.groups.length ? (
              <div className="mt-5 space-y-4">
                {analysis.groups.map((group, groupIndex) => (
                  <fieldset
                    key={group.id}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <legend className="px-2 font-black text-slate-950">
                      候補 {groupIndex + 1}・
                      {group.matchType === "exact"
                        ? "完全一致"
                        : "表記ゆれ候補"}
                    </legend>
                    <p className="mt-1 break-words text-xs text-slate-500">
                      正規化後のキー：{group.normalizedKey}
                    </p>
                    <div className="mt-3 grid gap-3 lg:grid-cols-2">
                      {group.rows.map((candidate) => (
                        <label
                          key={candidate.rowIndex}
                          className={`block cursor-pointer rounded-xl border p-4 ${
                            keepByGroup[group.id] === candidate.rowIndex
                              ? "border-blue-500 bg-blue-50"
                              : "border-slate-200 bg-white"
                          }`}
                        >
                          <span className="flex items-center gap-2 font-black">
                            <input
                              type="radio"
                              name={group.id}
                              value={candidate.rowIndex}
                              checked={
                                keepByGroup[group.id] === candidate.rowIndex
                              }
                              onChange={() =>
                                setKeepByGroup((current) => ({
                                  ...current,
                                  [group.id]: candidate.rowIndex,
                                }))
                              }
                            />
                            元行 {candidate.sourceLine} を残す
                          </span>
                          <span className="mt-2 block break-words text-sm text-slate-700">
                            {table?.headers
                              .slice(0, 4)
                              .map(
                                (header) =>
                                  `${header}: ${candidate.row[header] || "（空欄）"}`,
                              )
                              .join(" ／ ")}
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                ))}
              </div>
            ) : (
              <p className="mt-5 rounded-xl bg-emerald-50 p-4 font-bold text-emerald-900">
                現在の条件では重複候補はありません。全行を整理済みCSVとして保存できます。
              </p>
            )}

            <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
              <strong>監査列を追加します：</strong>
              整理済みCSVには元行番号、除外行CSVには元行番号・除外理由・残した元行番号を追加します。元データ自体は変更しません。
              {outputCounts
                ? ` 保存予定は整理済み${outputCounts.cleaned}行、除外${outputCounts.excluded}行です。`
                : " 候補ごとに残す行を選ぶと保存できます。"}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                disabled={!allGroupsConfirmed}
                onClick={() => saveOutput("cleaned")}
                className="rounded-full bg-emerald-600 px-5 py-4 font-black text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                整理済みCSVを保存
              </button>
              <button
                type="button"
                disabled={!allGroupsConfirmed}
                onClick={() => saveOutput("excluded")}
                className="rounded-full border border-slate-300 px-5 py-4 font-black text-slate-800 hover:border-slate-500 disabled:cursor-not-allowed disabled:text-slate-400"
              >
                除外行CSVを保存
              </button>
            </div>

            <PremiumInterestCards
              toolId="csv-duplicate-cleaner"
              placement="result_after"
              candidates={PREMIUM_CANDIDATES}
            />
          </section>
        ) : null}
      </section>
    </main>
  );
}
