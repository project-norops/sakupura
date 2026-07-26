"use client";

import { PremiumInterestCards } from "@sakupla/shared-ui/PremiumInterestCards";
import { useState } from "react";
import { checkRobotsAndSitemap, formatReport, type CheckResult } from "./utils";

const MAX_SIZE = 10 * 1024 * 1024;
const ROBOTS_SAMPLE = `User-agent: *\nDisallow: /members/\nSitemap: https://example.com/sitemap.xml`;
const SITEMAP_SAMPLE = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>https://example.com/</loc></url>\n  <url><loc>https://example.com/members/profile</loc></url>\n  <url><loc>https://example.com/about</loc></url>\n  <url><loc>https://example.com/about</loc></url>\n  <url><loc>https://shop.example.net/products</loc></url>\n</urlset>`;

export function RobotsSitemapCheckerPage() {
  const [robots, setRobots] = useState("");
  const [sitemap, setSitemap] = useState("");
  const [site, setSite] = useState("");
  const [result, setResult] = useState<CheckResult | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const loadFile = async (
    file: File | undefined,
    setter: (value: string) => void,
  ) => {
    if (!file) return;
    if (file.size > MAX_SIZE) {
      setError("初期版では各10MB以下のテキストファイルを読み込めます。");
      return;
    }
    try {
      setter(await file.text());
      setResult(null);
      setError("");
    } catch {
      setError("ファイルを読み込めませんでした。");
    }
  };
  const run = () => {
    if (!robots.trim() || !sitemap.trim()) {
      setError("robots.txtとsitemap.xmlの両方を入力してください。");
      setResult(null);
      return;
    }
    setResult(checkRobotsAndSitemap(robots, sitemap, site));
    setError("");
    setCopied(false);
  };
  const copy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(formatReport(result));
    setCopied(true);
  };
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
          Web制作・改善
        </p>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          robots.txt・sitemap.xml事前チェック
        </h1>
        <p className="mt-4 leading-7 text-slate-600">
          公開前の2ファイルを静的に照合し、構文、絶対URL、重複、ホスト違い、Disallow対象候補を行番号付きで確認します。実URLへは接続しません。
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
              "想定サイトURLを入力",
              "2ファイルを貼り付け・読込",
              "診断する",
              "行番号付き指摘を確認",
            ].map((step, index) => (
              <li key={step}>
                <b className="mr-2 text-blue-700">{index + 1}</b>
                {step}
              </li>
            ))}
          </ol>
        </section>
        <label className="mt-6 block text-sm font-bold">
          想定サイトURL（推奨）
          <input
            value={site}
            onChange={(event) => {
              setSite(event.target.value);
              setResult(null);
            }}
            placeholder="https://example.com"
            className="mt-2 w-full rounded-xl border p-3 font-normal"
          />
        </label>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {(
            [
              { label: "robots.txt", value: robots, setter: setRobots },
              { label: "sitemap.xml", value: sitemap, setter: setSitemap },
            ] as const
          ).map((input) => (
            <section key={input.label}>
              <label className="font-black">
                {input.label}
                <textarea
                  aria-label={`${input.label}の内容`}
                  value={input.value}
                  onChange={(event) => {
                    input.setter(event.target.value);
                    setResult(null);
                  }}
                  className="mt-2 min-h-64 w-full rounded-2xl border p-4 font-mono text-sm"
                  spellCheck={false}
                />
              </label>
              <label className="mt-3 block rounded-xl border border-dashed p-3 text-sm font-bold">
                ファイルを読み込む
                <input
                  className="mt-2 block w-full font-normal"
                  type="file"
                  accept=".txt,.xml,text/plain,application/xml,text/xml"
                  onChange={(event) =>
                    void loadFile(event.target.files?.[0], input.setter)
                  }
                />
              </label>
            </section>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-full border px-4 py-2 text-sm font-bold"
            onClick={() => {
              setRobots(ROBOTS_SAMPLE);
              setSitemap(SITEMAP_SAMPLE);
              setSite("https://example.com");
              setResult(null);
              setError("");
            }}
          >
            指摘例入りサンプルを読み込む
          </button>
          <button
            type="button"
            data-analytics-event="tool_run"
            data-analytics-tool-id="robots-sitemap-checker"
            className="rounded-full bg-blue-600 px-5 py-3 font-bold text-white"
            onClick={run}
          >
            2ファイルを診断する
          </button>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          Googleの
          <a
            className="text-blue-700 underline"
            href="https://developers.google.com/search/docs/crawling-indexing/robots/intro"
            target="_blank"
            rel="noreferrer"
          >
            robots.txtの概要
          </a>
          、
          <a
            className="ml-1 text-blue-700 underline"
            href="https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap"
            target="_blank"
            rel="noreferrer"
          >
            サイトマップ作成ガイド
          </a>
          、
          <a
            className="ml-1 text-blue-700 underline"
            href="https://www.sitemaps.org/protocol.html"
            target="_blank"
            rel="noreferrer"
          >
            Sitemaps XML protocol
          </a>
          を基準にしています。
        </p>
        {error && (
          <p
            role="alert"
            className="mt-4 rounded-xl bg-red-50 p-4 font-bold text-red-700"
          >
            {error}
          </p>
        )}
        {result && (
          <section className="mt-8" aria-labelledby="result-heading">
            <h2 id="result-heading" className="text-xl font-black">
              診断結果
            </h2>
            <p className="mt-2 text-slate-600">
              URL {result.urlCount}件・Disallow {result.disallowCount}件・指摘{" "}
              {
                result.issues.filter((issue) => issue.severity !== "info")
                  .length
              }
              件
            </p>
            <ul className="mt-4 grid gap-3">
              {result.issues.map((issue, index) => (
                <li
                  key={`${issue.source}-${issue.line}-${index}`}
                  className={`rounded-xl border p-4 ${issue.severity === "error" ? "border-red-200 bg-red-50" : issue.severity === "warning" ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-emerald-50"}`}
                >
                  <p className="text-xs font-black uppercase">
                    {issue.severity}・{issue.source}・{issue.line}行目
                  </p>
                  <p className="mt-1">{issue.message}</p>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="mt-5 rounded-full border px-4 py-2 font-bold"
              onClick={() => void copy()}
            >
              {copied ? "診断レポートをコピーしました" : "診断レポートをコピー"}
            </button>
            <PremiumInterestCards
              toolId="robots-sitemap-checker"
              placement="result_after"
              candidates={[
                {
                  featureId: "project_save",
                  name: "案件保存",
                  description:
                    "サイトごとの確認内容と結果を保存できる候補機能です。",
                },
                {
                  featureId: "live_url_check",
                  name: "実URL一括確認",
                  description:
                    "公開後のURL応答をまとめて確認できる候補機能です。",
                },
              ]}
            />
          </section>
        )}
      </section>
    </main>
  );
}
