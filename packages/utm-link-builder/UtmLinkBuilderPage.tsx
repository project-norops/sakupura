"use client";

import QRCode from "qrcode";
import { useEffect, useMemo, useState } from "react";
import {
  buildUtmUrl,
  normalizeUtmValue,
  utmWarnings,
  validateDestination,
  type UtmInput,
} from "./utils";

const EMPTY: UtmInput = {
  url: "",
  source: "",
  medium: "",
  campaign: "",
  term: "",
  content: "",
};
const PRESETS = [
  { label: "Xの通常投稿", source: "x", medium: "social" },
  { label: "メールマガジン", source: "newsletter", medium: "email" },
  { label: "紙のチラシ・QR", source: "flyer", medium: "qr" },
];

export function UtmLinkBuilderPage() {
  const [input, setInput] = useState<UtmInput>(EMPTY);
  const [qr, setQr] = useState("");
  const [copied, setCopied] = useState(false);
  const error = input.url ? validateDestination(input.url) : null;
  const complete =
    !error &&
    input.url &&
    input.source.trim() &&
    input.medium.trim() &&
    input.campaign.trim();
  const result = useMemo(() => {
    try {
      return complete ? buildUtmUrl(input) : "";
    } catch {
      return "";
    }
  }, [complete, input]);
  const warnings = useMemo(() => utmWarnings(input), [input]);

  useEffect(() => {
    let active = true;
    if (!result) {
      return;
    }
    QRCode.toDataURL(result, {
      width: 480,
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: "#0f172a", light: "#ffffff" },
    }).then((data) => {
      if (active) setQr(data);
    });
    return () => {
      active = false;
    };
  }, [result]);

  const update = (key: keyof UtmInput, value: string) =>
    setInput((current) => ({ ...current, [key]: value }));
  const copy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };
  const downloadQr = () => {
    if (!qr) return;
    const anchor = document.createElement("a");
    anchor.href = qr;
    anchor.download = "utm-qr-code.png";
    anchor.click();
  };
  const field =
    "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
          アクセス解析
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          UTMリンク・QRコード作成ツール
        </h1>
        <p className="mt-4 max-w-3xl leading-7 text-slate-600">
          SNS、メルマガ、チラシからの流入をGA4で区別する計測URLを作成します。命名を小文字に統一し、その場でQRコードも保存できます。
        </p>
        <div className="mt-8 grid gap-8 lg:grid-cols-[.95fr_1.05fr]">
          <section>
            <h2 className="text-xl font-black text-slate-950">
              1. 計測条件を入力
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() =>
                    setInput((current) => ({
                      ...current,
                      source: preset.source,
                      medium: preset.medium,
                    }))
                  }
                  className="rounded-full border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 hover:border-blue-400 hover:text-blue-700"
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <label className="mt-4 block text-sm font-bold text-slate-700">
              リンク先URL <span className="text-rose-600">必須</span>
              <input
                type="url"
                value={input.url}
                onChange={(event) => update("url", event.target.value)}
                placeholder="https://www.example.com/service"
                className={field}
              />
            </label>
            {error && (
              <p className="mt-2 text-sm font-bold text-rose-700">{error}</p>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="mt-4 block text-sm font-bold text-slate-700">
                流入元（utm_source） <span className="text-rose-600">必須</span>
                <input
                  value={input.source}
                  onChange={(event) => update("source", event.target.value)}
                  placeholder="x"
                  className={field}
                />
                <span className="mt-1 block text-xs font-normal leading-5 text-slate-500">
                  どこから来たか。例：x、google、newsletter
                </span>
                {input.source &&
                  normalizeUtmValue(input.source) !== input.source && (
                    <span className="mt-1 block text-xs font-normal text-blue-700">
                      生成時：
                      {normalizeUtmValue(input.source) ||
                        "使用できる半角英数字がありません"}
                    </span>
                  )}
              </label>
              <label className="mt-4 block text-sm font-bold text-slate-700">
                配信手段（utm_medium）{" "}
                <span className="text-rose-600">必須</span>
                <input
                  value={input.medium}
                  onChange={(event) => update("medium", event.target.value)}
                  placeholder="social"
                  className={field}
                />
                <span className="mt-1 block text-xs font-normal leading-5 text-slate-500">
                  どの手段で届けたか。例：social、email、cpc、qr
                </span>
                {input.medium &&
                  normalizeUtmValue(input.medium) !== input.medium && (
                    <span className="mt-1 block text-xs font-normal text-blue-700">
                      生成時：
                      {normalizeUtmValue(input.medium) ||
                        "使用できる半角英数字がありません"}
                    </span>
                  )}
              </label>
            </div>
            <label className="mt-4 block text-sm font-bold text-slate-700">
              キャンペーン名（utm_campaign）{" "}
              <span className="text-rose-600">必須</span>
              <input
                value={input.campaign}
                onChange={(event) => update("campaign", event.target.value)}
                placeholder="summer_sale_2026"
                className={field}
              />
              <span className="mt-1 block text-xs font-normal leading-5 text-slate-500">
                どの施策かをまとめる名前。例：new_tool_launch、summer_sale_2026
              </span>
              {input.campaign &&
                normalizeUtmValue(input.campaign) !== input.campaign && (
                  <span className="mt-1 block text-xs font-normal text-blue-700">
                    生成時：
                    {normalizeUtmValue(input.campaign) ||
                      "使用できる半角英数字がありません"}
                  </span>
                )}
            </label>
            <p className="mt-4 rounded-xl bg-blue-50 p-3 text-xs leading-5 text-blue-950">
              GA4上でキャンペーンの集計がばらつくのを防ぐため、このツールでは流入元・配信手段・キャンペーン名を必須にしています。
            </p>
            <details className="mt-4 rounded-xl border border-slate-200 p-4">
              <summary className="cursor-pointer text-sm font-bold text-slate-700">
                任意項目を追加
              </summary>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-bold text-slate-700">
                  検索語句 utm_term
                  <input
                    value={input.term}
                    onChange={(event) => update("term", event.target.value)}
                    className={field}
                  />
                </label>
                <label className="text-sm font-bold text-slate-700">
                  クリエイティブ utm_content
                  <input
                    value={input.content}
                    onChange={(event) => update("content", event.target.value)}
                    className={field}
                  />
                </label>
              </div>
            </details>
            {warnings.length > 0 && (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <strong className="text-sm text-amber-950">命名チェック</strong>
                <ul className="mt-2 space-y-1 text-sm leading-6 text-amber-900">
                  {warnings.map((warning) => (
                    <li key={warning}>・{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
          <section>
            <h2 className="text-xl font-black text-slate-950">
              2. リンクとQRコードを利用
            </h2>
            {!result ? (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
                必須項目を入力すると自動で生成されます。
              </div>
            ) : (
              <div className="mt-4 rounded-3xl border border-blue-200 bg-blue-50 p-5">
                <label className="text-sm font-black text-blue-950">
                  完成したUTMリンク
                  <textarea
                    readOnly
                    value={result}
                    rows={5}
                    className="mt-2 w-full resize-none rounded-xl border border-blue-200 bg-white p-3 font-mono text-xs leading-5 text-slate-800"
                  />
                </label>
                <button
                  type="button"
                  onClick={copy}
                  data-analytics-event="tool_run"
                  data-analytics-tool-id="utm-link-builder"
                  className="mt-3 w-full rounded-full bg-blue-600 px-5 py-3 font-black text-white hover:bg-blue-700"
                >
                  {copied ? "コピーしました" : "UTMリンクをコピー"}
                </button>
                {result && qr && (
                  <div className="mt-5 rounded-2xl bg-white p-5 text-center">
                    {/* QR is generated as a local data URL and is intentionally rendered without Next image optimization. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qr}
                      alt="作成したUTMリンクのQRコード"
                      className="mx-auto h-52 w-52"
                    />
                    <button
                      type="button"
                      onClick={downloadQr}
                      className="mt-3 rounded-full border border-slate-300 px-5 py-2 text-sm font-bold text-slate-700"
                    >
                      QRコードをPNG保存
                    </button>
                  </div>
                )}
              </div>
            )}
            <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              <strong className="text-slate-900">入力内容は送信しません</strong>
              <br />
              リンク生成とQRコード作成はブラウザ内で完結します。サクプラのアクセス解析にも入力URLやキャンペーン名は送りません。
            </div>
            <div className="mt-4 rounded-2xl border border-slate-200 p-4 text-sm leading-6 text-slate-600">
              <strong className="text-slate-900">入力に迷ったとき</strong>
              <br />
              <a
                href="https://support.google.com/analytics/answer/10917952?hl=ja"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-blue-700 underline underline-offset-2"
              >
                Google Analytics公式：カスタムURLでキャンペーンを計測する
              </a>
              <br />
              <a
                href="https://ga-dev-tools.google/campaign-url-builder/?web=1"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-blue-700 underline underline-offset-2"
              >
                Google公式 Campaign URL Builder
              </a>
            </div>
          </section>
        </div>
        <p className="mt-8 border-t border-slate-200 pt-5 text-xs leading-5 text-slate-500">
          本ツールはGoogleの公式ツールではなく、Googleとの提携・承認関係はありません。入力内容や生成したキャンペーン情報をGoogle
          Analyticsへ送信する機能はありません。
        </p>
      </section>
    </main>
  );
}
