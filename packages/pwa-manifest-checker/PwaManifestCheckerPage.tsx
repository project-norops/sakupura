"use client";

import { PremiumInterestCards } from "@sakupla/shared-ui/PremiumInterestCards";
import { useEffect, useMemo, useState } from "react";
import {
  analyzeManifest,
  parseManifest,
  serializeManifest,
  type LoadedIcon,
  type ManifestAnalysis,
} from "./utils";

const MAX_MANIFEST_SIZE = 1024 * 1024;
const SAMPLE_MANIFEST = {
  name: "サクプラ サンプル",
  short_name: "サンプル",
  start_url: "/app/",
  scope: "/app/",
  display: "standalone",
  theme_color: "#0f172a",
  background_color: "#ffffff",
  icons: [
    {
      src: "/icons/icon-192.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/icons/icon-512-maskable.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "any maskable",
    },
  ],
};

const PREMIUM_CANDIDATES = [
  {
    featureId: "project_manifest_save" as const,
    name: "プロジェクト別設定保存",
    description:
      "確認済みのマニフェストURLや基準をプロジェクトごとに保存し、更新時に再確認できる候補です。",
  },
  {
    featureId: "icon_pack_export" as const,
    name: "アイコン一式の書き出し",
    description:
      "元画像から推奨サイズのアイコン候補とマニフェスト記述をまとめて作る機能候補です。",
  },
];

function sampleIcon(fileName: string, size: number, color: string): LoadedIcon {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" rx="${size / 5}" fill="${color}"/><circle cx="${size / 2}" cy="${size / 2}" r="${size / 4}" fill="white"/><path d="M${size * 0.38} ${size * 0.52}l${size * 0.08} ${size * 0.08} ${size * 0.18}-${size * 0.2}" fill="none" stroke="${color}" stroke-width="${size * 0.055}" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  return {
    fileName,
    width: size,
    height: size,
    mimeType: "image/png",
    previewUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
  };
}

async function readIcon(file: File): Promise<LoadedIcon> {
  const previewUrl = URL.createObjectURL(file);
  try {
    if (typeof createImageBitmap === "function") {
      try {
        const bitmap = await createImageBitmap(file);
        const result = {
          fileName: file.name,
          width: bitmap.width,
          height: bitmap.height,
          mimeType: file.type,
          previewUrl,
        };
        bitmap.close();
        return result;
      } catch {
        // SVGなどcreateImageBitmap非対応の画像はHTMLImageElementで確認する。
      }
    }
    const dimensions = await new Promise<{ width: number; height: number }>(
      (resolve, reject) => {
        const image = new Image();
        image.onload = () =>
          resolve({ width: image.naturalWidth, height: image.naturalHeight });
        image.onerror = () => reject(new Error("画像を読み込めませんでした。"));
        image.src = previewUrl;
      },
    );
    return {
      fileName: file.name,
      ...dimensions,
      mimeType: file.type,
      previewUrl,
    };
  } catch (error) {
    URL.revokeObjectURL(previewUrl);
    throw error;
  }
}

