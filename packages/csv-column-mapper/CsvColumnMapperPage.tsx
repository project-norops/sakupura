"use client";

import { PremiumInterestCards } from "@sakupla/shared-ui/PremiumInterestCards";
import { useMemo, useState } from "react";
import {
  createEmptyMappings,
  decodeUtf8,
  getExcludedSourceHeaders,
  parseCsv,
  serializeCsv,
  suggestMappings,
  transformCsv,
  type ColumnMapping,
  type CsvTable,
} from "./utils";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const SOURCE_SAMPLE = `sku,title,price,cost,inventory,description\nA-001,帆布トート,2980,1200,12,丈夫な帆布のトートバッグ\nA-002,マグカップ,1800,650,8,電子レンジ対応マグ`;
const TARGET_TEMPLATE = `商品コード,商品名,販売価格,公開状態`;

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

export function CsvColumnMapperPage() {
  const [source, setSource] = useState<CsvTable | null>(null);
  const [target, setTarget] = useState<CsvTable | null>(null);
  const [sourceName, setSourceName] = useState("");
  const [targetName, setTargetName] = useState("");
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [preview, setPreview] = useState<CsvTable | null>(null);
  const [error, setError] = useState("");

  const suggestions = useMemo(
    () =>
      source && target
        ? suggestMappings(source.headers, target.headers)
        : ({} as Record<string, string>),
    [source, target],
  );
  const unassigned = mappings
    .filter(
      (mapping) =>
        mapping.mode === "unassigned" ||
        (mapping.mode === "source" &&
          (!mapping.sourceHeader ||
            !source?.headers.includes(mapping.sourceHeader))),
    )
    .map((mapping) => mapping.targetHeader);
  const excluded = source
    ? getExcludedSourceHeaders(source.headers, mappings)
    : [];
  const canTransform = Boolean(
    source && target && mappings.length > 0 && unassigned.length === 0,
  );

  const resetResult = () => {
    setPreview(null);
    setError("");
  };

  const loadFile = async (
    file: File | undefined,
    kind: "source" | "target",
  ) => {
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setError("初期版では10MB以下のUTF-8 CSVを読み込めます。");
      return;
    }
    try {
      const table = parseCsv(
        decodeUtf8(await file.arrayBuffer()),
        kind === "source",
      );
      if (kind === "source") {
        setSource(table);
        setSourceName(file.name);
      } else {
        setTarget(table);
        setTargetName(file.name);
        setMappings(createEmptyMappings(table.headers));
      }
      resetResult();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "CSVを読み込めませんでした。",
      );
    }
  };

  const loadSample = () => {
    const sampleSource = parseCsv(SOURCE_SAMPLE);
    const sampleTarget = parseCsv(TARGET_TEMPLATE, false);
    setSource(sampleSource);
    setTarget(sampleTarget);
    setSourceName("sample-source.csv");
    setTargetName("sample-target-template.csv");
    setMappings(createEmptyMappings(sampleTarget.headers));
    resetResult();
  };

  const updateMapping = (
    targetHeader: string,
    patch: Partial<ColumnMapping>,
  ) => {
    setMappings((current) =>
      current.map((mapping) =>
        mapping.targetHeader === targetHeader
          ? { ...mapping, ...patch }
          : mapping,
      ),
    );
    resetResult();
  };

  const makePreview = () => {
    if (!source || !canTransform) return;
    try {
      setPreview(transformCsv(source, mappings));
      setError("");
    } catch (caught) {
      setPreview(null);
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
          CSV列マッピング・変換テンプレート
        </h1>
        <p className="mt-4 max-w-4xl leading-7 text-slate-600">
          元CSVの列を取込先テンプレートへ対応付け、出力列の名称と順番を整えます。不要列を除外し、公開状態などの固定値を加えた結果を保存前に確認できます。ファイル内容は端末内だけで処理し、外部へ送信しません。
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <FileCard
            number="1"
            title="変換元CSV"
            detail={
              source
                ? `${sourceName}・${source.rows.length}行・${source.headers.length}列`
                : "見出し行と1行以上のデータが必要です"
            }
            onChange={(file) => loadFile(file, "source")}
          />
          <FileCard
            number="2"
            title="取込先テンプレートCSV"
            detail={
              target
                ? `${targetName}・出力${target.headers.length}列`
                : "取込先の列名を並べたヘッダー行を読み込みます"
            }
            onChange={(file) => loadFile(file, "target")}
          />
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <button
            type="button"
            onClick={loadSample}
            data-analytics-event="sample_load"
            data-analytics-tool-id="csv-column-mapper"
            className="rounded-full border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900 hover:border-amber-500"
          >
            操作サンプルを読み込む
          </button>
          <button
            type="button"
            onClick={() =>
              downloadCsv(SOURCE_SAMPLE, "csv-column-mapper-source-sample.csv")
            }
            className="rounded-full border border-slate-300 px-4 py-3 text-sm font-bold text-slate-700 hover:border-amber-500"
          >
            変換元サンプルCSVを保存
          </button>
          <button
            type="button"
            onClick={() =>
              downloadCsv(
                TARGET_TEMPLATE,
                "csv-column-mapper-target-template.csv",
              )
            }
            className="rounded-full border border-slate-300 px-4 py-3 text-sm font-bold text-slate-700 hover:border-amber-500"
          >
            取込先テンプレートCSVを保存
          </button>
        </div>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          入力はUTF-8・10MB以下のCSVが対象です。取込先テンプレートは見出し行だけでも読み込めます。テンプレート内のデータ行は出力には使いません。
          CSVの引用符や改行は
          <a
            href="https://www.rfc-editor.org/rfc/rfc4180"
            target="_blank"
            rel="noreferrer"
            className="mx-1 font-bold text-blue-700 underline"
          >
            RFC 4180の一般的な形式
          </a>
          を基準に扱いますが、最終的な必須列と許容値は取込先システムの仕様が優先です。
        </p>

        {source && target && (
          <section className="mt-8" aria-labelledby="mapping-heading">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-amber-700">手順 3</p>
                <h2
                  id="mapping-heading"
                  className="mt-1 text-2xl font-black text-slate-950"
                >
                  出力列ごとに対応を決める
                </h2>
              </div>
              <p
                className="text-sm font-bold text-slate-500"
                aria-live="polite"
              >
                割当済み {mappings.length - unassigned.length} /{" "}
                {mappings.length}列
              </p>
            </div>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
              同名に近い列は候補として表示しますが、自動確定しません。「候補を採用」または選択欄で利用者が確認してください。固定値を選ぶと、全行へ同じ値を追加できます。
            </p>

            <div className="mt-4 space-y-3">
              {mappings.map((mapping, index) => {
                const suggestion = suggestions[mapping.targetHeader];
                return (
                  <article
                    key={mapping.targetHeader}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1.2fr)] lg:items-end">
                      <div>
                        <span className="text-xs font-bold text-slate-500">
                          出力列 {index + 1}
                        </span>
                        <strong className="mt-1 block break-words text-slate-950">
                          {mapping.targetHeader}
                        </strong>
                        {suggestion && mapping.mode === "unassigned" && (
                          <button
                            type="button"
                            onClick={() =>
                              updateMapping(mapping.targetHeader, {
                                mode: "source",
                                sourceHeader: suggestion,
                              })
                            }
                            className="mt-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100"
                          >
                            候補「{suggestion}」を採用
                          </button>
                        )}
                      </div>
                      <label className="text-sm font-bold text-slate-700">
                        入れ方
                        <select
                          aria-label={`${mapping.targetHeader}の入れ方`}
                          value={mapping.mode}
                          onChange={(event) => {
                            const mode = event.target
                              .value as ColumnMapping["mode"];
                            updateMapping(mapping.targetHeader, {
                              mode,
                              sourceHeader:
                                mode === "source" ? mapping.sourceHeader : "",
                            });
                          }}
                          className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-3"
                        >
                          <option value="unassigned">未割当</option>
                          <option value="source">変換元CSVの列を使う</option>
                          <option value="fixed">全行へ固定値を入れる</option>
                        </select>
                      </label>
                      {mapping.mode === "source" ? (
                        <label className="text-sm font-bold text-slate-700">
                          変換元の列
                          <select
                            aria-label={`${mapping.targetHeader}へ割り当てる変換元列`}
                            value={mapping.sourceHeader}
                            onChange={(event) =>
                              updateMapping(mapping.targetHeader, {
                                sourceHeader: event.target.value,
                              })
                            }
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-3"
                          >
                            <option value="">選択してください</option>
                            {source.headers.map((header) => (
                              <option key={header}>{header}</option>
                            ))}
                          </select>
                        </label>
                      ) : mapping.mode === "fixed" ? (
                        <label className="text-sm font-bold text-slate-700">
                          固定値（空欄も可）
                          <input
                            aria-label={`${mapping.targetHeader}へ入れる固定値`}
                            value={mapping.fixedValue}
                            onChange={(event) =>
                              updateMapping(mapping.targetHeader, {
                                fixedValue: event.target.value,
                              })
                            }
                            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-3"
                            placeholder="例: draft"
                          />
                        </label>
                      ) : (
                        <p className="rounded-xl bg-slate-50 px-3 py-3 text-sm text-slate-500">
                          変換元列または固定値を選んでください。
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <StatusBox
                title={`未割当の出力列（${unassigned.length}）`}
                values={unassigned}
                emptyText="すべて割り当て済みです。"
                tone={unassigned.length ? "warning" : "success"}
              />
              <StatusBox
                title={`出力から除外する変換元列（${excluded.length}）`}
                values={excluded}
                emptyText="除外する列はありません。"
                tone="neutral"
              />
            </div>

            <button
              type="button"
              onClick={makePreview}
              disabled={!canTransform}
              aria-disabled={!canTransform}
              data-analytics-event="tool_run"
              data-analytics-tool-id="csv-column-mapper"
              data-analytics-platform="browser"
              className="mt-5 w-full rounded-full bg-blue-600 px-5 py-4 font-black text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              変換プレビューを作成
            </button>
          </section>
        )}

        {error && (
          <p
            role="alert"
            className="mt-5 rounded-xl bg-rose-50 p-4 text-sm font-bold text-rose-800"
          >
            {error}
          </p>
        )}

        {preview && (
          <section className="mt-8" aria-labelledby="preview-heading">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-emerald-700">手順 4</p>
                <h2
                  id="preview-heading"
                  className="mt-1 text-2xl font-black text-slate-950"
                >
                  保存前の変換プレビュー
                </h2>
              </div>
              <p className="text-sm font-bold text-slate-500">
                全{preview.rows.length}行・先頭
                {Math.min(10, preview.rows.length)}行を表示
              </p>
            </div>
            <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
              <table className="min-w-full border-collapse text-left text-sm">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    {preview.headers.map((header) => (
                      <th
                        key={header}
                        scope="col"
                        className="whitespace-nowrap border-b border-slate-200 px-4 py-3 font-black"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.slice(0, 10).map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className="border-b border-slate-100 last:border-0"
                    >
                      {preview.headers.map((header) => (
                        <td
                          key={header}
                          className="max-w-72 px-4 py-3 align-top text-slate-700"
                        >
                          <span className="line-clamp-3 break-words">
                            {row[header] || "（空欄）"}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-950">
              <strong>保存前の最終確認：</strong> 出力列は左から「
              {preview.headers.join(" → ")}」です。除外列は「
              {excluded.length ? excluded.join("、") : "なし"}
              」です。取込先システムの必須列・値・文字コードは、そのシステムの最新仕様でも確認してください。
            </div>
            <button
              type="button"
              onClick={() =>
                downloadCsv(
                  serializeCsv(preview),
                  "csv-column-mapper-result.csv",
                )
              }
              className="mt-4 w-full rounded-full bg-emerald-600 px-5 py-4 font-black text-white hover:bg-emerald-700"
            >
              変換CSVを保存
            </button>
            <PremiumInterestCards
              toolId="csv-column-mapper"
              placement="result_after"
              candidates={[
                {
                  featureId: "mapping_rule_save",
                  name: "変換ルール保存",
                  description:
                    "今回設定した列対応・固定値・除外内容を保存し、次回の変換で呼び出せる候補です。",
                },
                {
                  featureId: "batch_files",
                  name: "複数ファイル一括処理",
                  description:
                    "同じ列対応を使って複数のCSVをまとめて変換し、繰り返し操作を減らす候補です。",
                },
              ]}
            />
          </section>
        )}
      </section>
    </main>
  );
}

function FileCard({
  number,
  title,
  detail,
  onChange,
}: {
  number: string;
  title: string;
  detail: string;
  onChange: (file: File | undefined) => void;
}) {
  return (
    <label className="cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center hover:border-amber-500">
      <input
        className="sr-only"
        type="file"
        accept=".csv,text/csv"
        onChange={(event) => onChange(event.target.files?.[0])}
      />
      <span className="mx-auto flex size-9 items-center justify-center rounded-full bg-slate-900 text-sm font-black text-white">
        {number}
      </span>
      <strong className="mt-3 block text-slate-950">{title}</strong>
      <span className="mt-1 block text-sm leading-6 text-slate-500">
        {detail}
      </span>
      <span className="mt-3 inline-block rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm">
        CSVを選択
      </span>
    </label>
  );
}

function StatusBox({
  title,
  values,
  emptyText,
  tone,
}: {
  title: string;
  values: string[];
  emptyText: string;
  tone: "warning" | "success" | "neutral";
}) {
  const colors =
    tone === "warning"
      ? "border-amber-200 bg-amber-50 text-amber-950"
      : tone === "success"
        ? "border-emerald-200 bg-emerald-50 text-emerald-950"
        : "border-slate-200 bg-slate-50 text-slate-800";
  return (
    <div aria-label={title} className={`rounded-2xl border p-4 ${colors}`}>
      <strong className="text-sm">{title}</strong>
      {values.length ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {values.map((value) => (
            <span
              key={value}
              className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-bold shadow-sm"
            >
              {value}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm">{emptyText}</p>
      )}
    </div>
  );
}
