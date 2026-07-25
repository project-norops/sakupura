"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  EMPTY_SIGNATURE,
  SAMPLE_SIGNATURE,
  generatePlainText,
  generateSignatureHtml,
  hasSignatureContent,
  normalizeAccentColor,
  type SignatureData,
} from "./utils";

const STORAGE_KEY = "email-signature-generator:signature";

const COLORS = [
  { value: "#2563eb", label: "ブルー" },
  { value: "#0f766e", label: "グリーン" },
  { value: "#7c3aed", label: "パープル" },
  { value: "#be123c", label: "レッド" },
  { value: "#334155", label: "グレー" },
] as const;

type CopyStatus = "rich" | "plain" | "failed" | null;

function readSavedSignature(): SignatureData | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved) as Partial<SignatureData>;
    return { ...EMPTY_SIGNATURE, ...parsed };
  } catch {
    return null;
  }
}

export function EmailSignatureGeneratorPage() {
  const [data, setData] = useState<SignatureData>(EMPTY_SIGNATURE);
  const [copyStatus, setCopyStatus] = useState<CopyStatus>(null);
  const [loaded, setLoaded] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = readSavedSignature();
    const timer = window.setTimeout(() => {
      if (saved) setData(saved);
      setLoaded(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch {
        // Storage may be disabled or full. The generator still works.
      }
    }, 300);
    return () => window.clearTimeout(timer);
  }, [data, loaded]);

  const html = useMemo(() => generateSignatureHtml(data), [data]);
  const plainText = useMemo(() => generatePlainText(data), [data]);
  const canCopy = hasSignatureContent(data);

  const update = useCallback((field: keyof SignatureData, value: string) => {
    setData((current) => ({ ...current, [field]: value }));
    setCopyStatus(null);
  }, []);

  const showStatus = useCallback((status: CopyStatus) => {
    setCopyStatus(status);
    window.setTimeout(() => setCopyStatus(null), 3000);
  }, []);

  const copyRichSignature = useCallback(async () => {
    if (!canCopy) return;
    try {
      if (
        typeof ClipboardItem !== "undefined" &&
        typeof navigator.clipboard?.write === "function"
      ) {
        const item = new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([plainText], { type: "text/plain" }),
        });
        await navigator.clipboard.write([item]);
        showStatus("rich");
        return;
      }

      const selection = window.getSelection();
      if (!selection || !previewRef.current)
        throw new Error("copy unavailable");
      const range = document.createRange();
      range.selectNodeContents(previewRef.current);
      selection.removeAllRanges();
      selection.addRange(range);
      const copied = document.execCommand("copy");
      selection.removeAllRanges();
      if (!copied) throw new Error("copy failed");
      showStatus("rich");
    } catch {
      showStatus("failed");
    }
  }, [canCopy, html, plainText, showStatus]);

  const copyPlainText = useCallback(async () => {
    if (!canCopy) return;
    try {
      await navigator.clipboard.writeText(plainText);
      showStatus("plain");
    } catch {
      showStatus("failed");
    }
  }, [canCopy, plainText, showStatus]);

  const clearAll = useCallback(() => {
    if (!window.confirm("入力内容をすべて消去しますか？")) return;
    setData(EMPTY_SIGNATURE);
    setCopyStatus(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore unavailable storage.
    }
  }, []);

  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
          業務効率化
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          メール署名ジェネレーター
        </h1>
        <p className="mt-4 max-w-3xl leading-7 text-slate-600">
          名前や会社情報を入力するだけで、Gmail・Outlookに貼り付けられる見やすいメール署名を作成できます。
        </p>

        <div className="mt-6 flex gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-950">
          <span aria-hidden="true" className="text-lg">
            ✓
          </span>
          <p>
            <strong>AI不使用・入力内容はブラウザ内だけで処理。</strong>
            氏名や連絡先をサクプラのサーバーへ送信しません。この端末のブラウザに自動保存されます。
          </p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)]">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-black text-slate-950">
                1. 掲載情報を入力
              </h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setData(SAMPLE_SIGNATURE)}
                  data-analytics-event="sample_load"
                  data-analytics-tool-id="email-signature-generator"
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:border-blue-400 hover:text-blue-700"
                >
                  サンプルを試す
                </button>
                <button
                  type="button"
                  onClick={clearAll}
                  className="rounded-full px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                >
                  すべて消去
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-bold text-slate-700">
                氏名 <span className="text-rose-600">必須</span>
                <input
                  value={data.name}
                  onChange={(event) => update("name", event.target.value)}
                  placeholder="例：山田 太郎"
                  className={inputClass}
                />
              </label>
              <label className="text-sm font-bold text-slate-700">
                役職
                <input
                  value={data.role}
                  onChange={(event) => update("role", event.target.value)}
                  placeholder="例：代表取締役"
                  className={inputClass}
                />
              </label>
              <label className="text-sm font-bold text-slate-700">
                会社・屋号
                <input
                  value={data.company}
                  onChange={(event) => update("company", event.target.value)}
                  placeholder="例：株式会社サクプラ"
                  className={inputClass}
                />
              </label>
              <label className="text-sm font-bold text-slate-700">
                部署名
                <input
                  value={data.department}
                  onChange={(event) => update("department", event.target.value)}
                  placeholder="例：営業部"
                  className={inputClass}
                />
              </label>
              <label className="text-sm font-bold text-slate-700">
                メールアドレス
                <input
                  type="email"
                  value={data.email}
                  onChange={(event) => update("email", event.target.value)}
                  placeholder="name@example.com"
                  className={inputClass}
                />
              </label>
              <label className="text-sm font-bold text-slate-700">
                電話番号
                <input
                  type="tel"
                  value={data.phone}
                  onChange={(event) => update("phone", event.target.value)}
                  placeholder="03-1234-5678"
                  className={inputClass}
                />
              </label>
              <label className="text-sm font-bold text-slate-700 sm:col-span-2">
                Webサイト
                <input
                  type="url"
                  value={data.website}
                  onChange={(event) => update("website", event.target.value)}
                  placeholder="https://example.com"
                  className={inputClass}
                />
              </label>
              <label className="text-sm font-bold text-slate-700 sm:col-span-2">
                住所
                <input
                  value={data.address}
                  onChange={(event) => update("address", event.target.value)}
                  placeholder="例：東京都千代田区1-2-3"
                  className={inputClass}
                />
              </label>
            </div>

            <fieldset className="mt-7">
              <legend className="text-sm font-black text-slate-950">
                デザイン
              </legend>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {[
                  ["accent", "アクセント付き"],
                  ["minimal", "シンプル"],
                ].map(([value, label]) => (
                  <label
                    key={value}
                    className={`cursor-pointer rounded-xl border p-4 text-sm font-bold ${data.template === value ? "border-blue-500 bg-blue-50 text-blue-900" : "border-slate-200 text-slate-700"}`}
                  >
                    <input
                      type="radio"
                      name="template"
                      value={value}
                      checked={data.template === value}
                      onChange={() => update("template", value)}
                      className="mr-2 accent-blue-600"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>

            {data.template === "accent" && (
              <fieldset className="mt-5">
                <legend className="text-sm font-black text-slate-950">
                  アクセントカラー
                </legend>
                <div className="mt-3 flex flex-wrap gap-3">
                  {COLORS.map((color) => (
                    <label key={color.value} className="cursor-pointer">
                      <input
                        type="radio"
                        name="accentColor"
                        value={color.value}
                        checked={data.accentColor === color.value}
                        onChange={() => update("accentColor", color.value)}
                        className="sr-only"
                      />
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-full border-4 transition ${data.accentColor === color.value ? "border-slate-950" : "border-white ring-1 ring-slate-300"}`}
                        style={{ backgroundColor: color.value }}
                        title={color.label}
                      >
                        <span className="sr-only">{color.label}</span>
                      </span>
                    </label>
                  ))}
                </div>
                <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <input
                    type="color"
                    aria-label="カスタムカラー"
                    value={normalizeAccentColor(data.accentColor)}
                    onInput={(event) =>
                      update(
                        "accentColor",
                        (event.target as HTMLInputElement).value,
                      )
                    }
                    className="h-11 w-14 cursor-pointer rounded-lg border border-slate-300 bg-white p-1"
                  />
                  <span className="text-sm font-bold text-slate-700">
                    自由に選ぶ
                    <span className="ml-2 font-mono text-xs font-medium uppercase text-slate-500">
                      {normalizeAccentColor(data.accentColor)}
                    </span>
                  </span>
                </label>
              </fieldset>
            )}
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <h2 className="text-xl font-black text-slate-950">
              2. プレビューしてコピー
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              コピーされる内容を表示しています。メールアプリや受信環境によって見た目が多少異なる場合があります。
            </p>
            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
              <div className="border-b border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-500">
                新規メッセージ
              </div>
              <div className="min-h-72 bg-white p-6">
                <p className="text-sm leading-7 text-slate-500">
                  よろしくお願いいたします。
                </p>
                <div className="my-5 border-t border-slate-100" />
                {canCopy ? (
                  <div
                    ref={previewRef}
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm leading-6 text-slate-500">
                    氏名を入力すると、ここに署名が表示されます。
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={copyRichSignature}
              disabled={!canCopy}
              data-analytics-event="tool_run"
              data-analytics-tool-id="email-signature-generator"
              data-analytics-platform="email"
              className="mt-4 w-full rounded-full bg-blue-600 px-6 py-4 text-base font-black text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              書式付き署名をコピー
            </button>
            <button
              type="button"
              onClick={copyPlainText}
              disabled={!canCopy}
              data-analytics-event="tool_result_copy"
              data-analytics-tool-id="email-signature-generator"
              data-analytics-result-type="plain_text"
              className="mt-3 w-full rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 hover:border-blue-400 hover:text-blue-700 disabled:cursor-not-allowed disabled:text-slate-300"
            >
              テキスト版をコピー
            </button>

            <div
              aria-live="polite"
              className="mt-3 min-h-7 text-center text-sm font-bold"
            >
              {copyStatus === "rich" && (
                <span className="text-emerald-700">
                  コピーしました。メール設定画面へ貼り付けてください。
                </span>
              )}
              {copyStatus === "plain" && (
                <span className="text-emerald-700">
                  テキスト版をコピーしました。
                </span>
              )}
              {copyStatus === "failed" && (
                <span className="text-rose-700">
                  コピーできませんでした。ブラウザの権限を確認してください。
                </span>
              )}
            </div>

            <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              <p className="font-black text-slate-900">貼り付け先</p>
              <p className="mt-1">
                <strong>Gmail：</strong>設定 → すべての設定を表示 → 署名
              </p>
              <p>
                <strong>Outlook：</strong>設定 → アカウント → 署名
              </p>
              <p className="mt-2 text-xs text-slate-500">
                貼り付け後にテストメールを送り、PCとスマホで表示を確認してください。
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
