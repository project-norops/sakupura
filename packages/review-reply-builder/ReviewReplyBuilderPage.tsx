"use client";

import { useMemo, useState } from "react";
import { buildReply, type ReplyTone } from "./utils";

export function ReviewReplyBuilderPage() {
  const [rating, setRating] = useState(5);
  const [tone, setTone] = useState<ReplyTone>("polite");
  const [customerName, setCustomerName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [detail, setDetail] = useState("");
  const [copied, setCopied] = useState(false);
  const reply = useMemo(
    () => buildReply({ rating, tone, customerName, storeName, detail }),
    [rating, tone, customerName, storeName, detail],
  );
  const field =
    "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

  const copy = async () => {
    await navigator.clipboard.writeText(reply);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
          店舗運営
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          口コミ返信テンプレート作成
        </h1>
        <p className="mt-4 max-w-3xl leading-7 text-slate-600">
          評価と口コミ内容を選ぶだけで、失礼のない返信文をすぐに作れます。Googleマップなどの口コミ返信の下書きにご利用ください。
        </p>
        <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-950">
          <strong>AI不使用・ブラウザ内で処理。</strong>{" "}
          入力した内容は外部へ送信しません。生成文は事実関係を確認してから投稿してください。
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <section>
            <h2 className="text-xl font-black text-slate-950">
              1. 口コミの状況を選ぶ
            </h2>
            <fieldset className="mt-5">
              <legend className="text-sm font-bold text-slate-700">評価</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={rating === value}
                    onClick={() => setRating(value)}
                    className={`rounded-full px-4 py-2 font-bold ${rating === value ? "bg-amber-400 text-slate-950" : "border border-slate-300 bg-white text-slate-700"}`}
                  >
                    ★ {value}
                  </button>
                ))}
              </div>
            </fieldset>
            <label className="mt-5 block text-sm font-bold text-slate-700">
              文体
              <select
                value={tone}
                onChange={(event) => setTone(event.target.value as ReplyTone)}
                className={field}
              >
                <option value="polite">丁寧</option>
                <option value="friendly">親しみやすい</option>
                <option value="short">短め</option>
              </select>
            </label>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-bold text-slate-700">
                お客様名（任意）
                <input
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  placeholder="例：田中"
                  className={field}
                />
              </label>
              <label className="text-sm font-bold text-slate-700">
                店舗名（任意）
                <input
                  value={storeName}
                  onChange={(event) => setStoreName(event.target.value)}
                  placeholder="例：サクプラカフェ"
                  className={field}
                />
              </label>
            </div>
            <label className="mt-4 block text-sm font-bold text-slate-700">
              触れたい内容（任意）
              <input
                value={detail}
                onChange={(event) => setDetail(event.target.value)}
                placeholder="例：接客、料理、待ち時間"
                className={field}
              />
            </label>
            <div className="mt-3 flex flex-wrap gap-2">
              {["接客", "料理", "店内の雰囲気", "待ち時間"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setDetail(item)}
                  className="rounded-full bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200"
                >
                  {item}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-950">
              2. 返信文を確認してコピー
            </h2>
            <div
              className="mt-5 min-h-64 whitespace-pre-wrap rounded-2xl border border-slate-200 bg-slate-50 p-5 leading-8 text-slate-800"
              aria-live="polite"
            >
              {reply}
            </div>
            <button
              type="button"
              onClick={copy}
              data-analytics-event="tool_run"
              data-analytics-tool-id="review-reply-builder"
              className="mt-4 w-full rounded-full bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700"
            >
              {copied ? "コピーしました" : "返信文をコピー"}
            </button>
          </section>
        </div>
      </section>
    </main>
  );
}
