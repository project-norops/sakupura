"use client";

import { useEffect, useMemo, useState } from "react";
import {
  completeTask,
  dueLabel,
  nextDueDate,
  type Frequency,
  type RoutineTask,
} from "./utils";

const STORAGE_KEY = "routine-task-loop:tasks";
const today = () =>
  new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });

export function RoutineTaskLoopPage() {
  const [tasks, setTasks] = useState<RoutineTask[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [title, setTitle] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("weekly");
  const [interval, setInterval] = useState(7);
  const [nextDue, setNextDue] = useState(today);
  const currentDate = today();
  const ordered = useMemo(
    () => [...tasks].sort((a, b) => a.nextDue.localeCompare(b.nextDue)),
    [tasks],
  );
  const counts = useMemo(
    () =>
      tasks.reduce(
        (result, task) => {
          const state = dueLabel(task.nextDue, currentDate);
          if (state === "期限切れ") result.overdue += 1;
          if (state === "今日") result.today += 1;
          if (state === "予定") result.upcoming += 1;
          return result;
        },
        { overdue: 0, today: 0, upcoming: 0 },
      ),
    [tasks, currentDate],
  );
  const field =
    "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setTasks(JSON.parse(saved) as RoutineTask[]);
      } catch {
        /* storage unavailable */
      }
      setLoaded(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      /* storage unavailable */
    }
  }, [tasks, loaded]);

  const addTask = () => {
    if (!title.trim()) return;
    setTasks((items) => [
      ...items,
      {
        id: crypto.randomUUID(),
        title: title.trim(),
        frequency,
        interval,
        nextDue,
        completedCount: 0,
      },
    ]);
    setTitle("");
  };

  const loadSamples = () => {
    setTasks([
      {
        id: crypto.randomUUID(),
        title: "Webサイトをバックアップする",
        frequency: "weekly",
        interval: 7,
        nextDue: currentDate,
        completedCount: 0,
      },
      {
        id: crypto.randomUUID(),
        title: "請求書を発行する",
        frequency: "monthly",
        interval: 1,
        nextDue: nextDueDate(currentDate, "weekly"),
        completedCount: 2,
      },
      {
        id: crypto.randomUUID(),
        title: "アカウント権限を見直す",
        frequency: "days",
        interval: 90,
        nextDue: nextDueDate(currentDate, "days", 30),
        completedCount: 1,
      },
    ]);
  };

  const frequencyText = (task: RoutineTask) =>
    task.frequency === "weekly"
      ? "毎週"
      : task.frequency === "monthly"
        ? "毎月"
        : `${task.interval}日ごと`;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
          定期業務
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          定期タスク専用チェックリスト
        </h1>
        <p className="mt-4 max-w-3xl leading-7 text-slate-600">
          毎週のバックアップや毎月の請求書など、忘れやすい定期業務だけを日常タスクから分けて管理します。完了を押すと、次回予定日へ自動で繰り越します。
        </p>
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          <strong>これは通知型のリマインダーではありません。</strong>{" "}
          定期業務の「未完了・完了・次回日」を一覧で確認するチェックリストです。無料版には通知と端末間同期はありません。
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 sm:max-w-xl">
          {[
            ["期限切れ", counts.overdue, "text-rose-700 bg-rose-50"],
            ["今日", counts.today, "text-amber-800 bg-amber-50"],
            ["今後", counts.upcoming, "text-blue-700 bg-blue-50"],
          ].map(([label, count, color]) => (
            <div key={label} className={`rounded-2xl p-3 text-center ${color}`}>
              <p className="text-xl font-black">{count}</p>
              <p className="mt-1 text-xs font-bold">{label}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
          <section>
            <h2 className="text-xl font-black text-slate-950">
              1. 繰り返す業務を登録
            </h2>
            <label className="mt-5 block text-sm font-bold text-slate-700">
              タスク名
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") addTask();
                }}
                placeholder="例：請求書を発行する"
                className={field}
              />
            </label>
            <label className="mt-4 block text-sm font-bold text-slate-700">
              繰り返し
              <select
                value={frequency}
                onChange={(event) =>
                  setFrequency(event.target.value as Frequency)
                }
                className={field}
              >
                <option value="weekly">毎週</option>
                <option value="monthly">毎月</option>
                <option value="days">指定日数ごと</option>
              </select>
            </label>
            {frequency === "days" && (
              <label className="mt-4 block text-sm font-bold text-slate-700">
                間隔（日）
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={interval}
                  onChange={(event) =>
                    setInterval(Math.max(1, Number(event.target.value) || 1))
                  }
                  className={field}
                />
              </label>
            )}
            <label className="mt-4 block text-sm font-bold text-slate-700">
              最初の予定日
              <input
                type="date"
                value={nextDue}
                onChange={(event) => setNextDue(event.target.value)}
                className={field}
              />
            </label>
            <button
              type="button"
              disabled={!title.trim()}
              onClick={addTask}
              data-analytics-event="tool_run"
              data-analytics-tool-id="routine-task-loop"
              className="mt-5 w-full rounded-full bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              定期タスクを登録
            </button>
          </section>

          <section>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-black text-slate-950">
                2. 期限順の定期業務
              </h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-600">
                {tasks.length}件
              </span>
            </div>
            {loaded && ordered.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
                <p className="text-3xl">✓</p>
                <p className="mt-2 font-bold text-slate-700">
                  定期タスクはまだありません
                </p>
                <p className="mt-1 text-sm">
                  サンプルで完了・繰越の動きを試すか、左のフォームから登録してください。
                </p>
                <button
                  type="button"
                  onClick={loadSamples}
                  className="mt-5 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:border-blue-400 hover:text-blue-700"
                >
                  サンプル3件で試す
                </button>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {ordered.map((task) => {
                  const state = dueLabel(task.nextDue, currentDate);
                  return (
                    <article
                      key={task.id}
                      className="rounded-2xl border border-slate-200 p-4 sm:p-5"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-black ${state === "期限切れ" ? "bg-rose-100 text-rose-700" : state === "今日" ? "bg-amber-100 text-amber-800" : "bg-blue-50 text-blue-700"}`}
                            >
                              {state}
                            </span>
                            <span className="text-sm font-bold text-slate-500">
                              {frequencyText(task)}
                            </span>
                          </div>
                          <h3 className="mt-2 break-words text-lg font-black text-slate-950">
                            {task.title}
                          </h3>
                          <p className="mt-1 text-sm text-slate-600">
                            次回 {task.nextDue.replaceAll("-", "/")}・完了{" "}
                            {task.completedCount}回
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setTasks((items) =>
                                items.map((item) =>
                                  item.id === task.id
                                    ? completeTask(item)
                                    : item,
                                ),
                              )
                            }
                            className="flex-1 rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700"
                          >
                            完了・次へ
                          </button>
                          <button
                            type="button"
                            aria-label={`${task.title}を削除`}
                            onClick={() =>
                              setTasks((items) =>
                                items.filter((item) => item.id !== task.id),
                              )
                            }
                            className="rounded-full border border-slate-300 px-3 py-2 text-sm font-bold text-slate-500"
                          >
                            削除
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
