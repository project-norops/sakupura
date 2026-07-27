"use client";

import { PremiumInterestCards } from "@sakupla/shared-ui/PremiumInterestCards";
import { useEffect, useState } from "react";
import {
  diagnoseHead,
  generateMetaTags,
  validateOgpInput,
  type HeadIssue,
  type OgpInput,
} from "./utils";

const empty: OgpInput = {
  title: "",
  description: "",
  url: "",
  imageUrl: "",
  imageWidth: "1200",
  imageHeight: "630",
  imageAlt: "",
  siteName: "",
};
const sample: OgpInput = {
  title: "サクプラ｜面倒な作業をすぐに片づける",
  description: "登録不要で使える無料Webツールを提供しています。",
  url: "https://example.com/tools/sample",
  imageUrl: "https://example.com/ogp/sample.png",
  imageWidth: "1200",
  imageHeight: "630",
  imageAlt: "サクプラのツール紹介画像",
  siteName: "サクプラ",
};
const SAMPLE_IMAGE_PREVIEW = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#123a8c"/><stop offset="0.55" stop-color="#087fb4"/><stop offset="1" stop-color="#16a085"/></linearGradient></defs><rect width="1200" height="630" fill="url(#g)"/><circle cx="980" cy="110" r="220" fill="#fff" opacity=".12"/><circle cx="170" cy="540" r="270" fill="#fff" opacity=".08"/><path d="M600 150l42 116 116 42-116 42-42 116-42-116-116-42 116-42z" fill="#fff"/><circle cx="600" cy="308" r="170" fill="none" stroke="#fff" stroke-width="5" opacity=".3"/></svg>`,
)}`;

export function OgpCardPreviewPage() {
  const [input, setInput] = useState<OgpInput>(empty);
  const [head, setHead] = useState("");
  const [tags, setTags] = useState("");
  const [issues, setIssues] = useState<HeadIssue[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState("");
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [imagePreviewName, setImagePreviewName] = useState("");
  const [copied, setCopied] = useState(false);
  useEffect(
    () => () => {
      if (imagePreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    },
    [imagePreviewUrl],
  );
  const update = (key: keyof OgpInput, value: string) => {
    setInput({ ...input, [key]: value });
    setTags("");
    setCopied(false);
  };
  const run = () => {
    const validation = validateOgpInput(input);
    if (validation.errors.length) {
      setError(validation.errors.join(" "));
      setTags("");
      setWarnings(validation.warnings);
      return;
    }
    setError("");
    setWarnings(validation.warnings);
    setTags(generateMetaTags(input));
    setIssues(diagnoseHead(head));
    setCopied(false);
  };
  const copy = async () => {
    await navigator.clipboard.writeText(tags);
    setCopied(true);
  };
  const loadPreviewImage = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setImageError("画像ファイルを選択してください。");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setImageError("プレビュー用画像は10MB以下を選択してください。");
      return;
    }
    if (imagePreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImagePreviewUrl(URL.createObjectURL(file));
    setImagePreviewName(file.name);
    setImageError("");
  };
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
          発信・集客
        </p>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          OGP・SNSシェアカードプレビュー／タグ作成
        </h1>
        <p className="mt-4 leading-7 text-slate-600">
          タイトル・説明・URL・画像情報から汎用的なカード見本とOpen
          Graph・X向けmetaタグを作り、貼り付けたhead断片の不足も確認します。URL先にはアクセスしません。
        </p>
        <section
          aria-labelledby="quick-steps"
          className="mt-6 rounded-2xl bg-blue-50 p-5"
        >
          <h2 id="quick-steps" className="font-black">
            かんたん操作手順
          </h2>
          <ol className="mt-3 grid gap-2 text-sm sm:grid-cols-4">
            {[
              "ページ情報を入力",
              "画像寸法を確認",
              "タグを作成",
              "見本・診断を確認してコピー",
            ].map((step, index) => (
              <li key={step}>
                <b className="mr-2 text-blue-700">{index + 1}</b>
                {step}
              </li>
            ))}
          </ol>
        </section>
        <button
          type="button"
          className="mt-5 rounded-full border px-4 py-2 text-sm font-bold"
          onClick={() => {
            setInput(sample);
            setHead(generateMetaTags(sample));
            setTags("");
            setError("");
            setImageError("");
            if (imagePreviewUrl.startsWith("blob:")) {
              URL.revokeObjectURL(imagePreviewUrl);
            }
            setImagePreviewUrl(SAMPLE_IMAGE_PREVIEW);
            setImagePreviewName("操作サンプル画像");
          }}
        >
          操作サンプルを読み込む
        </button>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section aria-labelledby="input-heading">
            <h2 id="input-heading" className="text-xl font-black">
              ページと画像の情報
            </h2>
            <div className="mt-4 grid gap-4">
              {(
                [
                  {
                    key: "title",
                    label: "タイトル",
                    placeholder: "ページのタイトル",
                  },
                  {
                    key: "description",
                    label: "説明",
                    placeholder: "ページの概要",
                  },
                  {
                    key: "url",
                    label: "ページURL",
                    placeholder: "https://example.com/page",
                  },
                  {
                    key: "imageUrl",
                    label: "画像URL",
                    placeholder: "https://example.com/ogp.png",
                  },
                  {
                    key: "imageAlt",
                    label: "画像の代替説明",
                    placeholder: "画像の内容",
                  },
                  {
                    key: "siteName",
                    label: "サイト名（任意）",
                    placeholder: "サイト名",
                  },
                ] as const
              ).map((field) => (
                <label key={field.key} className="text-sm font-bold">
                  {field.label}
                  {field.key === "description" ? (
                    <textarea
                      aria-label={field.label}
                      className="mt-2 min-h-24 w-full rounded-xl border p-3 font-normal"
                      value={input[field.key]}
                      placeholder={field.placeholder}
                      onChange={(event) =>
                        update(field.key, event.target.value)
                      }
                    />
                  ) : (
                    <input
                      aria-label={field.label}
                      className="mt-2 w-full rounded-xl border p-3 font-normal"
                      value={input[field.key]}
                      placeholder={field.placeholder}
                      onChange={(event) =>
                        update(field.key, event.target.value)
                      }
                    />
                  )}
                </label>
              ))}
              <div className="grid grid-cols-2 gap-4">
                <label className="text-sm font-bold">
                  画像幅（px）
                  <input
                    aria-label="画像幅"
                    inputMode="numeric"
                    className="mt-2 w-full rounded-xl border p-3 font-normal"
                    value={input.imageWidth}
                    onChange={(event) =>
                      update("imageWidth", event.target.value)
                    }
                  />
                </label>
                <label className="text-sm font-bold">
                  画像高さ（px）
                  <input
                    aria-label="画像高さ"
                    inputMode="numeric"
                    className="mt-2 w-full rounded-xl border p-3 font-normal"
                    value={input.imageHeight}
                    onChange={(event) =>
                      update("imageHeight", event.target.value)
                    }
                  />
                </label>
              </div>
              <label className="rounded-xl border border-dashed border-slate-300 p-4 text-sm font-bold">
                プレビュー用画像（任意）
                <span className="mt-1 block font-normal leading-5 text-slate-500">
                  画像URLへはアクセスしません。実画像を確認したい場合だけ、端末内の画像を選択してください。画像は外部送信されません。
                </span>
                <input
                  aria-label="プレビュー用画像"
                  className="mt-3 block w-full font-normal"
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    loadPreviewImage(event.target.files?.[0])
                  }
                />
                {imagePreviewName && (
                  <span className="mt-2 block font-normal text-emerald-700">
                    表示中：{imagePreviewName}
                  </span>
                )}
              </label>
              {imageError && (
                <p role="alert" className="text-sm font-bold text-red-700">
                  {imageError}
                </p>
              )}
              <label className="text-sm font-bold">
                既存head断片（任意）
                <textarea
                  aria-label="既存head断片"
                  className="mt-2 min-h-40 w-full rounded-xl border p-3 font-mono text-xs font-normal"
                  value={head}
                  onChange={(event) => {
                    setHead(event.target.value);
                    setTags("");
                  }}
                  placeholder={'<meta property="og:title" content="..." />'}
                />
              </label>
            </div>
            <button
              type="button"
              data-analytics-event="tool_run"
              data-analytics-tool-id="ogp-card-preview"
              className="mt-5 rounded-full bg-blue-600 px-5 py-3 font-bold text-white"
              onClick={run}
            >
              プレビューとタグを作成
            </button>
          </section>
          <section aria-labelledby="preview-heading">
            <h2 id="preview-heading" className="text-xl font-black">
              汎用シェアカード見本
            </h2>
            <div className="mt-4 overflow-hidden rounded-2xl border bg-white shadow-sm">
              {imagePreviewUrl ? (
                // Blob URL と data URL は Next/Image の最適化対象外で、端末内だけで表示する。
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imagePreviewUrl}
                  alt={`${imagePreviewName || "選択した画像"}のカードプレビュー`}
                  className="aspect-[1200/630] w-full bg-slate-100 object-cover"
                />
              ) : (
                <div className="grid aspect-[1200/630] place-items-center border-b border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-500">
                  <div>
                    <span aria-hidden="true" className="text-4xl">
                      ▧
                    </span>
                    <p className="mt-3 font-bold text-slate-700">
                      プレビュー画像は未選択です
                    </p>
                    <p className="mt-1 text-xs">
                      端末内の画像を選ぶと、ここに表示します
                    </p>
                  </div>
                </div>
              )}
              <div className="p-4">
                <p className="truncate text-xs uppercase text-slate-500">
                  {host(input.url) || "example.com"}
                </p>
                <h3 className="mt-1 line-clamp-2 font-black">
                  {input.title || "ページタイトル"}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                  {input.description || "ページの説明がここに表示されます。"}
                </p>
              </div>
            </div>
            <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">
              {imagePreviewUrl
                ? "選択したプレビュー用画像をブラウザ内で表示しています。生成タグには上で入力した画像URLを使用します。"
                : "画像URLは安全のため自動取得しません。実画像を確認する場合は「プレビュー用画像」から端末内の画像を選択してください。"}
            </p>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              これは各SNSの完全再現ではありません。実表示は取得時点、キャッシュ、サービス仕様で変わります。
            </p>
          </section>
        </div>
        <p className="mt-5 text-sm leading-6 text-slate-600">
          タグの基本項目は
          <a
            className="text-blue-700 underline"
            href="https://ogp.me/"
            target="_blank"
            rel="noreferrer"
          >
            The Open Graph protocol
          </a>
          と
          <a
            className="ml-1 text-blue-700 underline"
            href="https://developer.x.com/en/docs/x-for-websites/cards/overview/markup"
            target="_blank"
            rel="noreferrer"
          >
            X Cards markup
          </a>
          を参照しています。
        </p>
        {error && (
          <p
            role="alert"
            className="mt-4 rounded-xl bg-red-50 p-4 font-bold text-red-700"
          >
            {error}
          </p>
        )}
        {warnings.length > 0 && (
          <ul className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
            {warnings.map((warning) => (
              <li key={warning}>・{warning}</li>
            ))}
          </ul>
        )}
        {tags && (
          <section className="mt-8" aria-labelledby="result-heading">
            <h2 id="result-heading" className="text-xl font-black">
              生成タグとhead診断
            </h2>
            <pre className="mt-4 overflow-x-auto whitespace-pre-wrap break-all rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">
              {tags}
            </pre>
            <button
              type="button"
              className="mt-4 rounded-full border px-4 py-2 font-bold"
              onClick={() => void copy()}
            >
              {copied ? "タグをコピーしました" : "生成タグをコピー"}
            </button>
            <ul className="mt-5 grid gap-2">
              {issues.map((issue, index) => (
                <li
                  key={`${issue.message}-${index}`}
                  className={`rounded-xl p-3 text-sm ${issue.severity === "error" ? "bg-red-50 text-red-800" : issue.severity === "warning" ? "bg-amber-50 text-amber-900" : "bg-emerald-50 text-emerald-800"}`}
                >
                  {issue.severity.toUpperCase()}：{issue.message}
                </li>
              ))}
            </ul>
            <PremiumInterestCards
              toolId="ogp-card-preview"
              placement="result_after"
              candidates={[
                {
                  featureId: "brand_preset_save",
                  name: "ブランドプリセット保存",
                  description:
                    "色や文言の基準を案件ごとに保存できる候補機能です。",
                },
                {
                  featureId: "bulk_page_audit",
                  name: "複数ページ一括監査",
                  description:
                    "複数ページのタグ不足をまとめて確認できる候補機能です。",
                },
              ]}
            />
          </section>
        )}
      </section>
    </main>
  );
}

function host(value: string) {
  try {
    return new URL(value).host;
  } catch {
    return "";
  }
}
