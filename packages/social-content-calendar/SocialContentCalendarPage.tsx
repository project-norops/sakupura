"use client";

import { PremiumInterestCards } from "@sakupla/shared-ui/PremiumInterestCards";
import { useMemo, useState } from "react";
import {
  entriesToCsv,
  entriesToIcs,
  moveEntry,
  summarizeEntries,
  type CalendarEntry,
} from "./utils";

const SAMPLE: CalendarEntry[] = [
  {
    id: "mon",
    date: "2026-08-03",
    platform: "X",
    theme: "夏限定ドリンクの紹介",
    purpose: "来店促進",
    assetStatus: "準備完了",
    cta: "店頭で注文",
    memo: "写真1枚、営業時間を添える",
  },
  {
    id: "wed",
    date: "2026-08-05",
    platform: "Instagram",
    theme: "仕込み風景",
    purpose: "店の雰囲気を伝える",
    assetStatus: "準備中",
    cta: "保存して後で見る",
    memo: "リール用の短い動画",
  },
  {
    id: "fri",
    date: "2026-08-07",
    platform: "X",
    theme: "週末の空席案内",
    purpose: "予約促進",
    assetStatus: "未着手",
    cta: "予約ページを確認",
    memo: "金曜午前に空席を再確認",
  },
];
const PREMIUM_CANDIDATES = [
  {
    featureId: "content_calendar_save" as const,
    name: "カレンダーの端末保存",
    description:
      "ブランドごとの投稿予定をこの端末へ保存し、次回も編集を続けられる候補です。",
  },
  {
    featureId: "multi_brand_calendar" as const,
    name: "複数ブランドの管理",
    description:
      "店舗・事業・ブランド別の予定を切り替え、投稿数や準備状況を比較できる候補です。",
  },
];
const inputClass =
  "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function SocialContentCalendarPage() {
  const [entries, setEntries] = useState<CalendarEntry[]>(SAMPLE);
  const [range, setRange] = useState<"week" | "month">("week");
  const [notice, setNotice] = useState("");
  const summary = useMemo(() => summarizeEntries(entries), [entries]);

  const update = (
    id: string,
    key: keyof Omit<CalendarEntry, "id">,
    value: string,
  ) => {
    setEntries(
      (current) =>
        current.map((entry) =>
          entry.id === id ? { ...entry, [key]: value } : entry,
        ) as CalendarEntry[],
    );
    setNotice("");
  };
  const add = () => {
    setEntries((current) => [
      ...current,
      {
        id: `entry-${Date.now()}`,
        date: "2026-08-08",
        platform: "X",
        theme: "",
        purpose: "",
        assetStatus: "未着手",
        cta: "",
        memo: "",
      },
    ]);
    setNotice("新しい投稿予定を末尾に追加しました。");
  };
  const duplicate = (entry: CalendarEntry) => {
    const index = entries.findIndex((item) => item.id === entry.id);
    const copy = { ...entry, id: `${entry.id}-copy-${Date.now()}` };
    setEntries((current) => [
      ...current.slice(0, index + 1),
      copy,
      ...current.slice(index + 1),
    ]);
    setNotice(
      `${entry.theme || "投稿予定"}を複製しました。日付と内容を確認してください。`,
    );
  };
  const remove = (id: string) => {
    setEntries((current) => current.filter((entry) => entry.id !== id));
    setNotice("投稿予定を削除しました。");
  };
  const move = (id: string, direction: -1 | 1) => {
    setEntries((current) => moveEntry(current, id, direction));
    setNotice("表示順を変更しました。");
  };
  const saveCsv = () => {
    download(
      "sns-content-calendar.csv",
      entriesToCsv(entries),
      "text/csv;charset=utf-8",
    );
    setNotice("CSVを保存しました。");
  };
  const saveIcs = () => {
    download(
      "sns-content-calendar.ics",
      entriesToIcs(entries),
      "text/calendar;charset=utf-8",
    );
    setNotice("カレンダー用ICSを保存しました。");
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
          SNS運用の計画
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          SNSコンテンツカレンダー
        </h1>
        <p className="mt-4 max-w-4xl leading-7 text-slate-600">
          1週間や1か月の投稿予定を、投稿日・媒体・テーマ・目的・素材状態・CTAで整理します。投稿漏れ、素材の準備遅れ、特定媒体への偏りを見つけ、CSVまたはカレンダー用ICSで保存できます。SNSへの自動投稿や外部送信は行いません。
        </p>
        <section
          aria-label="かんたん操作手順"
          className="mt-6 grid gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 sm:grid-cols-3 sm:p-5"
        >
          <div>
            <h2 className="font-black">1. 予定を追加</h2>
            <p className="mt-1 text-sm leading-6">
              投稿日、媒体、テーマ、投稿の目的を入力
            </p>
          </div>
          <div>
            <h2 className="font-black">2. 準備を確認</h2>
            <p className="mt-1 text-sm leading-6">
              画像・動画の素材状態とCTAを更新
            </p>
          </div>
          <div>
            <h2 className="font-black">3. 保存</h2>
            <p className="mt-1 text-sm leading-6">
              CSVまたはカレンダー用ICSを端末へ保存
            </p>
          </div>
        </section>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          CTAは、投稿を見た人に促したい次の行動です。例は「予約ページを見る」「店頭で注文」「投稿を保存」です。初期値には小さな店舗の1週間分を入れています。
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black">投稿予定</h2>
            <p className="mt-1 text-sm text-slate-500">
              {range === "week" ? "週間表示" : "月間表示"}として計画を確認中
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              aria-pressed={range === "week"}
              onClick={() => setRange("week")}
              className={`min-h-11 rounded-full px-4 text-sm font-bold ${range === "week" ? "bg-slate-950 text-white" : "border border-slate-300 text-slate-700"}`}
            >
              週
            </button>
            <button
              type="button"
              aria-pressed={range === "month"}
              onClick={() => setRange("month")}
              className={`min-h-11 rounded-full px-4 text-sm font-bold ${range === "month" ? "bg-slate-950 text-white" : "border border-slate-300 text-slate-700"}`}
            >
              月
            </button>
            <button
              type="button"
              onClick={() => {
                setEntries(SAMPLE);
                setNotice("店舗の1週間サンプルに戻しました。");
              }}
              data-analytics-event="sample_load"
              data-analytics-tool-id="social-content-calendar"
              className="min-h-11 rounded-full border border-blue-300 px-4 text-sm font-bold text-blue-700"
            >
              サンプルに戻す
            </button>
            <button
              type="button"
              onClick={add}
              className="min-h-11 rounded-full bg-blue-600 px-4 text-sm font-bold text-white"
            >
              投稿予定を追加
            </button>
          </div>
        </div>

        <section
          aria-label="計画の確認"
          className="mt-5 grid gap-3 sm:grid-cols-3"
        >
          <div className="rounded-2xl bg-slate-950 p-4 text-white">
            <p className="text-sm font-bold text-slate-300">投稿予定</p>
            <p className="mt-1 text-2xl font-black">{entries.length}件</p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-sm font-bold text-slate-600">要確認</p>
            <p className="mt-1 text-2xl font-black">
              {summary.incompleteCount}件
            </p>
            <p className="mt-1 text-xs text-slate-500">
              未入力または素材準備中
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-sm font-bold text-slate-600">媒体の内訳</p>
            <p className="mt-1 text-sm font-black text-slate-900">
              {Object.entries(summary.platformCounts)
                .map(([platform, count]) => `${platform} ${count}件`)
                .join("／") || "予定なし"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              偏りを意図した計画か確認
            </p>
          </div>
        </section>

        {notice ? (
          <p
            role="status"
            className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-900"
          >
            {notice}
          </p>
        ) : null}
        <div className="mt-5 grid gap-4">
          {entries.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 p-7 text-center text-slate-500">
              投稿予定がありません。「投稿予定を追加」から始めてください。
            </div>
          ) : (
            entries.map((entry, index) => (
              <fieldset
                key={entry.id}
                className="min-w-0 rounded-2xl border border-slate-200 p-4"
              >
                <legend className="px-2 font-black">投稿 {index + 1}</legend>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <label className="block text-sm font-bold text-slate-700">
                    投稿日
                    <input
                      type="date"
                      value={entry.date}
                      onChange={(event) =>
                        update(entry.id, "date", event.target.value)
                      }
                      className={inputClass}
                    />
                  </label>
                  <label className="block text-sm font-bold text-slate-700">
                    媒体
                    <select
                      value={entry.platform}
                      onChange={(event) =>
                        update(entry.id, "platform", event.target.value)
                      }
                      className={inputClass}
                    >
                      <option>X</option>
                      <option>Instagram</option>
                      <option>Facebook</option>
                      <option>その他</option>
                    </select>
                  </label>
                  <label className="block text-sm font-bold text-slate-700 lg:col-span-2">
                    テーマ
                    <input
                      type="text"
                      value={entry.theme}
                      onChange={(event) =>
                        update(entry.id, "theme", event.target.value)
                      }
                      className={inputClass}
                    />
                  </label>
                  <label className="block text-sm font-bold text-slate-700">
                    目的
                    <input
                      type="text"
                      value={entry.purpose}
                      onChange={(event) =>
                        update(entry.id, "purpose", event.target.value)
                      }
                      className={inputClass}
                    />
                  </label>
                  <label className="block text-sm font-bold text-slate-700">
                    素材状態
                    <select
                      value={entry.assetStatus}
                      onChange={(event) =>
                        update(entry.id, "assetStatus", event.target.value)
                      }
                      className={inputClass}
                    >
                      <option>未着手</option>
                      <option>準備中</option>
                      <option>準備完了</option>
                    </select>
                  </label>
                  <label className="block text-sm font-bold text-slate-700">
                    CTA
                    <input
                      type="text"
                      value={entry.cta}
                      onChange={(event) =>
                        update(entry.id, "cta", event.target.value)
                      }
                      className={inputClass}
                    />
                  </label>
                  <label className="block text-sm font-bold text-slate-700">
                    投稿メモ
                    <input
                      type="text"
                      value={entry.memo}
                      onChange={(event) =>
                        update(entry.id, "memo", event.target.value)
                      }
                      className={inputClass}
                    />
                  </label>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => move(entry.id, -1)}
                    disabled={index === 0}
                    className="min-h-11 rounded-full border border-slate-300 px-3 text-sm font-bold disabled:opacity-40"
                  >
                    上へ
                  </button>
                  <button
                    type="button"
                    onClick={() => move(entry.id, 1)}
                    disabled={index === entries.length - 1}
                    className="min-h-11 rounded-full border border-slate-300 px-3 text-sm font-bold disabled:opacity-40"
                  >
                    下へ
                  </button>
                  <button
                    type="button"
                    onClick={() => duplicate(entry)}
                    className="min-h-11 rounded-full border border-blue-300 px-3 text-sm font-bold text-blue-700"
                  >
                    複製
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(entry.id)}
                    className="min-h-11 rounded-full px-3 text-sm font-bold text-rose-700 hover:bg-rose-50"
                  >
                    削除
                  </button>
                </div>
              </fieldset>
            ))
          )}
        </div>

        <section className="mt-6 rounded-2xl border border-slate-200 p-4">
          <h2 className="font-black">端末へ保存</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            CSVは表計算で編集する用途、ICSはGoogleカレンダーなどへ予定を読み込む用途です。自動投稿の設定は含みません。
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={entries.length === 0}
              onClick={saveCsv}
              data-analytics-event="tool_run"
              data-analytics-tool-id="social-content-calendar"
              className="min-h-11 rounded-full bg-blue-600 px-5 text-sm font-black text-white disabled:opacity-40"
            >
              CSVを保存
            </button>
            <button
              type="button"
              disabled={entries.length === 0}
              onClick={saveIcs}
              data-analytics-event="tool_run"
              data-analytics-tool-id="social-content-calendar"
              className="min-h-11 rounded-full border border-blue-300 px-5 text-sm font-black text-blue-700 disabled:opacity-40"
            >
              ICSを保存
            </button>
          </div>
        </section>

        <section className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <h2 className="font-black text-amber-950">保存と投稿について</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-amber-950">
            <li>
              入力内容はこの画面を閉じると消えます。必要な計画はCSVまたはICSで保存してください。
            </li>
            <li>
              ICSを読み込んでもSNSへ自動投稿されません。投稿内容と日時は各SNSで最終確認してください。
            </li>
            <li>
              権利のある画像・文章を使い、媒体ごとの最新ルールと表示を投稿前に確認してください。
            </li>
          </ul>
        </section>
        {entries.length > 0 ? (
          <PremiumInterestCards
            toolId="social-content-calendar"
            placement="result_after"
            candidates={PREMIUM_CANDIDATES}
          />
        ) : null}
      </section>
    </main>
  );
}
