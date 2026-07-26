"use client";

import { useMemo, useState } from "react";
import {
  decodeBytes,
  detectEncoding,
  encodeUtf8,
  encodingWarnings,
  type DetectedEncoding,
} from "./utils";

const SAMPLE = "商品名,価格,在庫\r\n帆布トート,2980,10\r\nマグカップ,1800,8";

export function CsvEncodingFixerPage() {
  const [text, setText] = useState("");
  const [detected, setDetected] = useState<DetectedEncoding | null>(null);
  const [selected, setSelected] = useState<DetectedEncoding>("utf-8");
  const [fileName, setFileName] = useState("converted.csv");
  const [error, setError] = useState("");
  const [bom, setBom] = useState(true);
  const warnings = useMemo(() => encodingWarnings(text), [text]);
  const choose = async (file?: File) => {
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      setError("初期版では15MB以下のCSVを変換できます。");
      return;
    }
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const encoding = detectEncoding(bytes);
      setDetected(encoding);
      setSelected(encoding);
      setText(decodeBytes(bytes, encoding));
      setFileName(file.name.replace(/\.csv$/i, "") + "-utf8.csv");
      setError("");
    } catch {
      setError("ファイルを読み込めませんでした。");
    }
  };
  const redecode = async (
    file?: File,
    encoding: DetectedEncoding = "utf-8",
  ) => {
    if (!file) return;
    setText(decodeBytes(new Uint8Array(await file.arrayBuffer()), encoding));
    setSelected(encoding);
  };
  const download = () => {
    const bytes = encodeUtf8(text, bom);
    const blob = new Blob([bytes], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const sample = () => {
    setText(SAMPLE);
    setDetected("utf-8");
    setSelected("utf-8");
    setError("");
  };
  const downloadSample = () => {
    const blob = new Blob(["\uFEFF", SAMPLE], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "csv-encoding-sample.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <p className="text-xs font-black uppercase tracking-[.2em] text-blue-600">
          データ整理
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          CSV文字化け修復・文字コード変換
        </h1>
        <p className="mt-4 max-w-3xl leading-7 text-slate-600">
          ExcelでCSVを開いたら日本語が「縺薙ｓ」などに文字化けした、ECや業務システムから出力したCSVを別のソフトで正しく開けない、といった場合に使います。UTF-8とShift_JIS（Windows-31J）を読み分け、内容を確認してExcelで開きやすいUTF-8
          BOM付きCSVへ変換します。
        </p>
        <div className="mt-5 max-w-3xl rounded-2xl bg-blue-50 p-4 text-sm leading-6 text-blue-950">
          <strong>主な利用例</strong>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            <li>ダウンロードした商品CSVをExcelで開くと日本語が文字化けした</li>
            <li>
              Shift_JIS指定の取込先へ渡す前に、元CSVの文字コードを確認したい
            </li>
            <li>Windows版Excelで開きやすいBOM付きUTF-8へ保存し直したい</li>
          </ul>
        </div>
        <div className="mt-8 grid gap-8 lg:grid-cols-[.75fr_1.25fr]">
          <section>
            <h2 className="text-xl font-black">1. CSVを読み込む</h2>
            <label className="mt-4 block cursor-pointer rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center hover:border-blue-400">
              <input
                id="encoding-file"
                type="file"
                accept=".csv,text/csv"
                className="sr-only"
                onChange={(e) => choose(e.target.files?.[0])}
              />
              <span className="text-3xl">🔤</span>
              <strong className="mt-2 block">CSVファイルを選択</strong>
              <span className="mt-1 block text-sm text-slate-500">
                UTF-8・Shift_JIS、15MBまで
              </span>
            </label>
            <button
              onClick={sample}
              data-analytics-event="sample_load"
              data-analytics-tool-id="csv-encoding-fixer"
              className="mt-3 w-full rounded-full border border-slate-300 px-5 py-3 text-sm font-bold"
            >
              サンプルで試す
            </button>
            <button
              type="button"
              onClick={downloadSample}
              data-analytics-event="tool_run"
              data-analytics-tool-id="csv-encoding-fixer"
              className="mt-2 w-full rounded-full border border-slate-300 px-5 py-3 text-sm font-bold"
            >
              確認用サンプルCSVを保存
            </button>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              このツールは列名や並び順の指定がありません。文字化けを直したい手元のCSVをそのまま選べます。
            </p>
            {detected && (
              <div className="mt-5 rounded-2xl bg-blue-50 p-4 text-sm text-blue-950">
                <strong>
                  自動判定：
                  {detected === "utf-8" ? "UTF-8" : "Shift_JIS / Windows-31J"}
                </strong>
                <p className="mt-1 leading-6">
                  表示がおかしい場合は、元のファイルをもう一度選び、読み込み方法を切り替えてください。
                </p>
              </div>
            )}
            <fieldset className="mt-4">
              <legend className="text-sm font-bold text-slate-700">
                読み込み方法
              </legend>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(["utf-8", "shift_jis"] as const).map((value) => (
                  <label
                    key={value}
                    className={`rounded-xl border p-3 text-center text-sm font-bold ${selected === value ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-300"}`}
                  >
                    <input
                      type="radio"
                      name="encoding"
                      value={value}
                      checked={selected === value}
                      onChange={() => {
                        const input = document.getElementById(
                          "encoding-file",
                        ) as HTMLInputElement;
                        redecode(input.files?.[0], value);
                      }}
                      className="sr-only"
                    />
                    {value === "utf-8" ? "UTF-8" : "Shift_JIS"}
                  </label>
                ))}
              </div>
            </fieldset>
            {error && (
              <p
                role="alert"
                className="mt-4 rounded-xl bg-rose-50 p-4 text-sm font-bold text-rose-800"
              >
                {error}
              </p>
            )}
          </section>
          <section>
            <h2 className="text-xl font-black">2. 内容を確認して変換</h2>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={16}
              placeholder="読み込んだCSVの内容が表示されます。"
              className="mt-4 w-full rounded-2xl border border-slate-300 p-4 font-mono text-sm leading-6"
            />
            {warnings.map((warning) => (
              <p
                key={warning}
                className="mt-2 rounded-xl bg-amber-50 p-3 text-sm font-bold text-amber-900"
              >
                確認：{warning}
              </p>
            ))}
            <label className="mt-4 flex items-start gap-3 rounded-xl border border-slate-200 p-4">
              <input
                type="checkbox"
                checked={bom}
                onChange={(e) => setBom(e.target.checked)}
                className="mt-1"
              />
              <span className="text-sm leading-6">
                <strong>UTF-8 BOMを付ける</strong>
                <br />
                <span className="text-slate-500">
                  Windows版Excelでダブルクリックして開く場合に推奨します。
                </span>
              </span>
            </label>
            <button
              onClick={download}
              disabled={!text}
              data-analytics-event="tool_run"
              data-analytics-tool-id="csv-encoding-fixer"
              className="mt-5 w-full rounded-full bg-blue-600 px-5 py-4 font-black text-white hover:bg-blue-700 disabled:opacity-40"
            >
              UTF-8 CSVとして保存
            </button>
          </section>
        </div>
        <p className="mt-8 border-t pt-5 text-xs leading-5 text-slate-500">
          すでに文字が欠損して「�」へ置き換わったデータは元に戻せません。変換後は件数、列数、氏名や商品名の表示を必ず確認してください。
        </p>
      </section>
    </main>
  );
}
