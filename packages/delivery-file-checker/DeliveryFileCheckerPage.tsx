"use client";

import { trackAnalyticsEvent } from "@sakupla/shared-ui/AnalyticsEvents";
import { PremiumInterestCards } from "@sakupla/shared-ui/PremiumInterestCards";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import {
  evaluateDeliveryFiles,
  extensionOf,
  normalizeExtensions,
  normalizeRequiredFiles,
  resultToCsv,
  resultToText,
  type DeliveryCheckResult,
  type DeliveryFileInfo,
  type DeliveryRequirements,
} from "./utils";

type FormValues = {
  allowedExtensions: string;
  requiredFiles: string;
  namePrefix: string;
  requireLowercase: boolean;
  disallowSpaces: boolean;
  minWidth: string;
  minHeight: string;
};

const EMPTY: FormValues = {
  allowedExtensions: "png, jpg, pdf",
  requiredFiles: "",
  namePrefix: "",
  requireLowercase: false,
  disallowSpaces: true,
  minWidth: "",
  minHeight: "",
};

const SAMPLE_FORM: FormValues = {
  allowedExtensions: "png, jpg, pdf",
  requiredFiles: "autumn_main.png\nautumn_readme.pdf",
  namePrefix: "autumn_",
  requireLowercase: true,
  disallowSpaces: true,
  minWidth: "1200",
  minHeight: "630",
};

const SAMPLE_FILES: DeliveryFileInfo[] = [
  { name: "autumn_main.png", size: 824_000, width: 1200, height: 630 },
  { name: "Preview Final.JPG", size: 410_000, width: 800, height: 500 },
  { name: "source.psd", size: 2_400_000 },
];

const PREMIUM_CANDIDATES = [
  {
    featureId: "delivery_rule_save" as const,
    name: "納品ルールの保存",
    description:
      "よく使う拡張子・命名・画像寸法・必要ファイルをこの端末に保存し、次の案件で再利用できる候補です。",
  },
  {
    featureId: "batch_delivery_check" as const,
    name: "複数案件の一括確認",
    description:
      "案件ごとの納品ルールを使い分け、複数のファイル一式をまとめて確認できる候補です。",
  },
];

const fieldClass =
  "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

function numberOrNull(value: string) {
  if (!value.trim()) return null;
  return Number(value);
}

