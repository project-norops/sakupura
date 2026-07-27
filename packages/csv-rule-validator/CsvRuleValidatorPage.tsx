"use client";

import { PremiumInterestCards } from "@sakupla/shared-ui/PremiumInterestCards";
import { useState } from "react";
import {
  buildErrorCsv,
  buildValidationCsv,
  createDefaultRule,
  decodeUtf8,
  parseCsv,
  serializeCsv,
  suggestType,
  validateTable,
  type ColumnRule,
  type CsvTable,
  type RuleType,
  type ValidationResult,
} from "./utils";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const SAMPLE_CSV = `商品コード,商品名,価格,販売開始日,状態
P-001,春ジャケット,12800,2026-03-01,販売中
P-002,,未定,2026-02-30,販売中
P-001,限定ロングネームジャケット,500,2026-03-05,確認中
P-004,夏シャツ,6800,2026-03-10,販売終了`;
const TEMPLATE_CSV = `商品コード,商品名,価格,販売開始日,状態
P-001,春ジャケット,12800,2026-03-01,販売中`;
const PREMIUM_CANDIDATES = [
  {
    featureId: "validation_rule_save" as const,
    name: "検証ルール保存",
    description:
      "列ごとの必須・型・値域などの設定を保存し、次回も同じ検証ルールを呼び出せる候補です。",
  },
  {
    featureId: "batch_validation" as const,
    name: "複数ファイル一括検証",
    description:
      "同じルールで複数のCSVをまとめて検証し、結果を一覧化する候補です。",
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

function sampleRules(): Record<string, ColumnRule> {
  return {
    商品コード: {
      ...createDefaultRule(),
      required: true,
      maxLength: "10",
      unique: true,
    },
    商品名: {
      ...createDefaultRule(),
      required: true,
      maxLength: "12",
    },
    価格: {
      ...createDefaultRule(),
      type: "number",
      required: true,
      min: "1000",
      max: "1000000",
    },
    販売開始日: {
      ...createDefaultRule(),
      type: "date",
      required: true,
      min: "2026-01-01",
    },
    状態: {
      ...createDefaultRule(),
      required: true,
      allowedValues: "販売中,販売終了",
    },
  };
}

const typeLabel: Record<RuleType, string> = {
  string: "文字列",
  number: "数値",
  date: "日付（YYYY-MM-DD）",
};

export function CsvRuleValidatorPage() {
  const [table, setTable] = useState<CsvTable | null>(null);
  const [fileName, setFileName] = useState("");
  const [rules, setRules] = useState<Record<string, ColumnRule>>({});
  const [suggestions, setSuggestions] = useState<Record<string, RuleType>>({});
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [error, setError] = useState("");

  const loadTable = (nextTable: CsvTable, nextFileName: string) => {
    setTable(nextTable);
    setFileName(nextFileName);
    setRules(
      Object.fromEntries(
        nextTable.headers.map((header) => [header, createDefaultRule()]),
      ),
    );
    setSuggestions(
      Object.fromEntries(
        nextTable.headers.map((header) => [
          header,
          suggestType(nextTable.rows.map((row) => row[header] ?? "")),
        ]),
      ),
    );
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
    loadTable(sample, "csv-rule-validator-sample.csv");
    setRules(sampleRules());
  };

  const updateRule = <Key extends keyof ColumnRule>(
    header: string,
    key: Key,
    value: ColumnRule[Key],
  ) => {
    setRules((current) => ({
      ...current,
      [header]: { ...(current[header] ?? createDefaultRule()), [key]: value },
    }));
    setResult(null);
    setError("");
  };

  const runValidation = () => {
    if (!table) return;
    const nextResult = validateTable(table, rules);
    setResult(nextResult);
    setError("");
  };

  const saveOutput = (kind: "result" | "errors") => {
    if (!table || !result) return;
    const output =
      kind === "result"
        ? buildValidationCsv(table, result)
        : buildErrorCsv(result);
    downloadCsv(
      serializeCsv(output),
      kind === "result"
        ? "csv-rule-validator-result.csv"
        : "csv-rule-validator-errors.csv",
    );
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <p className="text-xs font-black uppercase tracking-[.2em] text-amber-700">
          EC・CSV
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          CSVルール検証・データ品質チェック
        </h1>
        <p className="mt-4 max-w-4xl leading-7 text-slate-600">
          CSVの各列に「必須」「数値」「日付」「文字数」「許可する値」「重複禁止」などのルールを設定し、取り込み前に不備をまとめて確認できます。元行番号付きの指摘一覧と検証結果CSVを端末内だけで作成します。
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
              "列ごとの検証ルールを決める",
              "エラー行と理由を確認する",
              "結果CSV・エラー一覧を保存する",
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
          <strong className="block text-slate-950">検証するCSV</strong>
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
            data-analytics-tool-id="csv-rule-validator"
            className="rounded-full border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900 hover:border-amber-500"
          >
            指摘例入りサンプルを読み込む
          </button>
          <button
            type="button"
            onClick={() =>
              downloadCsv(SAMPLE_CSV, "csv-rule-validator-sample.csv")
            }
            className="rounded-full border border-slate-300 px-4 py-3 text-sm font-bold text-slate-700 hover:border-amber-500"
          >
            入力サンプルCSVを保存
          </button>
          <button
            type="button"
            onClick={() =>
              downloadCsv(TEMPLATE_CSV, "csv-rule-validator-template.csv")
            }
            className="rounded-full border border-slate-300 px-4 py-3 text-sm font-bold text-slate-700 hover:border-amber-500"
          >
            入力テンプレートCSVを保存
          </button>
        </div>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          初期版はUTF-8・10MB以下のCSVが対象です。型候補は参考表示だけで、自動確定しません。入力内容・ルール・検証結果は外部へ送信しません。一般的なCSV形式は
          <a
            href="https://www.rfc-editor.org/rfc/rfc4180"
            target="_blank"
            rel="noreferrer"
            className="mx-1 font-bold text-blue-700 underline"
          >
            RFC 4180
          </a>
          と
          <a
            href="https://www.w3.org/TR/tabular-data-model/"
            target="_blank"
            rel="noreferrer"
            className="mx-1 font-bold text-blue-700 underline"
          >
            W3C CSV on the Web
          </a>
          を参照しています。
        </p>

        {table ? (
          <section className="mt-8" aria-labelledby="rules-heading">
            <div>
              <p className="text-sm font-bold text-blue-700">検証条件</p>
              <h2 id="rules-heading" className="mt-1 text-2xl font-black">
                列ごとのルールを確認
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                読み取った値から型候補を表示しますが、設定には反映していません。「候補を反映」または種類の選択で利用者が確定してください。
              </p>
            </div>

            <div className="mt-5 space-y-4">
              {table.headers.map((header) => {
                const rule = rules[header] ?? createDefaultRule();
                const suggestion = suggestions[header] ?? "string";
                return (
                  <fieldset
                    key={header}
                    className="rounded-2xl border border-slate-200 p-4 sm:p-5"
                  >
                    <legend className="px-2 text-lg font-black text-slate-950">
                      {header}
                    </legend>
                    <div className="grid gap-4 lg:grid-cols-3">
                      <label className="text-sm font-bold text-slate-700">
                        データの種類
                        <select
                          aria-label={`${header}のデータの種類`}
                          value={rule.type}
                          onChange={(event) =>
                            updateRule(
                              header,
                              "type",
                              event.target.value as RuleType,
                            )
                          }
                          className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-3"
                        >
                          <option value="string">文字列</option>
                          <option value="number">数値</option>
                          <option value="date">日付（YYYY-MM-DD）</option>
                        </select>
                      </label>
                      <div className="rounded-xl bg-blue-50 p-3 text-sm text-blue-950">
                        <span className="block font-bold">
                          読み取り候補：{typeLabel[suggestion]}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateRule(header, "type", suggestion)}
                          className="mt-2 rounded-full border border-blue-300 bg-white px-3 py-2 text-xs font-black text-blue-800"
                        >
                          候補を反映
                        </button>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                        <label className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm font-bold">
                          <input
                            type="checkbox"
                            checked={rule.required}
                            onChange={(event) =>
                              updateRule(
                                header,
                                "required",
                                event.target.checked,
                              )
                            }
                            className="size-5"
                          />
                          必須
                        </label>
                        <label className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm font-bold">
                          <input
                            type="checkbox"
                            checked={rule.unique}
                            onChange={(event) =>
                              updateRule(header, "unique", event.target.checked)
                            }
                            className="size-5"
                          />
                          重複禁止
                        </label>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {rule.type === "string" ? (
                        <>
                          <label className="text-sm font-bold text-slate-700">
                            最小文字数
                            <input
                              aria-label={`${header}の最小文字数`}
                              inputMode="numeric"
                              value={rule.minLength}
                              onChange={(event) =>
                                updateRule(
                                  header,
                                  "minLength",
                                  event.target.value,
                                )
                              }
                              placeholder="例：1"
                              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-3"
                            />
                          </label>
                          <label className="text-sm font-bold text-slate-700">
                            最大文字数
                            <input
                              aria-label={`${header}の最大文字数`}
                              inputMode="numeric"
                              value={rule.maxLength}
                              onChange={(event) =>
                                updateRule(
                                  header,
                                  "maxLength",
                                  event.target.value,
                                )
                              }
                              placeholder="例：50"
                              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-3"
                            />
                          </label>
                        </>
                      ) : (
                        <>
                          <label className="text-sm font-bold text-slate-700">
                            {rule.type === "number" ? "最小値" : "最小日付"}
                            <input
                              aria-label={`${header}の最小${rule.type === "number" ? "値" : "日付"}`}
                              value={rule.min}
                              onChange={(event) =>
                                updateRule(header, "min", event.target.value)
                              }
                              placeholder={
                                rule.type === "number" ? "例：0" : "YYYY-MM-DD"
                              }
                              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-3"
                            />
                          </label>
                          <label className="text-sm font-bold text-slate-700">
                            {rule.type === "number" ? "最大値" : "最大日付"}
                            <input
                              aria-label={`${header}の最大${rule.type === "number" ? "値" : "日付"}`}
                              value={rule.max}
                              onChange={(event) =>
                                updateRule(header, "max", event.target.value)
                              }
                              placeholder={
                                rule.type === "number"
                                  ? "例：9999"
                                  : "YYYY-MM-DD"
                              }
                              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-3"
                            />
                          </label>
                        </>
                      )}
                      <label className="text-sm font-bold text-slate-700 sm:col-span-2 lg:col-span-1">
                        許可する値（カンマ区切り）
                        <input
                          aria-label={`${header}の許可する値`}
                          value={rule.allowedValues}
                          onChange={(event) =>
                            updateRule(
                              header,
                              "allowedValues",
                              event.target.value,
                            )
                          }
                          placeholder="例：販売中,販売終了"
                          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-3"
                        />
                      </label>
                    </div>
                  </fieldset>
                );
              })}
            </div>

            <button
              type="button"
              onClick={runValidation}
              data-analytics-event="tool_run"
              data-analytics-tool-id="csv-rule-validator"
              data-analytics-platform="browser"
              className="mt-5 w-full rounded-full bg-blue-600 px-5 py-4 font-black text-white hover:bg-blue-700"
            >
              このルールでCSVを検証
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
          <section className="mt-8" aria-labelledby="result-heading">
            <p className="text-sm font-bold text-emerald-700">検証結果</p>
            <h2 id="result-heading" className="mt-1 text-2xl font-black">
              {result.errors.length}件の指摘
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <span className="text-xs font-bold text-slate-500">
                  全データ行
                </span>
                <strong className="mt-1 block text-2xl">
                  {table.rows.length}行
                </strong>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-4">
                <span className="text-xs font-bold text-emerald-700">
                  指摘なし
                </span>
                <strong className="mt-1 block text-2xl text-emerald-950">
                  {result.validRowCount}行
                </strong>
              </div>
              <div className="rounded-2xl bg-rose-50 p-4">
                <span className="text-xs font-bold text-rose-700">
                  指摘あり
                </span>
                <strong className="mt-1 block text-2xl text-rose-950">
                  {result.invalidRowCount}行
                </strong>
              </div>
            </div>

            {result.errors.length ? (
              <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
                <table className="min-w-[760px] w-full border-collapse text-left text-sm">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      {["元行", "列名", "ルール", "入力値", "指摘内容"].map(
                        (heading) => (
                          <th key={heading} className="px-4 py-3 font-black">
                            {heading}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {result.errors.slice(0, 100).map((item, index) => (
                      <tr
                        key={`${item.sourceLine}-${item.column}-${item.rule}-${index}`}
                        className="border-t border-slate-200 align-top"
                      >
                        <td className="px-4 py-3 font-bold">
                          {item.sourceLine}
                        </td>
                        <td className="px-4 py-3">{item.column}</td>
                        <td className="px-4 py-3">{item.rule}</td>
                        <td className="max-w-56 break-words px-4 py-3">
                          {item.value || "（空欄）"}
                        </td>
                        <td className="px-4 py-3">{item.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-5 rounded-xl bg-emerald-50 p-4 font-bold text-emerald-900">
                現在のルールでは指摘はありません。
              </p>
            )}
            {result.errors.length > 100 ? (
              <p className="mt-2 text-xs text-slate-500">
                画面には先頭100件を表示しています。保存するエラー一覧CSVには全件を含みます。
              </p>
            ) : null}
            <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-950">
              この結果は設定したルールとの照合です。取込先固有の仕様や取り込み成功を保証しないため、保存後は少量データで取込テストしてください。
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => saveOutput("result")}
                className="rounded-full bg-emerald-600 px-5 py-4 font-black text-white hover:bg-emerald-700"
              >
                検証結果CSVを保存
              </button>
              <button
                type="button"
                disabled={!result.errors.length}
                onClick={() => saveOutput("errors")}
                className="rounded-full border border-slate-300 px-5 py-4 font-black text-slate-800 hover:border-slate-500 disabled:cursor-not-allowed disabled:text-slate-400"
              >
                エラー一覧CSVを保存
              </button>
            </div>

            <PremiumInterestCards
              toolId="csv-rule-validator"
              placement="result_after"
              candidates={PREMIUM_CANDIDATES}
            />
          </section>
        ) : null}
      </section>
    </main>
  );
}
