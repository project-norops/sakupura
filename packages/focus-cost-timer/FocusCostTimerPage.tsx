"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  calculateCost,
  formatDuration,
  sessionCsv,
  type WorkSession,
} from "./utils";

const STORAGE_KEY = "focus-cost-timer:sessions";

export function FocusCostTimerPage() {
  const [task, setTask] = useState("記事の構成を作る");
  const [hourlyRate, setHourlyRate] = useState(3000);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState<WorkSession[]>([]);
  const [loaded, setLoaded] = useState(false);
  const startedAt = useRef<number | null>(null);
  const elapsedBeforeStart = useRef(0);
  const cost = useMemo(
    () => calculateCost(elapsedMs, hourlyRate),
    [elapsedMs, hourlyRate],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setSessions(JSON.parse(saved));
      } catch {
        /* unavailable */
      }
      setLoaded(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch {
      /* unavailable */
    }
  }, [sessions, loaded]);
  useEffect(() => {
    if (!running) return;
    const update = () => {
      if (startedAt.current !== null)
        setElapsedMs(
          elapsedBeforeStart.current + performance.now() - startedAt.current,
        );
    };
    update();
    const id = window.setInterval(update, 200);
    return () => window.clearInterval(id);
  }, [running]);

  const start = () => {
    if (running) return;
    startedAt.current = performance.now();
    elapsedBeforeStart.current = elapsedMs;
    setRunning(true);
  };
  const pause = () => {
    if (!running || startedAt.current === null) return;
    const next =
      elapsedBeforeStart.current + performance.now() - startedAt.current;
    setElapsedMs(next);
    elapsedBeforeStart.current = next;
    startedAt.current = null;
    setRunning(false);
  };
  const reset = () => {
    setRunning(false);
    startedAt.current = null;
    elapsedBeforeStart.current = 0;
    setElapsedMs(0);
  };
  const finish = () => {
    if (elapsedMs < 1000 || !task.trim()) return;
    setSessions((items) =>
      [
        {
          id: crypto.randomUUID(),
          task: task.trim(),
          elapsedMs,
          hourlyRate,
          finishedAt: new Date().toLocaleString("ja-JP"),
        },
        ...items,
      ].slice(0, 20),
    );
    reset();
  };
  const download = () => {
    const blob = new Blob(["\uFEFF", sessionCsv(sessions)], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "work-cost-history.csv";
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const field =
    "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
          時間管理
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          作業時間・工数コストタイマー
        </h1>
        <p className="mt-4 max-w-3xl leading-7 text-slate-600">
          ワンタップで計測を始め、経過時間を時給換算した「現在までの工数コスト」をリアルタイム表示します。高機能な案件管理を始める前の、1作業に集中するタイマーです。
        </p>
        <div className="mt-8 grid gap-8 lg:grid-cols-[.78fr_1.22fr]">
          <section>
            <h2 className="text-xl font-black text-slate-950">1. 作業を設定</h2>
            <label className="mt-4 block text-sm font-bold text-slate-700">
              作業名
              <input
                value={task}
                onChange={(event) => setTask(event.target.value)}
                disabled={running}
                className={field}
              />
            </label>
            <label className="mt-4 block text-sm font-bold text-slate-700">
              時給換算（円）
              <input
                type="number"
                min={0}
                step={100}
                value={hourlyRate}
                onChange={(event) =>
                  setHourlyRate(Math.max(0, Number(event.target.value) || 0))
                }
                className={field}
              />
            </label>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              実際の報酬だけでなく、自分の時間をいくらとして管理するかを入力できます。
            </p>
          </section>
          <section>
            <h2 className="text-xl font-black text-slate-950">
              2. ワンタップで計測
            </h2>
            <div
              className={`mt-4 rounded-[2rem] p-6 text-center sm:p-8 ${running ? "bg-blue-600 text-white" : "bg-slate-950 text-white"}`}
            >
              <p className="text-sm font-bold opacity-75">経過時間</p>
              <p className="mt-2 font-mono text-5xl font-black tracking-tight sm:text-6xl">
                {formatDuration(elapsedMs)}
              </p>
              <div className="mx-auto my-6 h-px max-w-md bg-white/20" />
              <p className="text-sm font-bold opacity-75">
                現在までの工数コスト
              </p>
              <p className="mt-2 text-4xl font-black sm:text-5xl">
                {Math.round(cost).toLocaleString()}
                <span className="ml-1 text-xl">円</span>
              </p>
              <p className="mt-2 text-xs opacity-70">
                1分あたり約{Math.round(hourlyRate / 60).toLocaleString()}円
              </p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={running ? pause : start}
                disabled={!task.trim()}
                data-analytics-event="tool_run"
                data-analytics-tool-id="focus-cost-timer"
                className={`rounded-full px-5 py-4 font-black text-white disabled:opacity-40 ${running ? "bg-amber-600 hover:bg-amber-700" : "bg-blue-600 hover:bg-blue-700"}`}
              >
                {running ? "一時停止" : elapsedMs ? "再開する" : "計測を開始"}
              </button>
              <button
                type="button"
                onClick={finish}
                disabled={elapsedMs < 1000}
                className="rounded-full border border-emerald-400 bg-emerald-50 px-5 py-4 font-black text-emerald-800 disabled:opacity-40"
              >
                完了して記録
              </button>
            </div>
            <button
              type="button"
              onClick={reset}
              disabled={!elapsedMs}
              className="mt-3 w-full rounded-full px-5 py-2 text-sm font-bold text-slate-500 disabled:opacity-30"
            >
              記録せずリセット
            </button>
          </section>
        </div>
        <section className="mt-10 border-t border-slate-200 pt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-950">
                端末内の作業履歴
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                このブラウザに直近20件を保存します。
              </p>
            </div>
            {sessions.length > 0 && (
              <button
                type="button"
                onClick={download}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700"
              >
                CSV保存
              </button>
            )}
          </div>
          {sessions.length === 0 ? (
            <p className="mt-4 rounded-2xl bg-slate-50 p-6 text-center text-slate-500">
              作業を完了すると履歴が表示されます。
            </p>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {sessions.map((session) => (
                <article
                  key={session.id}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <strong className="block truncate text-slate-950">
                    {session.task}
                  </strong>
                  <p className="mt-2 text-sm text-slate-600">
                    {formatDuration(session.elapsedMs)}・
                    {Math.round(
                      calculateCost(session.elapsedMs, session.hourlyRate),
                    ).toLocaleString()}
                    円
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {session.finishedAt}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
