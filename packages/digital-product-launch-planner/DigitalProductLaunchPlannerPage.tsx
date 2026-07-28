"use client";

import { PremiumInterestCards } from "@sakupla/shared-ui/PremiumInterestCards";
import { useState, type FormEvent } from "react";
import {
  addDays,
  createLaunchPlan,
  launchTypeLabels,
  tasksToIcs,
  tasksToText,
  type LaunchTask,
  type LaunchType,
  type PreparationStage,
} from "./utils";

const PREMIUM_CANDIDATES = [
  {
    featureId: "launch_plan_save" as const,
    name: "ローンチ計画の保存",
    description:
      "作成した日程と完了状態を端末へ保存し、次回も続きから確認できる候補です。",
  },
  {
    featureId: "multi_launch_plan" as const,
    name: "複数ローンチの並行管理",
    description:
      "複数の商品・募集・配信予定を並べ、準備の重なりと進捗を確認できる候補です。",
  },
];

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

function todayString() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

export function DigitalProductLaunchPlannerPage() {
  const [projectName, setProjectName] = useState("");
  const [type, setType] = useState<LaunchType>("digital_product");
  const [launchDate, setLaunchDate] = useState("");
  const [salesChannel, setSalesChannel] = useState("");
  const [stage, setStage] = useState<PreparationStage>("not_started");
  const [tasks, setTasks] = useState<LaunchTask[] | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const invalidate = () => {
    setTasks(null);
    setError("");
    setNotice("");
  };

  const loadSample = () => {
    const today = todayString();
    setProjectName("はじめての動画教材");
    setType("digital_product");
    setLaunchDate(addDays(today, 14));
    setSalesChannel("デジタル商品販売サービス");
    setStage("core_ready");
    setTasks(null);
    setError("");
    setNotice("2週間後に動画教材を発売するサンプルを読み込みました。");
  };

  const clear = () => {
    setProjectName("");
    setType("digital_product");
    setLaunchDate("");
    setSalesChannel("");
    setStage("not_started");
    setTasks(null);
    setError("");
    setNotice("");
  };

  const generate = (event: FormEvent) => {
    event.preventDefault();
    if (!projectName.trim())
      return setError("商品・企画名を入力してください。");
    if (!launchDate) return setError("発売・受付・配信日を選択してください。");
    if (launchDate < todayString())
      return setError("発売・受付・配信日は今日以降を選択してください。");
    if (!salesChannel.trim())
      return setError("販売・受付・配信場所を入力してください。");
    setTasks(
      createLaunchPlan({
        type,
        launchDate,
        stage,
        today: todayString(),
      }),
    );
    setError("");
    setNotice("日付付きのローンチ計画を作成しました。");
  };

  const toggleTask = (id: string) => {
    setTasks(
      (current) =>
        current?.map((task) =>
          task.id === id
            ? {
                ...task,
                completed: !task.completed,
                overdue: task.completed ? task.date < todayString() : false,
              }
            : task,
        ) ?? null,
    );
  };

  const copyPlan = async () => {
    if (!tasks) return;
    try {
      await navigator.clipboard.writeText(
        tasksToText(tasks, projectName, type),
      );
      setNotice("チェックリストをコピーしました。");
    } catch {
      setNotice("コピーできませんでした。端末の権限を確認してください。");
    }
  };

  const saveIcs = () => {
    if (!tasks) return;
    download(
      "launch-plan.ics",
      tasksToIcs(tasks, projectName),
      "text/calendar;charset=utf-8",
    );
    setNotice("カレンダー用ICSを保存しました。");
  };

  const completedCount = tasks?.filter((task) => task.completed).length ?? 0;
  const overdueCount = tasks?.filter((task) => task.overdue).length ?? 0;
  const launchLabel =
    type === "commission"
      ? "受付開始日"
      : type === "stream_event"
        ? "配信日"
        : "発売日";

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <style>{`@media print {
        @page { size: A4 portrait; margin: 12mm; }
        body * { visibility: hidden !important; }
        #launch-print-area, #launch-print-area * { visibility: visible !important; }
        #launch-print-area { position: absolute !important; inset: 0 auto auto 0; width: 100% !important; border: 0 !important; box-shadow: none !important; }
        #launch-print-area li { break-inside: avoid; }
        #launch-print-area .print-avoid { display: none !important; }
      }`}</style>
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <p className="text-xs font-black uppercase tracking-[.2em] text-blue-600">
          個人クリエイターの発売準備
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          デジタル商品ローンチ逆算プランナー
        </h1>
        <p className="mt-4 max-w-4xl leading-7 text-slate-600">
          発売日・受付開始日・配信日から、商品ページ、サンプル、動作確認、事前告知、公開後対応を逆算します。用途に合った日付付きチェックリストを作り、コピー・印刷・カレンダー用ICSで保存できます。
        </p>

        <section
          aria-label="かんたん操作手順"
          className="mt-6 grid gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 sm:grid-cols-3 sm:p-5"
        >
          <div>
            <h2 className="font-black">1. 用途を選ぶ</h2>
            <p className="mt-1 text-sm leading-6">
              商品、コミッション、配信イベントから選択
            </p>
          </div>
          <div>
            <h2 className="font-black">2. 日付と状況を入力</h2>
            <p className="mt-1 text-sm leading-6">
              公開日、販売場所、現在の準備状況を入力
            </p>
          </div>
          <div>
            <h2 className="font-black">3. 工程表を保存</h2>
            <p className="mt-1 text-sm leading-6">
              遅れ候補を確認し、コピー・印刷・ICS保存
            </p>
          </div>
        </section>
        <p className="mt-3 text-sm font-bold leading-6 text-slate-700">
          日程は準備の目安です。自動投稿、外部サービスへの登録、売上予測、発売成功の保証は行いません。
        </p>

        <form onSubmit={generate} className="mt-8" noValidate>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-950">企画の条件</h2>
              <p className="mt-1 text-sm text-slate-500">
                迷う場合は2週間後に動画教材を発売するサンプルを試せます。
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={loadSample}
                data-analytics-event="sample_load"
                data-analytics-tool-id="digital-product-launch-planner"
                className="min-h-11 rounded-full border border-blue-300 px-4 text-sm font-bold text-blue-700"
              >
                2週間後の教材サンプル
              </button>
              <button
                type="button"
                onClick={clear}
                className="min-h-11 rounded-full border border-slate-300 px-4 text-sm font-bold text-slate-600"
              >
                入力をクリア
              </button>
            </div>
          </div>

          <fieldset className="mt-5">
            <legend className="text-sm font-bold text-slate-700">用途</legend>
            <div className="mt-2 grid gap-3 sm:grid-cols-3">
              {(Object.entries(launchTypeLabels) as [LaunchType, string][]).map(
                ([value, label]) => (
                  <label
                    key={value}
                    className={`cursor-pointer rounded-2xl border p-4 font-bold ${type === value ? "border-blue-600 bg-blue-50 ring-2 ring-blue-100" : "border-slate-200"}`}
                  >
                    <input
                      type="radio"
                      name="launch-type"
                      value={value}
                      checked={type === value}
                      onChange={() => {
                        setType(value);
                        invalidate();
                      }}
                      className="mr-2 accent-blue-700"
                    />
                    {label}
                  </label>
                ),
              )}
            </div>
          </fieldset>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-bold text-slate-700">
              商品・企画名<span className="text-rose-600">（必須）</span>
              <input
                type="text"
                value={projectName}
                onChange={(event) => {
                  setProjectName(event.target.value);
                  invalidate();
                }}
                placeholder="例：はじめての動画教材"
                className={inputClass}
              />
            </label>
            <label className="block text-sm font-bold text-slate-700">
              {launchLabel}
              <span className="text-rose-600">（必須）</span>
              <input
                type="date"
                value={launchDate}
                min={todayString()}
                onChange={(event) => {
                  setLaunchDate(event.target.value);
                  invalidate();
                }}
                className={inputClass}
              />
            </label>
            <label className="block text-sm font-bold text-slate-700">
              販売・受付・配信場所
              <span className="text-rose-600">（必須）</span>
              <input
                type="text"
                value={salesChannel}
                onChange={(event) => {
                  setSalesChannel(event.target.value);
                  invalidate();
                }}
                placeholder="例：デジタル商品販売サービス"
                className={inputClass}
              />
            </label>
            <label className="block text-sm font-bold text-slate-700">
              現在の準備状況
              <select
                value={stage}
                onChange={(event) => {
                  setStage(event.target.value as PreparationStage);
                  invalidate();
                }}
                className={inputClass}
              >
                <option value="not_started">まだ着手していない</option>
                <option value="core_ready">商品・企画の中身は準備済み</option>
                <option value="page_ready">
                  販売ページ・受付・配信設定まで準備済み
                </option>
              </select>
            </label>
          </div>

          {error ? (
            <p
              role="alert"
              className="mt-4 rounded-xl bg-rose-50 p-4 text-sm font-bold text-rose-800"
            >
              {error}
            </p>
          ) : null}
          {notice && !tasks ? (
            <p
              role="status"
              className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm font-bold text-emerald-900"
            >
              {notice}
            </p>
          ) : null}
          <button
            type="submit"
            data-analytics-event="tool_run"
            data-analytics-tool-id="digital-product-launch-planner"
            className="mt-6 w-full rounded-full bg-blue-600 px-5 py-4 font-black text-white hover:bg-blue-700"
          >
            日付付きローンチ計画を作る
          </button>
        </form>

        {!tasks ? (
          <section
            aria-label="計画の空状態"
            className="mt-8 rounded-2xl bg-slate-50 p-6 text-center text-slate-500"
          >
            企画の条件を入力して作成すると、ここに用途別の工程表と保存ボタンが表示されます。
          </section>
        ) : (
          <>
            <section
              id="launch-print-area"
              aria-label="ローンチ計画"
              className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-blue-700">
                    {launchTypeLabels[type]}｜{salesChannel}
                  </p>
                  <h2 className="mt-1 text-2xl font-black">{projectName}</h2>
                  <p className="mt-1 text-slate-600">
                    {launchLabel}：{launchDate}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-950 px-5 py-3 text-white">
                  <p className="text-xs font-bold text-slate-300">進捗</p>
                  <p className="text-xl font-black">
                    {completedCount} / {tasks.length} 完了
                  </p>
                </div>
              </div>
              {overdueCount > 0 ? (
                <p className="mt-4 rounded-xl bg-rose-50 p-4 font-bold text-rose-800">
                  遅れ候補が{overdueCount}
                  件あります。過去の日付で未完了の工程を確認してください。
                </p>
              ) : (
                <p className="mt-4 rounded-xl bg-emerald-50 p-4 font-bold text-emerald-900">
                  現時点で過去日付の未完了工程はありません。
                </p>
              )}
              <ol className="mt-5 grid gap-3">
                {tasks.map((task) => (
                  <li
                    key={task.id}
                    className={`rounded-2xl border p-4 ${task.overdue ? "border-rose-300 bg-rose-50" : task.completed ? "border-emerald-200 bg-emerald-50" : "border-slate-200"}`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        aria-label={`${task.title}を完了済みにする`}
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task.id)}
                        className="print-avoid mt-1 size-5 accent-emerald-700"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <time
                            className="font-black text-blue-700"
                            dateTime={task.date}
                          >
                            {task.date}
                          </time>
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
                            {task.group}
                          </span>
                          {task.overdue ? (
                            <span className="rounded-full bg-rose-200 px-2 py-1 text-xs font-bold text-rose-900">
                              遅れ候補
                            </span>
                          ) : null}
                        </div>
                        <h3
                          className={`mt-1 font-black ${task.completed ? "text-slate-500 line-through" : "text-slate-950"}`}
                        >
                          {task.title}
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          {task.description}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
              <p className="mt-5 text-sm leading-6 text-slate-600">
                この工程表は一般的な目安です。販売先・配信先の審査、休日、素材制作量、関係者確認に合わせて余裕を追加してください。
              </p>
              <div className="print-avoid mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => void copyPlan()}
                  className="min-h-11 rounded-full bg-blue-600 px-5 text-sm font-black text-white"
                >
                  チェックリストをコピー
                </button>
                <button
                  type="button"
                  onClick={saveIcs}
                  className="min-h-11 rounded-full border border-blue-300 px-5 text-sm font-black text-blue-700"
                >
                  カレンダー用ICSを保存
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="min-h-11 rounded-full bg-slate-900 px-5 text-sm font-black text-white"
                >
                  印刷・PDF保存
                </button>
              </div>
              {notice ? (
                <p
                  role="status"
                  className="print-avoid mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-900"
                >
                  {notice}
                </p>
              ) : null}
            </section>

            <aside className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
              <strong className="block text-slate-950">
                ICSとカレンダーへの取込み
              </strong>
              ICSは予定交換の一般的な形式です。仕様は
              <a
                href="https://www.rfc-editor.org/rfc/rfc5545"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-blue-700 underline"
              >
                IETF RFC 5545
              </a>
              、Googleカレンダーへの取込み方法は
              <a
                href="https://support.google.com/calendar/answer/37118"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-blue-700 underline"
              >
                Google Calendarヘルプ
              </a>
              を確認してください。取込み後は日付と通知設定をカレンダー側で再確認してください。
            </aside>
            <PremiumInterestCards
              toolId="digital-product-launch-planner"
              placement="result_after"
              candidates={PREMIUM_CANDIDATES}
            />
          </>
        )}
      </section>
    </main>
  );
}
