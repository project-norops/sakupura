"use client";

import { useMemo, useState } from "react";
import {
  createSections,
  moveSection,
  toMarkdown,
  type LpSection,
  type OutputMode,
} from "./utils";

export function LpStructureBuilderPage() {
  const [preset, setPreset] = useState<"service" | "product" | "event">(
    "service",
  );
  const [title, setTitle] = useState("");
  const [audience, setAudience] = useState("");
  const [outputMode, setOutputMode] = useState<OutputMode>("document");
  const [sections, setSections] = useState<LpSection[]>(() =>
    createSections("service"),
  );
  const [copied, setCopied] = useState(false);
  const markdown = useMemo(
    () => toMarkdown(title, audience, sections, outputMode),
    [title, audience, sections, outputMode],
  );
  const field =
    "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100";
  const applyPreset = (value: typeof preset) => {
    setPreset(value);
    setSections(createSections(value));
  };
  const copy = async () => {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
          Web制作
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          LP構成案作成ツール
        </h1>
        <p className="mt-4 max-w-3xl leading-7 text-slate-600">
          LPで「何を・どの順番で伝えるか」を整理するツールです。サービス、商品、イベントに合う構成を選び、Notionや企画書へ貼り付けられる構成メモを作れます。
        </p>
        <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-950">
          <strong>AI・外部送信なし。</strong>{" "}
          テンプレートをブラウザ内で組み立てます。成果を保証するものではないため、商材と読者に合わせて内容を調整してください。
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            ["企画を整理", "必要なセクションと伝える順番を決める"],
            ["制作を依頼", "ライターやデザイナーへ構成を共有する"],
            ["Notionで進行", "見出しごとの制作チェックリストにする"],
          ].map(([title, description]) => (
            <div key={title} className="rounded-2xl bg-slate-50 p-4">
              <p className="font-black text-slate-900">{title}</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.05fr_.95fr]">
          <section>
            <h2 className="text-xl font-black text-slate-950">
              1. 用途に合う構成を選ぶ
            </h2>
            <label className="mt-5 block text-sm font-bold text-slate-700">
              LPの種類
              <select
                value={preset}
                onChange={(event) =>
                  applyPreset(event.target.value as typeof preset)
                }
                className={field}
              >
                <option value="service">サービス・SaaS</option>
                <option value="product">商品販売・EC</option>
                <option value="event">イベント・セミナー</option>
              </select>
            </label>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-bold text-slate-700">
                商品・サービス名
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="例：オンライン英会話"
                  className={field}
                />
              </label>
              <label className="text-sm font-bold text-slate-700">
                想定するお客様
                <input
                  value={audience}
                  onChange={(event) => setAudience(event.target.value)}
                  placeholder="例：忙しい会社員"
                  className={field}
                />
              </label>
            </div>
            <div className="mt-6 space-y-3">
              {sections.map((section, index) => (
                <article
                  key={section.id}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-black text-white">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <input
                        aria-label={`${index + 1}番目のセクション名`}
                        value={section.name}
                        onChange={(event) =>
                          setSections((items) =>
                            items.map((item) =>
                              item.id === section.id
                                ? { ...item, name: event.target.value }
                                : item,
                            ),
                          )
                        }
                        className="w-full rounded-lg border-0 p-0 font-black text-slate-950 outline-none focus:ring-2 focus:ring-blue-200"
                      />
                      <textarea
                        aria-label={`${section.name}の目的`}
                        value={section.purpose}
                        onChange={(event) =>
                          setSections((items) =>
                            items.map((item) =>
                              item.id === section.id
                                ? { ...item, purpose: event.target.value }
                                : item,
                            ),
                          )
                        }
                        rows={2}
                        className="mt-2 w-full resize-y rounded-lg border border-slate-200 p-2 text-sm leading-6 text-slate-600"
                      />
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        disabled={index === 0}
                        aria-label={`${section.name}を上へ`}
                        onClick={() =>
                          setSections((items) => moveSection(items, index, -1))
                        }
                        className="rounded-lg border p-2 disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        disabled={index === sections.length - 1}
                        aria-label={`${section.name}を下へ`}
                        onClick={() =>
                          setSections((items) => moveSection(items, index, 1))
                        }
                        className="rounded-lg border p-2 disabled:opacity-30"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        aria-label={`${section.name}を削除`}
                        onClick={() =>
                          setSections((items) =>
                            items.filter((item) => item.id !== section.id),
                          )
                        }
                        className="rounded-lg border p-2 text-rose-600"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <button
              type="button"
              onClick={() =>
                setSections((items) => [
                  ...items,
                  {
                    id: `custom-${Date.now()}`,
                    name: "新しいセクション",
                    purpose: "このセクションの役割を記入",
                  },
                ])
              }
              className="mt-4 rounded-full border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700"
            >
              ＋ セクションを追加
            </button>
          </section>
          <section>
            <h2 className="text-xl font-black text-slate-950">
              2. 構成メモをコピー
            </h2>
            <label className="mt-5 block text-sm font-bold text-slate-700">
              出力形式
              <select
                value={outputMode}
                onChange={(event) =>
                  setOutputMode(event.target.value as OutputMode)
                }
                className={field}
              >
                <option value="document">企画書・共有用Markdown</option>
                <option value="notion">Notion向け制作チェックリスト</option>
              </select>
            </label>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              {outputMode === "notion"
                ? "Notionへ貼り付けると、セクションごとの作業チェックリストとして使えます。Notion APIとの自動連携ではありません。"
                : "Googleドキュメント、Notion、ChatGPTなどへ貼り付けて、企画整理や制作依頼に使えます。"}
            </p>
            <pre className="mt-4 max-h-[44rem] min-h-80 overflow-auto whitespace-pre-wrap rounded-2xl bg-slate-950 p-5 text-sm leading-7 text-slate-100">
              {markdown}
            </pre>
            <button
              type="button"
              onClick={copy}
              data-analytics-event="tool_run"
              data-analytics-tool-id="lp-structure-builder"
              className="mt-4 w-full rounded-full bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700"
            >
              {copied
                ? "コピーしました"
                : outputMode === "notion"
                  ? "Notion用チェックリストをコピー"
                  : "構成メモをコピー"}
            </button>
          </section>
        </div>
      </section>
    </main>
  );
}
