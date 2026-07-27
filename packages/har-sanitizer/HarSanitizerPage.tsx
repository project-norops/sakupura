"use client";

import { PremiumInterestCards } from "@sakupla/shared-ui/PremiumInterestCards";
import { useState } from "react";
import {
  entryCount,
  parseHar,
  sanitizeHar,
  scanHar,
  serializeHar,
  type HarFinding,
  type HarValue,
  type SanitizeResult,
} from "./utils";

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const SAMPLE_HAR = {
  log: {
    version: "1.2",
    creator: { name: "サクプラ操作サンプル", version: "1.0" },
    entries: [
      {
        startedDateTime: "2026-07-27T00:00:00.000Z",
        time: 42,
        request: {
          method: "POST",
          url: "https://example.com/api/orders?access_token=sample-query-token&view=detail",
          httpVersion: "HTTP/2",
          headers: [
            { name: "Authorization", value: "Bearer sample-access-token" },
            { name: "Content-Type", value: "application/json" },
          ],
          queryString: [
            { name: "access_token", value: "sample-query-token" },
            { name: "view", value: "detail" },
          ],
          cookies: [{ name: "session_id", value: "sample-session-cookie" }],
          headersSize: -1,
          bodySize: 70,
          postData: {
            mimeType: "application/json",
            text: JSON.stringify({
              customerId: "C-001",
              password: "sample-password",
            }),
          },
        },
        response: {
          status: 200,
          statusText: "OK",
          httpVersion: "HTTP/2",
          headers: [
            { name: "Set-Cookie", value: "sid=response-cookie; Secure" },
          ],
          cookies: [],
          content: {
            size: 28,
            mimeType: "application/json",
            text: JSON.stringify({ result: "ok" }),
          },
          redirectURL: "",
          headersSize: -1,
          bodySize: 28,
        },
        cache: {},
        timings: { send: 1, wait: 40, receive: 1 },
      },
    ],
  },
};

const PREMIUM_CANDIDATES = [
  {
    featureId: "redaction_profile_save" as const,
    name: "匿名化プロファイル保存",
    description:
      "確認したヘッダー名や本文キーの選択を保存し、次回も同じ基準で確認できる候補です。",
  },
  {
    featureId: "batch_har_sanitize" as const,
    name: "複数HAR一括匿名化",
    description:
      "複数のHARへ同じ確認基準を適用し、監査結果をまとめて確認できる候補です。",
  },
];