function fileSizeLabel(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function isReadableImage(file: File) {
  return ["png", "jpg", "jpeg", "gif", "webp"].includes(extensionOf(file.name));
}

async function readImageDimensions(file: File) {
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<{ width: number; height: number }>(
      (resolve, reject) => {
        const image = new Image();
        image.onload = () =>
          resolve({ width: image.naturalWidth, height: image.naturalHeight });
        image.onerror = () => reject(new Error("image read failed"));
        image.src = url;
      },
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function inspectFiles(files: File[]) {
  return Promise.all(
    files.map(async (file): Promise<DeliveryFileInfo> => {
      if (!isReadableImage(file)) return { name: file.name, size: file.size };
      try {
        const dimensions = await readImageDimensions(file);
        return { name: file.name, size: file.size, ...dimensions };
      } catch {
        return { name: file.name, size: file.size, imageReadError: true };
      }
    }),
  );
}

function downloadCsv(result: DeliveryCheckResult) {
  const blob = new Blob(["\uFEFF", resultToCsv(result)], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "納品前チェック結果.csv";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function DeliveryFileCheckerPage() {
  const [form, setForm] = useState<FormValues>(EMPTY);
  const [files, setFiles] = useState<DeliveryFileInfo[]>([]);
  const [sampleMode, setSampleMode] = useState(false);
  const [reading, setReading] = useState(false);
  const [result, setResult] = useState<DeliveryCheckResult | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setResult(null);
    setError("");
    setStatus("");
  };

  const loadSample = () => {
    setForm(SAMPLE_FORM);
    setFiles(SAMPLE_FILES);
    setSampleMode(true);
    setResult(null);
    setError("");
    setStatus("指摘例が分かるサンプル要件と3ファイルを読み込みました。");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const clear = () => {
    setForm(EMPTY);
    setFiles([]);
    setSampleMode(false);
    setResult(null);
    setError("");
    setStatus("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const chooseFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    setResult(null);
    setError("");
    setStatus("");
    setSampleMode(false);
    if (selected.length > 50) {
      setFiles([]);
      setError("一度に確認できるファイルは50件までです。");
      return;
    }
    const totalSize = selected.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > 100 * 1024 * 1024) {
      setFiles([]);
      setError(
        "合計100MBを超えるファイルは初期版の対象外です。分けて確認してください。",
      );
      return;
    }
    setReading(true);
    setFiles(await inspectFiles(selected));
    setReading(false);
    setStatus(
      selected.length ? `${selected.length}件を端末内で読み取りました。` : "",
    );
  };

  const runCheck = (event: FormEvent) => {
    event.preventDefault();
    const allowedExtensions = normalizeExtensions(form.allowedExtensions);
    const requiredFiles = normalizeRequiredFiles(form.requiredFiles);
    const minWidth = numberOrNull(form.minWidth);
    const minHeight = numberOrNull(form.minHeight);
    if (!allowedExtensions.length || !requiredFiles.length) {
      setError("許可する拡張子と、必要ファイル名を1件以上入力してください。");
      return;
    }
    if (
      [minWidth, minHeight].some(
        (value) =>
          value !== null &&
          (!Number.isInteger(value) || value < 1 || value > 100_000),
      )
    ) {
      setError("最小画像寸法は1〜100000の整数、または空欄で入力してください。");
      return;
    }
    if (!files.length) {
      setError(
        "確認するファイルを選ぶか、機能説明用サンプルを読み込んでください。",
      );
      return;
    }
    const requirements: DeliveryRequirements = {
      allowedExtensions,
      requiredFiles,
      namePrefix: form.namePrefix.trim(),
      requireLowercase: form.requireLowercase,
      disallowSpaces: form.disallowSpaces,
      minWidth,
      minHeight,
    };
    setResult(evaluateDeliveryFiles(files, requirements));
    setError("");
    setStatus("");
    trackAnalyticsEvent("tool_run", { tool_id: "delivery-file-checker" });
  };

  const copyResult = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(resultToText(result));
      setStatus("チェック結果をコピーしました。");
    } catch {
      setStatus("コピーできませんでした。CSV保存をお試しください。");
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
          個人クリエイターの納品前確認
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          制作物納品チェック・ファイル構成確認
        </h1>
        <p className="mt-4 max-w-4xl leading-7 text-slate-600">
          画像や資料を納品する前に、必要なファイルがそろっているか、拡張子・画像サイズ・ファイル名が指定どおりかをまとめて確認できます。選んだファイルは外部へ送信せず、このブラウザ内だけで読み取ります。
        </p>

        <section
          aria-label="かんたん操作手順"
          className="mt-6 grid gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 sm:grid-cols-3 sm:p-5"
        >
          <div>
            <h2 className="font-black">1. 納品条件を入力</h2>
            <p className="mt-1 text-sm leading-6">
              拡張子、必要な名前、画像寸法を設定
            </p>
          </div>
          <div>
            <h2 className="font-black">2. ファイルを選択</h2>
            <p className="mt-1 text-sm leading-6">
              納品予定のファイルをまとめて選ぶ
            </p>
          </div>
          <div>
            <h2 className="font-black">3. 指摘を直す</h2>
            <p className="mt-1 text-sm leading-6">
              要修正・要確認を見て納品前に対応
            </p>
          </div>
        </section>

        <div className="mt-5 rounded-2xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-950">
          <strong>端末内で処理します。</strong>{" "}
          ファイル名、画像、検査結果をサクプラやGA4へ送りません。ファイルそのものを保存する機能もありません。
        </div>
        <p className="mt-3 text-xs leading-5 text-slate-500">
          確認範囲はブラウザ標準の
          <a
            href="https://developer.mozilla.org/en-US/docs/Web/API/File_API/Using_files_from_web_applications"
            target="_blank"
            rel="noopener noreferrer"
            className="mx-1 font-bold text-blue-700 underline"
          >
            File API
          </a>
          と画像の
          <a
            href="https://developer.mozilla.org/ja/docs/Web/API/HTMLImageElement/naturalWidth"
            target="_blank"
            rel="noopener noreferrer"
            className="mx-1 font-bold text-blue-700 underline"
          >
            naturalWidth / naturalHeight
          </a>
          に基づきます。
        </p>

        <form onSubmit={runCheck} noValidate className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-black">納品要件とファイル</h2>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={loadSample}
                data-analytics-event="sample_load"
                data-analytics-tool-id="delivery-file-checker"
                className="min-h-11 rounded-full border border-blue-300 px-4 text-sm font-bold text-blue-700"
              >
                指摘例サンプルを読み込む
              </button>
              <button
                type="button"
                onClick={clear}
                className="min-h-11 rounded-full border border-slate-300 px-4 text-sm font-bold text-slate-700"
              >
                入力をクリア
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-bold text-slate-700">
              許可する拡張子 <span className="text-red-600">必須</span>
              <input
                value={form.allowedExtensions}
                onChange={(event) =>
                  update("allowedExtensions", event.target.value)
                }
                className={fieldClass}
                placeholder="例：png, jpg, pdf"
              />
              <span className="mt-1 block text-xs font-normal text-slate-500">
                カンマまたは空白で区切ります。
              </span>
            </label>
            <label className="block text-sm font-bold text-slate-700">
              ファイル名の先頭（任意）
              <input
                value={form.namePrefix}
                onChange={(event) => update("namePrefix", event.target.value)}
                className={fieldClass}
                placeholder="例：autumn_"
              />
              <span className="mt-1 block text-xs font-normal text-slate-500">
                すべて同じ案件名で始める場合に指定します。
              </span>
            </label>
            <label className="block text-sm font-bold text-slate-700 sm:col-span-2">
              必要ファイル名 <span className="text-red-600">必須</span>
              <textarea
                rows={4}
                value={form.requiredFiles}
                onChange={(event) =>
                  update("requiredFiles", event.target.value)
                }
                className={fieldClass}
                placeholder={"例：\nautumn_main.png\nautumn_readme.pdf"}
              />
              <span className="mt-1 block text-xs font-normal text-slate-500">
                1行に1つ、納品に必ず含める正確なファイル名を入力します。
              </span>
            </label>
            <label className="block text-sm font-bold text-slate-700">
              画像の最小幅（px・任意）
              <input
                type="number"
                min="1"
                max="100000"
                step="1"
                value={form.minWidth}
                onChange={(event) => update("minWidth", event.target.value)}
                className={fieldClass}
                placeholder="例：1200"
              />
            </label>
            <label className="block text-sm font-bold text-slate-700">
              画像の最小高さ（px・任意）
              <input
                type="number"
                min="1"
                max="100000"
                step="1"
                value={form.minHeight}
                onChange={(event) => update("minHeight", event.target.value)}
                className={fieldClass}
                placeholder="例：630"
              />
            </label>
            <fieldset className="rounded-2xl border border-slate-200 p-4 sm:col-span-2">
              <legend className="px-1 text-sm font-black">
                ファイル名の確認
              </legend>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <label className="flex items-start gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={form.requireLowercase}
                    onChange={(event) =>
                      update("requireLowercase", event.target.checked)
                    }
                    className="mt-1 size-4"
                  />
                  <span>
                    <strong>小文字へ統一</strong>
                    <br />
                    <span className="text-slate-500">
                      大文字を「要確認」にします。
                    </span>
                  </span>
                </label>
                <label className="flex items-start gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={form.disallowSpaces}
                    onChange={(event) =>
                      update("disallowSpaces", event.target.checked)
                    }
                    className="mt-1 size-4"
                  />
                  <span>
                    <strong>空白を使わない</strong>
                    <br />
                    <span className="text-slate-500">
                      空白を「要確認」にします。
                    </span>
                  </span>
                </label>
              </div>
            </fieldset>
          </div>

          <label className="mt-6 block rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 text-sm font-bold text-slate-800">
            確認するファイル（最大50件・合計100MB）
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={chooseFiles}
              className="mt-3 block w-full text-sm font-normal file:mr-3 file:rounded-full file:border-0 file:bg-blue-600 file:px-4 file:py-2.5 file:font-bold file:text-white"
            />
            <span className="mt-2 block font-normal leading-6 text-slate-500">
              PNG・JPEG・GIF・WebPは画像寸法も読み取ります。PSDの内部構造や動画コーデックは確認しません。
            </span>
          </label>

          {files.length > 0 && (
            <section
              aria-label="選択したファイル"
              className="mt-5 rounded-2xl border border-slate-200 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-black">
                  {sampleMode ? "機能説明用サンプル" : "選択したファイル"}（
                  {files.length}件）
                </h3>
                {sampleMode && (
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">
                    実ファイルは読み込んでいません
                  </span>
                )}
              </div>
              <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                {files.map((file, index) => (
                  <li
                    key={`${file.name}-${index}`}
                    className="min-w-0 rounded-xl bg-slate-50 p-3"
                  >
                    <span
                      className="block truncate font-bold"
                      title={file.name}
                    >
                      {file.name}
                    </span>
                    <span className="text-slate-500">
                      {fileSizeLabel(file.size)}
                      {file.width && file.height
                        ? ` / ${file.width} × ${file.height} px`
                        : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {error && (
            <p
              role="alert"
              className="mt-5 rounded-xl bg-red-50 p-4 font-bold text-red-700"
            >
              {error}
            </p>
          )}
          {status && (
            <p
              role="status"
              className="mt-5 rounded-xl bg-blue-50 p-4 font-bold text-blue-700"
            >
              {status}
            </p>
          )}
          <button
            type="submit"
            disabled={reading}
            className="mt-6 min-h-12 rounded-full bg-blue-600 px-6 font-black text-white hover:bg-blue-700 disabled:bg-slate-400"
          >
            {reading ? "端末内で読み取り中…" : "納品前チェックを実行"}
          </button>
        </form>
      </section>

      {!result ? (
        <section
          aria-label="チェック結果の空状態"
          className="mt-6 rounded-[2rem] border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600"
        >
          要件を入力してファイルを選ぶと、ここに「要修正」「要確認」とファイルごとの理由が表示されます。
        </section>
      ) : (
        <>
          <section
            aria-labelledby="delivery-result-title"
            className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-blue-700">
                  制作物 納品前チェック
                </p>
                <h2
                  id="delivery-result-title"
                  className="mt-1 text-2xl font-black"
                >
                  {result.errorCount
                    ? "修正が必要な項目があります"
                    : result.warningCount
                      ? "確認しておきたい項目があります"
                      : "設定した要件内で指摘はありません"}
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  className="min-h-11 rounded-full border border-blue-300 px-4 text-sm font-bold text-blue-700"
                >
                  結果をコピー
                </button>
                <button
                  type="button"
                  onClick={() => downloadCsv(result)}
                  className="min-h-11 rounded-full bg-slate-900 px-4 text-sm font-bold text-white"
                >
                  結果CSVを保存
                </button>
              </div>
            </div>
            <dl className="mt-6 grid gap-3 sm:grid-cols-4">
              <Summary
                label="確認ファイル"
                value={result.files.length}
                color="slate"
              />
              <Summary label="要修正" value={result.errorCount} color="red" />
              <Summary
                label="要確認"
                value={result.warningCount}
                color="amber"
              />
              <Summary
                label="指摘なし"
                value={result.passedCount}
                color="emerald"
              />
            </dl>
            {result.issues.length ? (
              <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
                <table className="min-w-[720px] w-full text-left text-sm">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-4 py-3">判定</th>
                      <th className="px-4 py-3">ファイル名</th>
                      <th className="px-4 py-3">確認項目</th>
                      <th className="px-4 py-3">内容</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {result.issues.map((issue, index) => (
                      <tr
                        key={`${issue.fileName}-${issue.check}-${index}`}
                        className="align-top"
                      >
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-black ${issue.severity === "error" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-900"}`}
                          >
                            {issue.severity === "error" ? "要修正" : "要確認"}
                          </span>
                        </td>
                        <td className="max-w-48 break-all px-4 py-3 font-bold">
                          {issue.fileName}
                        </td>
                        <td className="px-4 py-3">{issue.check}</td>
                        <td className="px-4 py-3 leading-6 text-slate-600">
                          {issue.message}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-6 rounded-2xl bg-emerald-50 p-5 font-bold text-emerald-900">
                設定した拡張子、必要ファイル、命名、画像寸法の範囲では指摘がありません。
              </p>
            )}
            <p className="mt-5 text-sm leading-6 text-slate-600">
              この結果は納品成功を保証しません。ファイルの中身、破損、色空間、PSDレイヤー、動画コーデックなど、ブラウザで確認していない条件は納品先の指定と元の制作ソフトで最終確認してください。
            </p>
          </section>
          <PremiumInterestCards
            toolId="delivery-file-checker"
            placement="result_after"
            candidates={PREMIUM_CANDIDATES}
          />
        </>
      )}
    </main>
  );
}

function Summary({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "slate" | "red" | "amber" | "emerald";
}) {
  const colors = {
    slate: "bg-slate-100 text-slate-900",
    red: "bg-red-50 text-red-800",
    amber: "bg-amber-50 text-amber-900",
    emerald: "bg-emerald-50 text-emerald-900",
  };
  return (
    <div className={`rounded-2xl p-4 ${colors[color]}`}>
      <dt className="text-sm font-bold">{label}</dt>
      <dd className="mt-1 text-2xl font-black">{value}件</dd>
    </div>
  );
}
