"use client";

import { PremiumInterestCards } from "@sakupla/shared-ui/PremiumInterestCards";
import { useState } from "react";
import {
  decodeUtf8,
  joinTables,
  parseCsv,
  serializeCsv,
  type CsvTable,
  type JoinResult,
  type JoinType,
} from "./utils";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const LEFT_SAMPLE = `注文番号,商品コード,数量
O-001,P-001,2
O-002,P-002,1
O-003,P-003,3`;
const RIGHT_SAMPLE = `商品コード,商品名,単価
P-001,春ジャケット,12800
P-002,夏シャツ,6800
P-002,夏シャツ限定色,7200
P-004,秋コート,19800`;
const LEFT_TEMPLATE = `注文番号,商品コード,数量
O-001,P-001,2`;
const RIGHT_TEMPLATE = `商品コード,商品名,単価
P-001,春ジャケット,12800`;
const PREMIUM_CANDIDATES = [
  {
    featureId: "join_recipe_save" as const,
    name: "結合手順保存",
    description:
      "左右のキー、結合方法、追加列の設定を保存し、次回も同じ手順を呼び出せる候補です。",
  },
  {
    featureId: "multi_file_join" as const,
    name: "3ファイル以上の結合",
    description:
      "複数の参照CSVを順番に照合し、必要な列をまとめて追加する候補です。",
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

export function CsvJoinerPage() {
  const [left, setLeft] = useState<CsvTable | null>(null);
  const [right, setRight] = useState<CsvTable | null>(null);
  const [leftName, setLeftName] = useState("");
  const [rightName, setRightName] = useState("");
  const [leftKey, setLeftKey] = useState("");
  const [rightKey, setRightKey] = useState("");
  const [joinType, setJoinType] = useState<JoinType>("left");
  const [selectedHeaders, setSelectedHeaders] = useState<string[]>([]);
  const [result, setResult] = useState<JoinResult | null>(null);
  const [error, setError] = useState("");

  const loadTable = async (side: "left" | "right", file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setError("初期版では各10MB以下のUTF-8 CSVを読み込めます。");
      return;
    }
    try {
      const table = parseCsv(decodeUtf8(await file.arrayBuffer()));
      if (side === "left") {
        setLeft(table);
        setLeftName(file.name);
        setLeftKey(table.headers[0] ?? "");
      } else {
        setRight(table);
        setRightName(file.name);
        setRightKey(table.headers[0] ?? "");
        setSelectedHeaders(table.headers.slice(1));
      }
      setResult(null);
      setError("");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "CSVを読み込めませんでした。",
      );
    }
  };

  const loadSample = () => {
    const nextLeft = parseCsv(LEFT_SAMPLE);
    const nextRight = parseCsv(RIGHT_SAMPLE);
    setLeft(nextLeft);
    setRight(nextRight);
    setLeftName("orders-sample.csv");
    setRightName("products-sample.csv");
    setLeftKey("商品コード");
    setRightKey("商品コード");
    setJoinType("left");
    setSelectedHeaders(["商品名", "単価"]);
    setResult(null);
    setError("");
  };

  const runJoin = () => {
    if (!left || !right) return;
    try {
      setResult(
        joinTables(left, right, {
          leftKey,
          rightKey,
          joinType,
          selectedRightHeaders: selectedHeaders,
        }),
      );
      setError("");
    } catch (caught) {
      setResult(null);
      setError(
        caught instanceof Error
          ? caught.message
          : "CSVを結合できませんでした。",
      );
    }
  };

  const toggleHeader = (header: string) => {
    setSelectedHeaders((current) =>
      current.includes(header)
        ? current.filter((item) => item !== header)
        : [...current, header],
    );
    setResult(null);
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <p className="text-xs font-black uppercase tracking-[.2em] text-amber-700">
          EC・CSV
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          CSV結合・VLOOKUP代替
        </h1>
        <p className="mt-4 max-w-4xl leading-7 text-slate-600">
          注文一覧へ商品名や単価を足すように、2つのCSVを共通のコードやIDで照合して列を追加できます。未一致と重複キーによる行数増加を確認してから、結合CSVと未一致一覧CSVを保存します。
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
              "基準・参照CSVを読み込む",
              "左右のキー列を選ぶ",
              "結合方法と追加列を選ぶ",
              "件数を確認して保存する",
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

        <div className="mt-7 grid gap-4 lg:grid-cols-2">
          <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center hover:border-amber-500">
            <input
              className="sr-only"
              type="file"
              accept=".csv,text/csv"
              onChange={(event) => loadTable("left", event.target.files?.[0])}
            />
            <strong className="block">基準CSV（行を残す側）</strong>
            <span className="mt-1 block text-sm text-slate-500">
              {left
                ? `${leftName}・${left.rows.length}行・${left.headers.length}列`
                : "例：注文一覧、顧客一覧"}
            </span>
            <span className="mt-3 inline-block rounded-full bg-white px-4 py-2 text-xs font-bold shadow-sm">
              基準CSVを選択
            </span>
          </label>
          <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center hover:border-amber-500">
            <input
              className="sr-only"
              type="file"
              accept=".csv,text/csv"
              onChange={(event) => loadTable("right", event.target.files?.[0])}
            />
            <strong className="block">参照CSV（列を追加する側）</strong>
            <span className="mt-1 block text-sm text-slate-500">
              {right
                ? `${rightName}・${right.rows.length}行・${right.headers.length}列`
                : "例：商品マスタ、価格表"}
            </span>
            <span className="mt-3 inline-block rounded-full bg-white px-4 py-2 text-xs font-bold shadow-sm">
              参照CSVを選択
            </span>
          </label>
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <button
            type="button"
            onClick={loadSample}
            data-analytics-event="sample_load"
            data-analytics-tool-id="csv-joiner"
            className="rounded-full border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900"
          >
            操作サンプルを読み込む
          </button>
          <button
            type="button"
            onClick={() =>
              downloadCsv(LEFT_SAMPLE, "csv-joiner-base-sample.csv")
            }
            className="rounded-full border border-slate-300 px-4 py-3 text-sm font-bold"
          >
            基準サンプルを保存
          </button>
          <button
            type="button"
            onClick={() =>
              downloadCsv(RIGHT_SAMPLE, "csv-joiner-reference-sample.csv")
            }
            className="rounded-full border border-slate-300 px-4 py-3 text-sm font-bold"
          >
            参照サンプルを保存
          </button>
          <button
            type="button"
            onClick={() =>
              downloadCsv(LEFT_TEMPLATE, "csv-joiner-base-template.csv")
            }
            className="rounded-full border border-slate-300 px-4 py-3 text-sm font-bold"
          >
            基準テンプレートを保存
          </button>
          <button
            type="button"
            onClick={() =>
              downloadCsv(RIGHT_TEMPLATE, "csv-joiner-reference-template.csv")
            }
            className="rounded-full border border-slate-300 px-4 py-3 text-sm font-bold"
          >
            参照テンプレートを保存
          </button>
        </div>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          初期版はUTF-8・各10MB以下、単一キーの完全一致が対象です。空白・全角半角・大文字小文字を自動でそろえず、入力内容と結果は外部へ送信しません。CSV形式は
          <a
            href="https://www.rfc-editor.org/rfc/rfc4180"
            target="_blank"
            rel="noreferrer"
            className="mx-1 font-bold text-blue-700 underline"
          >
            RFC 4180
          </a>
          を参照します。
        </p>

        {left && right ? (
          <section className="mt-8" aria-labelledby="join-settings-heading">
            <h2 id="join-settings-heading" className="text-2xl font-black">
              結合条件を選択
            </h2>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <label className="text-sm font-bold">
                基準CSVのキー列
                <select
                  value={leftKey}
                  onChange={(event) => {
                    setLeftKey(event.target.value);
                    setResult(null);
                  }}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-3"
                >
                  {left.headers.map((header) => (
                    <option key={header}>{header}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-bold">
                参照CSVのキー列
                <select
                  value={rightKey}
                  onChange={(event) => {
                    setRightKey(event.target.value);
                    setSelectedHeaders((current) =>
                      current.filter((header) => header !== event.target.value),
                    );
                    setResult(null);
                  }}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-3"
                >
                  {right.headers.map((header) => (
                    <option key={header}>{header}</option>
                  ))}
                </select>
              </label>
            </div>
            <fieldset className="mt-5">
              <legend className="text-sm font-black">結合方法</legend>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <label className="rounded-xl border border-slate-200 p-4 text-sm font-bold">
                  <input
                    type="radio"
                    name="join-type"
                    value="left"
                    checked={joinType === "left"}
                    onChange={() => {
                      setJoinType("left");
                      setResult(null);
                    }}
                    className="mr-2"
                  />
                  left join：基準CSVの全行を残す
                </label>
                <label className="rounded-xl border border-slate-200 p-4 text-sm font-bold">
                  <input
                    type="radio"
                    name="join-type"
                    value="inner"
                    checked={joinType === "inner"}
                    onChange={() => {
                      setJoinType("inner");
                      setResult(null);
                    }}
                    className="mr-2"
                  />
                  inner join：一致した行だけ残す
                </label>
              </div>
            </fieldset>
            <fieldset className="mt-5">
              <legend className="text-sm font-black">
                参照CSVから追加する列
              </legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {right.headers
                  .filter((header) => header !== rightKey)
                  .map((header) => (
                    <label
                      key={header}
                      className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm font-bold"
                    >
                      <input
                        type="checkbox"
                        checked={selectedHeaders.includes(header)}
                        onChange={() => toggleHeader(header)}
                        className="size-5"
                      />
                      {header}
                    </label>
                  ))}
              </div>
            </fieldset>
            <button
              type="button"
              onClick={runJoin}
              data-analytics-event="tool_run"
              data-analytics-tool-id="csv-joiner"
              data-analytics-platform="browser"
              className="mt-5 w-full rounded-full bg-blue-600 px-5 py-4 font-black text-white hover:bg-blue-700"
            >
              結合結果を確認
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

        {left && right && result ? (
          <section className="mt-8" aria-labelledby="join-result-heading">
            <p className="text-sm font-bold text-emerald-700">結合結果</p>
            <h2 id="join-result-heading" className="mt-1 text-2xl font-black">
              {result.outputRowCount}行の結合CSV
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["一致した基準行", `${result.matchedLeftCount}行`],
                ["基準側の未一致", `${result.unmatchedLeftCount}行`],
                ["参照側の未使用", `${result.unmatchedRightCount}行`],
                ["重複で増えた行", `${result.expandedRowCount}行`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-slate-50 p-4">
                  <span className="text-xs font-bold text-slate-500">
                    {label}
                  </span>
                  <strong className="mt-1 block text-2xl">{value}</strong>
                </div>
              ))}
            </div>
            {result.duplicateRightKeys.length ? (
              <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-950">
                <strong>参照CSVの重複キー：</strong>
                {result.duplicateRightKeys
                  .map(
                    (item) =>
                      `${item.key}（${item.count}行、元行${item.sourceLines.join("・")}）`,
                  )
                  .join("、")}
                。1対多のため結合結果の行が増えます。
              </div>
            ) : null}
            <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
              <table className="min-w-[700px] w-full text-left text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    {result.joined.headers.map((header) => (
                      <th key={header} className="px-4 py-3 font-black">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.joined.rows.slice(0, 10).map((row, index) => (
                    <tr key={index} className="border-t border-slate-200">
                      {result.joined.headers.map((header) => (
                        <td key={header} className="px-4 py-3">
                          {row[header] || "（空欄）"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-950">
              重複キーを自動削除せず、完全一致した組み合わせをすべて出力します。件数増加と未一致を確認してから保存してください。
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() =>
                  downloadCsv(
                    serializeCsv(result.joined),
                    "csv-joiner-result.csv",
                  )
                }
                className="rounded-full bg-emerald-600 px-5 py-4 font-black text-white"
              >
                結合CSVを保存
              </button>
              <button
                type="button"
                onClick={() =>
                  downloadCsv(
                    serializeCsv(result.unmatched),
                    "csv-joiner-unmatched.csv",
                  )
                }
                className="rounded-full border border-slate-300 px-5 py-4 font-black"
              >
                未一致一覧CSVを保存
              </button>
            </div>
            <PremiumInterestCards
              toolId="csv-joiner"
              placement="result_after"
              candidates={PREMIUM_CANDIDATES}
            />
          </section>
        ) : null}
      </section>
    </main>
  );
}