function download(content: string, fileName: string) {
  const blob = new Blob([content], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function HarSanitizerPage() {
  const [har, setHar] = useState<HarValue | null>(null);
  const [fileName, setFileName] = useState("");
  const [findings, setFindings] = useState<HarFinding[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<SanitizeResult | null>(null);
  const [error, setError] = useState("");

  const loadHar = (nextHar: HarValue, nextFileName: string) => {
    const nextFindings = scanHar(nextHar);
    setHar(nextHar);
    setFileName(nextFileName);
    setFindings(nextFindings);
    setSelected(
      new Set(
        nextFindings
          .filter((finding) => finding.risk === "high")
          .map((finding) => finding.id),
      ),
    );
    setResult(null);
    setError("");
  };

  const loadFile = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setError("初期版では20MB以下のHARファイルを読み込めます。");
      return;
    }
    try {
      loadHar(parseHar(await file.text()), file.name);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "HARを読み込めませんでした。",
      );
    }
  };

  const toggleFinding = (id: string, checked: boolean) => {
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
    setResult(null);
  };

  const runSanitize = () => {
    if (!har) return;
    if (!selected.size) {
      setError("匿名化する候補を1件以上選択してください。");
      setResult(null);
      return;
    }
    setResult(sanitizeHar(har, selected));
    setError("");
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">
          Web制作・改善
        </p>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          HAR機密情報チェック・匿名化
        </h1>
        <p className="mt-4 leading-7 text-slate-600">
          問い合わせや外部ベンダーへHARを渡す前に、Cookie、認証ヘッダー、トークン、本文キーなどの機密候補を見つけ、選んだ値を匿名化したHARを作れます。ファイルは外部へ送らず、このブラウザ内だけで処理します。
        </p>

        <section
          aria-labelledby="quick-steps"
          className="mt-6 rounded-2xl border border-cyan-100 bg-cyan-50 p-4 sm:p-5"
        >
          <h2 id="quick-steps" className="font-black text-slate-950">
            かんたん操作手順
          </h2>
          <ol className="mt-3 grid gap-3 text-sm text-slate-700 sm:grid-cols-4">
            {[
              "HARを読み込む",
              "機密候補を確認",
              "匿名化対象を選ぶ",
              "結果を保存する",
            ].map((step, index) => (
              <li key={step} className="flex items-center gap-2">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-cyan-700 font-black text-white">
                  {index + 1}
                </span>
                <span className="font-bold">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-center">
          <label className="flex min-h-28 cursor-pointer flex-col justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-4 hover:border-cyan-500">
            <strong className="text-slate-950">HARファイル</strong>
            <span className="mt-1 text-sm text-slate-600">
              {har
                ? `${fileName}・${entryCount(har)}リクエスト`
                : "ChromeやEdgeなどから保存した.har / JSON"}
            </span>
            <span className="mt-2 text-sm font-bold text-cyan-700">
              HARを選択
            </span>
            <input
              className="sr-only"
              type="file"
              accept=".har,application/json"
              onChange={(event) => void loadFile(event.target.files?.[0])}
            />
          </label>
          <button
            type="button"
            onClick={() =>
              loadHar(
                parseHar(JSON.stringify(SAMPLE_HAR)),
                "har-sanitizer-sample.har",
              )
            }
            data-analytics-event="sample_load"
            data-analytics-tool-id="har-sanitizer"
            className="min-h-11 rounded-full border border-cyan-300 px-4 py-2 text-sm font-bold text-cyan-800 hover:border-cyan-600"
          >
            操作サンプルを読み込む
          </button>
          <button
            type="button"
            onClick={() =>
              download(serializeHar(SAMPLE_HAR), "har-sanitizer-sample.har")
            }
            className="min-h-11 rounded-full border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:border-slate-500"
          >
            サンプルHARを保存
          </button>
        </div>

        <p className="mt-4 text-sm leading-6 text-slate-600">
          初期版は20MB以下のHAR
          1.2形式を対象に、ヘッダー、Cookie、クエリ、フォーム項目、JSON本文の機密候補を静的に確認します。圧縮・base64・暗号化された本文、独自形式の文字列、画像やバイナリ内は判定できません。
        </p>

        {har ? (
          <section aria-labelledby="finding-title" className="mt-7">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[.16em] text-cyan-700">
                  検出結果
                </p>
                <h2
                  id="finding-title"
                  className="mt-1 text-xl font-black text-slate-950"
                >
                  {findings.length}件の機密候補
                </h2>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelected(new Set(findings.map((finding) => finding.id)));
                    setResult(null);
                  }}
                  className="rounded-full border border-slate-300 px-3 py-2 text-sm font-bold"
                >
                  すべて選択
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelected(new Set());
                    setResult(null);
                  }}
                  className="rounded-full border border-slate-300 px-3 py-2 text-sm font-bold"
                >
                  選択解除
                </button>
              </div>
            </div>
            {findings.length ? (
              <div className="mt-4 space-y-3">
                {findings.map((finding) => (
                  <label
                    key={finding.id}
                    className="flex cursor-pointer gap-3 rounded-2xl border border-slate-200 p-4 hover:border-cyan-400"
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(finding.id)}
                      onChange={(event) =>
                        toggleFinding(finding.id, event.target.checked)
                      }
                      className="mt-1 size-5 accent-cyan-700"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <strong className="break-all text-slate-950">
                          {finding.name}
                        </strong>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-black ${finding.risk === "high" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`}
                        >
                          {finding.risk === "high" ? "高い候補" : "要確認"}
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          {finding.location}
                        </span>
                      </span>
                      <span className="mt-1 block break-all text-sm text-slate-600">
                        {finding.entryLabel}・{finding.maskedPreview}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-slate-500">
                        {finding.reason}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-800">
                現在の検出ルールに一致する候補はありません。安全を保証する結果ではないため、共有前に元HARと内容を目視確認してください。
              </p>
            )}
            <button
              type="button"
              onClick={runSanitize}
              data-analytics-event="tool_run"
              data-analytics-tool-id="har-sanitizer"
              className="mt-5 min-h-12 w-full rounded-full bg-cyan-700 px-6 py-3 font-black text-white hover:bg-cyan-800 sm:w-auto"
            >
              選択した候補を匿名化
            </button>
          </section>
        ) : null}

        {error ? (
          <p
            role="alert"
            className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800"
          >
            {error}
          </p>
        ) : null}

        {result ? (
          <section
            aria-labelledby="result-title"
            className="mt-7 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:p-6"
          >
            <p className="text-xs font-black uppercase tracking-[.16em] text-emerald-700">
              匿名化結果
            </p>
            <h2
              id="result-title"
              className="mt-1 text-xl font-black text-slate-950"
            >
              {result.audit.length}件を匿名化しました
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-white p-4">
                <span className="text-sm text-slate-600">
                  処理したリクエスト
                </span>
                <strong className="mt-1 block text-2xl text-slate-950">
                  {entryCount(result.har)}件
                </strong>
              </div>
              <div className="rounded-xl bg-white p-4">
                <span className="text-sm text-slate-600">変更箇所</span>
                <strong className="mt-1 block text-2xl text-slate-950">
                  {result.audit.length}件
                </strong>
              </div>
              <div className="rounded-xl bg-white p-4">
                <span className="text-sm text-slate-600">残存候補</span>
                <strong
                  className={`mt-1 block text-2xl ${result.remaining.length ? "text-amber-700" : "text-emerald-700"}`}
                >
                  {result.remaining.length}件
                </strong>
              </div>
            </div>
            {result.remaining.length ? (
              <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-bold text-amber-900">
                未選択または再検出された候補が{result.remaining.length}
                件あります。保存前に選択内容と元HARを再確認してください。
              </p>
            ) : null}
            <div className="mt-4 overflow-x-auto rounded-xl border border-emerald-200 bg-white">
              <table className="min-w-[720px] w-full text-left text-sm">
                <thead className="bg-emerald-100">
                  <tr>
                    <th className="px-3 py-2">リクエスト</th>
                    <th className="px-3 py-2">場所</th>
                    <th className="px-3 py-2">項目</th>
                    <th className="px-3 py-2">変更後</th>
                  </tr>
                </thead>
                <tbody>
                  {result.audit.map((finding) => (
                    <tr
                      key={finding.id}
                      className="border-t border-emerald-100"
                    >
                      <td className="px-3 py-2">{finding.entryLabel}</td>
                      <td className="px-3 py-2">{finding.location}</td>
                      <td className="px-3 py-2 font-bold">{finding.name}</td>
                      <td className="px-3 py-2 font-mono">[REDACTED]</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              onClick={() =>
                download(serializeHar(result.har), "har-sanitized.har")
              }
              className="mt-5 min-h-12 rounded-full bg-emerald-700 px-6 py-3 font-black text-white hover:bg-emerald-800"
            >
              匿名化HARを保存
            </button>
            <p className="mt-4 text-sm leading-6 text-slate-700">
              この結果は機密情報の完全除去や共有の安全性を保証しません。元HARを保管し、共有先・社内ルールに沿って、URL、本文、レスポンス内容を最終確認してください。
            </p>
            <PremiumInterestCards
              toolId="har-sanitizer"
              placement="result_after"
              candidates={PREMIUM_CANDIDATES}
            />
          </section>
        ) : null}

        <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
          <p>
            Chrome
            DevToolsは通常のサニタイズ済みHARでCookie、Set-Cookie、Authorizationヘッダーを除外しますが、クエリや本文など別の場所に機密情報が残る場合があります。
          </p>
          <p className="mt-2">
            根拠：
            <a
              className="font-bold text-blue-700 underline"
              href="https://developer.chrome.com/docs/devtools/network/reference/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Chrome DevTools Network reference
            </a>
            、
            <a
              className="font-bold text-blue-700 underline"
              href="https://learn.microsoft.com/en-us/azure/devops/user-guide/capture-browser-trace"
              target="_blank"
              rel="noopener noreferrer"
            >
              Microsoft Learn: Capture a browser trace
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
