"use client";

import { useMemo, useState } from "react";
import {
  compliance,
  contrastRatio,
  nearestPassingColor,
  normalizeHex,
} from "./utils";

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [text, setText] = useState(value);
  const commit = (next: string) => {
    setText(next);
    const valid = normalizeHex(next);
    if (valid) onChange(valid);
  };
  return (
    <label className="block text-sm font-bold text-slate-700">
      {label}
      <span className="mt-2 flex items-center gap-2 rounded-xl border border-slate-300 bg-white p-2 focus-within:border-blue-500">
        <input
          type="color"
          value={value}
          onChange={(event) => {
            setText(event.target.value);
            onChange(event.target.value);
          }}
          className="h-10 w-12 cursor-pointer border-0 bg-transparent"
        />
        <input
          value={text}
          onChange={(event) => commit(event.target.value)}
          onBlur={() => setText(value)}
          className="min-w-0 flex-1 px-2 py-2 font-mono uppercase outline-none"
        />
      </span>
    </label>
  );
}

function ComplianceBadge({
  pass,
  children,
}: {
  pass: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-xl p-3 text-center ${pass ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-700"}`}
    >
      <strong className="block">{pass ? "合格" : "不合格"}</strong>
      <span className="text-xs font-bold">{children}</span>
    </div>
  );
}

export function ContrastColorFixerPage() {
  const [foreground, setForeground] = useState("#64748b");
  const [background, setBackground] = useState("#ffffff");
  const ratio = useMemo(
    () => contrastRatio(foreground, background),
    [foreground, background],
  );
  const result = compliance(ratio);
  const aaSuggestion = useMemo(
    () => nearestPassingColor(foreground, background, 4.5),
    [foreground, background],
  );
  const aaaSuggestion = useMemo(
    () => nearestPassingColor(foreground, background, 7),
    [foreground, background],
  );
  const copy = (value: string) => navigator.clipboard.writeText(value);
  const css = `--text-color: ${result.normalAA ? foreground : aaSuggestion};\n--background-color: ${background};`;
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
          Web制作
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          配色コントラスト改善ツール
        </h1>
        <p className="mt-4 max-w-3xl leading-7 text-slate-600">
          文字色と背景色の見やすさをWCAG
          2.2の計算方法で判定し、元の色味に近い合格色を提案します。カラーピッカーとカラーコードのどちらでも入力できます。
        </p>
        <div className="mt-8 grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
          <section>
            <h2 className="text-xl font-black text-slate-950">1. 配色を入力</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <ColorField
                label="文字色"
                value={foreground}
                onChange={setForeground}
              />
              <ColorField
                label="背景色"
                value={background}
                onChange={setBackground}
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setForeground(background);
                setBackground(foreground);
              }}
              className="mt-4 w-full rounded-full border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700"
            >
              文字色と背景色を入れ替える
            </button>
            <div className="mt-5 rounded-3xl bg-slate-950 p-6 text-center text-white">
              <p className="text-sm font-bold text-slate-300">コントラスト比</p>
              <p className="mt-2 text-5xl font-black">
                {ratio.toFixed(2)}
                <span className="text-2xl"> : 1</span>
              </p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <ComplianceBadge pass={result.normalAA}>
                通常文字 AA（4.5以上）
              </ComplianceBadge>
              <ComplianceBadge pass={result.largeAA}>
                大きな文字 AA（3以上）
              </ComplianceBadge>
              <ComplianceBadge pass={result.normalAAA}>
                通常文字 AAA（7以上）
              </ComplianceBadge>
              <ComplianceBadge pass={result.largeAAA}>
                大きな文字 AAA（4.5以上）
              </ComplianceBadge>
            </div>
          </section>
          <section>
            <h2 className="text-xl font-black text-slate-950">
              2. 実表示と改善色
            </h2>
            <div
              style={{ color: foreground, backgroundColor: background }}
              className="mt-4 rounded-3xl border border-slate-200 p-6 sm:p-8"
            >
              <p className="text-2xl font-black">
                読みやすい見出しのプレビュー
              </p>
              <p className="mt-3 text-base leading-7">
                本文の文字は見出しより小さいため、より高いコントラストが必要です。実際の文章量で読みやすさを確認できます。
              </p>
              <button
                type="button"
                style={{ borderColor: foreground }}
                className="mt-5 rounded-full border-2 px-5 py-2 font-bold"
              >
                ボタン表示
              </button>
            </div>
            {!result.normalAA ? (
              <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-5">
                <strong className="text-blue-950">
                  通常文字のAA基準を満たす近似色
                </strong>
                <div className="mt-3 flex items-center gap-3">
                  <span
                    className="h-12 w-12 rounded-xl border border-black/10"
                    style={{ backgroundColor: aaSuggestion }}
                  />
                  <button
                    type="button"
                    onClick={() => setForeground(aaSuggestion)}
                    data-analytics-event="tool_run"
                    data-analytics-tool-id="contrast-color-fixer"
                    className="flex-1 rounded-full bg-blue-600 px-4 py-3 font-mono font-black text-white"
                  >
                    {aaSuggestion} を適用
                  </button>
                </div>
                {contrastRatio(aaaSuggestion, background) >= 7 && (
                  <button
                    type="button"
                    onClick={() => setForeground(aaaSuggestion)}
                    className="mt-2 w-full rounded-full border border-blue-300 px-4 py-2 text-sm font-bold text-blue-800"
                  >
                    AAA候補 {aaaSuggestion}
                  </button>
                )}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl bg-emerald-50 p-5 font-bold text-emerald-800">
                ✓ 通常文字のAA基準を満たしています。
              </div>
            )}
            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-2">
                <strong className="text-sm text-slate-800">CSS変数</strong>
                <button
                  type="button"
                  onClick={() => copy(css)}
                  className="rounded-full border border-slate-300 px-3 py-1 text-xs font-bold"
                >
                  コピー
                </button>
              </div>
              <pre className="mt-2 overflow-x-auto text-xs leading-6 text-slate-600">
                {css}
              </pre>
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-500">
              この判定は配色のコントラストだけを確認します。文字サイズ、太さ、フォーカス表示、色だけに依存しない情報設計などは別途確認してください。
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