function download(content: string, fileName: string) {
  const url = URL.createObjectURL(
    new Blob([content], { type: "application/manifest+json;charset=utf-8" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function PwaManifestCheckerPage() {
  const [manifestText, setManifestText] = useState(
    serializeManifest(SAMPLE_MANIFEST),
  );
  const [manifestUrl, setManifestUrl] = useState(
    "https://example.com/app.webmanifest",
  );
  const [icons, setIcons] = useState<LoadedIcon[]>([]);
  const [analysis, setAnalysis] = useState<ManifestAnalysis | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(
    () => () => {
      icons.forEach((icon) => {
        if (icon.previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(icon.previewUrl);
        }
      });
    },
    [icons],
  );

  const counts = useMemo(() => {
    const issues = analysis?.issues ?? [];
    return {
      error: issues.filter((issue) => issue.level === "error").length,
      warning: issues.filter((issue) => issue.level === "warning").length,
      info: issues.filter((issue) => issue.level === "info").length,
    };
  }, [analysis]);

  const maskable = analysis?.icons.find(
    (icon) => icon.loaded && icon.purpose.split(/\s+/).includes("maskable"),
  );

  const loadSample = () => {
    setManifestText(serializeManifest(SAMPLE_MANIFEST));
    setManifestUrl("https://example.com/app.webmanifest");
    setIcons([
      sampleIcon("icon-192.png", 192, "#2563eb"),
      sampleIcon("icon-512-maskable.png", 512, "#0f766e"),
    ]);
    setAnalysis(null);
    setError("");
  };

  const loadManifestFile = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_MANIFEST_SIZE) {
      setError("マニフェストは1MB以下のJSONファイルを選択してください。");
      return;
    }
    try {
      const text = await file.text();
      parseManifest(text);
      setManifestText(text);
      setAnalysis(null);
      setError("");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "マニフェストを読み込めませんでした。",
      );
    }
  };

  const loadIconFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    try {
      const next = await Promise.all(Array.from(files).map(readIcon));
      setIcons(next);
      setAnalysis(null);
      setError("");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "画像を読み込めませんでした。",
      );
    }
  };

  const runCheck = () => {
    try {
      setAnalysis(
        analyzeManifest(parseManifest(manifestText), manifestUrl, icons),
      );
      setError("");
      setCopied(false);
    } catch (caught) {
      setAnalysis(null);
      setError(
        caught instanceof Error
          ? caught.message
          : "確認を実行できませんでした。",
      );
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">
          Web制作・改善
        </p>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          PWAマニフェスト・アイコン事前チェック
        </h1>
        <p className="mt-4 leading-7 text-slate-600">
          公開前のWeb App
          Manifestとアイコン画像を読み込み、必須項目、URLの関係、宣言サイズと実寸、maskable表示をまとめて確認できます。ファイルは外部へ送らず、このブラウザ内だけで処理します。
        </p>

        <section
          aria-labelledby="quick-steps"
          className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 sm:p-5"
        >
          <h2 id="quick-steps" className="font-black text-slate-950">
            かんたん操作手順
          </h2>
          <ol className="mt-3 grid gap-3 text-sm text-slate-700 sm:grid-cols-4">
            {[
              "JSONを読み込む",
              "アイコンを選ぶ",
              "事前チェック",
              "修正版を確認",
            ].map((step, index) => (
              <li key={step} className="flex items-center gap-2">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-indigo-700 font-black text-white">
                  {index + 1}
                </span>
                <span className="font-bold">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={loadSample}
            data-analytics-event="sample_load"
            data-analytics-tool-id="pwa-manifest-checker"
            className="min-h-11 rounded-full border border-indigo-300 px-4 py-2 text-sm font-bold text-indigo-800 hover:border-indigo-600"
          >
            操作サンプルを読み込む
          </button>
          <button
            type="button"
            onClick={() =>
              download(
                serializeManifest(SAMPLE_MANIFEST),
                "manifest-sample.webmanifest",
              )
            }
            className="min-h-11 rounded-full border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:border-slate-500"
          >
            サンプルJSONを保存
          </button>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <section aria-labelledby="manifest-input-title">
            <h2
              id="manifest-input-title"
              className="text-lg font-black text-slate-950"
            >
              1. マニフェスト
            </h2>
            <label className="mt-3 block text-sm font-bold text-slate-700">
              マニフェストURL
              <input
                type="url"
                value={manifestUrl}
                onChange={(event) => {
                  setManifestUrl(event.target.value);
                  setAnalysis(null);
                }}
                className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 px-3 py-2 font-normal"
                placeholder="https://example.com/app.webmanifest"
              />
            </label>
            <label className="mt-3 flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold text-indigo-700 hover:border-indigo-500">
              JSONファイルを選択
              <input
                className="sr-only"
                type="file"
                accept=".json,.webmanifest,application/json,application/manifest+json"
                onChange={(event) =>
                  void loadManifestFile(event.target.files?.[0])
                }
              />
            </label>
            <label className="mt-3 block text-sm font-bold text-slate-700">
              JSON内容
              <textarea
                value={manifestText}
                onChange={(event) => {
                  setManifestText(event.target.value);
                  setAnalysis(null);
                }}
                spellCheck={false}
                className="mt-2 min-h-80 w-full rounded-xl border border-slate-300 p-3 font-mono text-xs leading-6"
              />
            </label>
          </section>

          <section aria-labelledby="icon-input-title">
            <h2
              id="icon-input-title"
              className="text-lg font-black text-slate-950"
            >
              2. 端末内のアイコン
            </h2>
            <label className="mt-3 flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-center hover:border-indigo-500">
              <strong className="text-indigo-700">
                アイコン画像を複数選択
              </strong>
              <span className="mt-1 text-xs text-slate-500">
                PNG・WebP・JPEG・SVGなど
              </span>
              <input
                className="sr-only"
                type="file"
                accept="image/*"
                multiple
                onChange={(event) => void loadIconFiles(event.target.files)}
              />
            </label>
            {icons.length ? (
              <div className="mt-3 space-y-3">
                {icons.map((icon) => (
                  <div
                    key={icon.fileName}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 p-3"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={icon.previewUrl}
                      alt=""
                      className="size-14 rounded-xl bg-slate-100 object-contain"
                    />
                    <div className="min-w-0">
                      <strong className="block break-all text-sm text-slate-950">
                        {icon.fileName}
                      </strong>
                      <span className="text-xs text-slate-600">
                        {icon.width}×{icon.height}px・
                        {icon.mimeType || "MIME不明"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
                JSONだけでも確認できます。実寸とMIMEを照合するには、srcと同じファイル名の画像を選んでください。
              </p>
            )}
            <button
              type="button"
              onClick={runCheck}
              data-analytics-event="tool_run"
              data-analytics-tool-id="pwa-manifest-checker"
              className="mt-5 min-h-12 w-full rounded-full bg-indigo-700 px-6 py-3 font-black text-white hover:bg-indigo-800"
            >
              マニフェストとアイコンを確認
            </button>
          </section>
        </div>

        {error ? (
          <p
            role="alert"
            className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800"
          >
            {error}
          </p>
        ) : null}

        {analysis ? (
          <section
            aria-labelledby="result-title"
            className="mt-8 border-t border-slate-200 pt-7"
          >
            <p className="text-xs font-black uppercase tracking-[.16em] text-indigo-700">
              事前チェック結果
            </p>
            <h2
              id="result-title"
              className="mt-1 text-2xl font-black text-slate-950"
            >
              {counts.error
                ? `${counts.error}件の要修正があります`
                : "重大な指摘はありません"}
            </h2>
            <div className="mt-4 grid grid-cols-3 gap-2 sm:max-w-lg sm:gap-3">
              {[
                ["要修正", counts.error, "text-red-700"],
                ["要確認", counts.warning, "text-amber-700"],
                ["未確認", counts.info, "text-slate-700"],
              ].map(([label, count, color]) => (
                <div
                  key={String(label)}
                  className="rounded-xl bg-slate-50 p-3 text-center"
                >
                  <span className="block text-xs text-slate-600">{label}</span>
                  <strong className={`mt-1 block text-2xl ${color}`}>
                    {count}
                  </strong>
                </div>
              ))}
            </div>

            {analysis.issues.length ? (
              <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-3 py-2">重要度</th>
                      <th className="px-3 py-2">項目</th>
                      <th className="px-3 py-2">確認内容</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.issues.map((issue, index) => (
                      <tr
                        key={`${issue.path}-${index}`}
                        className="border-t border-slate-200"
                      >
                        <td className="px-3 py-2 font-bold">
                          {issue.level === "error"
                            ? "要修正"
                            : issue.level === "warning"
                              ? "要確認"
                              : "未確認"}
                        </td>
                        <td className="px-3 py-2 font-mono text-xs">
                          {issue.path}
                        </td>
                        <td className="px-3 py-2">{issue.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-4 rounded-xl bg-emerald-50 p-4 font-bold text-emerald-800">
                サンプルの主要項目、URL関係、宣言サイズと実寸は一致しています。
              </p>
            )}

            {maskable?.loaded ? (
              <section
                aria-labelledby="maskable-title"
                className="mt-6 rounded-2xl border border-teal-200 bg-teal-50 p-4 sm:p-5"
              >
                <h3 id="maskable-title" className="font-black text-slate-950">
                  maskable安全領域の目安
                </h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-[180px_1fr] sm:items-center">
                  <div className="relative mx-auto aspect-square w-44 overflow-hidden rounded-full bg-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={maskable.loaded.previewUrl}
                      alt="maskableアイコンの円形表示例"
                      className="size-full object-cover"
                    />
                    <div className="pointer-events-none absolute inset-[10%] rounded-full border-2 border-dashed border-white shadow-[0_0_0_1px_rgba(15,23,42,.45)]" />
                  </div>
                  <p className="text-sm leading-6 text-slate-700">
                    点線内は中心から直径80%の安全領域の目安です。重要なロゴや文字が点線内に収まるか確認してください。端末ごとの切り抜き形状を完全に再現するものではありません。
                  </p>
                </div>
              </section>
            ) : null}

            <section aria-labelledby="corrected-title" className="mt-6">
              <h3 id="corrected-title" className="font-black text-slate-950">
                実画像に合わせた修正版JSON
              </h3>
              <textarea
                readOnly
                value={serializeManifest(analysis.corrected)}
                aria-label="実画像に合わせた修正版JSON"
                className="mt-3 min-h-72 w-full rounded-xl border border-slate-300 bg-slate-50 p-3 font-mono text-xs leading-6"
              />
              <div className="mt-3 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(
                      serializeManifest(analysis.corrected),
                    );
                    setCopied(true);
                  }}
                  className="min-h-11 rounded-full border border-indigo-300 px-4 py-2 text-sm font-bold text-indigo-800"
                >
                  {copied ? "コピーしました" : "修正版JSONをコピー"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    download(
                      serializeManifest(analysis.corrected),
                      "manifest-corrected.webmanifest",
                    )
                  }
                  className="min-h-11 rounded-full bg-emerald-700 px-4 py-2 text-sm font-bold text-white"
                >
                  修正版JSONを保存
                </button>
              </div>
            </section>

            <p className="mt-5 text-sm leading-6 text-slate-600">
              この結果はPWAとしてのインストール可否や各ブラウザでの動作を保証しません。Service
              Worker、HTTPS配信、実機での表示・起動は別途確認してください。
            </p>
            <PremiumInterestCards
              toolId="pwa-manifest-checker"
              placement="result_after"
              candidates={PREMIUM_CANDIDATES}
            />
          </section>
        ) : null}

        <div className="mt-7 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
          <p>
            公式仕様を基に、主要メンバー、scopeとstart_url、アイコン候補、maskableの安全領域を静的に確認します。Web上のURLへアクセスする機能はありません。
          </p>
          <p className="mt-2">
            根拠：
            <a
              className="font-bold text-blue-700 underline"
              href="https://www.w3.org/TR/appmanifest/"
              target="_blank"
              rel="noopener noreferrer"
            >
              W3C Web Application Manifest
            </a>
            、
            <a
              className="font-bold text-blue-700 underline"
              href="https://web.dev/articles/add-manifest"
              target="_blank"
              rel="noopener noreferrer"
            >
              web.dev: Add a web app manifest
            </a>
            、
            <a
              className="font-bold text-blue-700 underline"
              href="https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/icons"
              target="_blank"
              rel="noopener noreferrer"
            >
              MDN: icons
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
