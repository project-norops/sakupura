"use client";

import { useMemo, useRef, useState } from "react";
import {
  formatSubtitle,
  formatTimecode,
  parseSubtitle,
  parseTimecode,
  shiftCues,
  updateCueTiming,
  type SubtitleCue,
  type SubtitleFormat,
  type SubtitleIssue,
} from "./utils";

const SAMPLE = `1
00:00:02,000 --> 00:00:05,000
字幕の表示が映像より少し遅れています。

2
00:00:04,800 --> 00:00:09,000
前の字幕と少し重なるため、個別に直せます。

3
00:00:09,500 --> 00:00:13,000
全字幕の一括移動と個別調整を使い分けられます。`;

const PAGE_SIZE = 50;

type CueEditorProps = {
  cue: SubtitleCue;
  position: number;
  format: SubtitleFormat;
  issues: SubtitleIssue[];
  onSave: (position: number, startMs: number, endMs: number) => void;
  onNudge: (position: number, deltaMs: number) => void;
};

function CueEditor({
  cue,
  position,
  format,
  issues,
  onSave,
  onNudge,
}: CueEditorProps) {
  const [start, setStart] = useState(formatTimecode(cue.startMs, format));
  const [end, setEnd] = useState(formatTimecode(cue.endMs, format));
  const [error, setError] = useState("");

  const save = () => {
    const startMs = parseTimecode(start);
    const endMs = parseTimecode(end);
    if (startMs === null || endMs === null) {
      setError("00:00:00,000 または 00:00:00.000 の形式で入力してください。");
      return;
    }
    if (endMs <= startMs) {
      setError("終了時刻は開始時刻より後にしてください。");
      return;
    }
    setError("");
    onSave(position, startMs, endMs);
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-black text-slate-950">字幕 {cue.index}</p>
        {issues.length > 0 ? (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-900">
            要確認 {issues.length}件
          </span>
        ) : (
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
            問題なし
          </span>
        )}
      </div>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
        {cue.text || "（字幕本文が空です）"}
      </p>
      {issues.length > 0 && (
        <ul className="mt-3 space-y-1 text-xs leading-5 text-amber-900">
          {issues.map((issue, index) => (
            <li key={`${issue.message}-${index}`}>・{issue.message}</li>
          ))}
        </ul>
      )}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-black text-slate-600">
          開始時刻
          <input
            aria-label={`字幕${cue.index}の開始時刻`}
            value={start}
            onChange={(event) => setStart(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 font-mono text-sm text-slate-950"
          />
        </label>
        <label className="text-xs font-black text-slate-600">
          終了時刻
          <input
            aria-label={`字幕${cue.index}の終了時刻`}
            value={end}
            onChange={(event) => setEnd(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 font-mono text-sm text-slate-950"
          />
        </label>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {[-1000, -100, 100, 1000].map((delta) => (
          <button
            key={delta}
            type="button"
            onClick={() => onNudge(position, delta)}
            className="rounded-xl border border-slate-300 px-2 py-2 text-xs font-black text-slate-700 hover:border-blue-400 hover:text-blue-700"
          >
            {delta > 0 ? "+" : ""}
            {delta >= 1000 || delta <= -1000
              ? `${delta / 1000}秒`
              : `${delta}ms`}
          </button>
        ))}
      </div>
      {error && <p className="mt-2 text-xs font-bold text-rose-700">{error}</p>}
      <button
        type="button"
        onClick={save}
        className="mt-3 w-full rounded-full bg-slate-950 px-4 py-2.5 text-sm font-black text-white hover:bg-blue-700"
      >
        この字幕の時刻を反映
      </button>
    </article>
  );
}

export function SubtitleTimingFixerPage() {
  const [source, setSource] = useState("");
  const [originalSource, setOriginalSource] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [offsetMs, setOffsetMs] = useState(-500);
  const [outputFormat, setOutputFormat] = useState<SubtitleFormat>("srt");
  const [message, setMessage] = useState("");
  const [issuesOnly, setIssuesOnly] = useState(false);
  const [page, setPage] = useState(1);
  const fileRef = useRef<HTMLInputElement>(null);
  const result = useMemo(() => parseSubtitle(source), [source]);
  const errors = result.issues.filter((issue) => issue.level === "error");
  const warnings = result.issues.filter((issue) => issue.level === "warning");
  const canExport = result.cues.length > 0 && errors.length === 0;

  const cueEntries = useMemo(
    () =>
      result.cues.map((cue, position) => ({
        cue,
        position,
        issues: result.issues.filter((issue) => issue.cue === cue.index),
      })),
    [result.cues, result.issues],
  );
  const filteredEntries = issuesOnly
    ? cueEntries.filter((entry) => entry.issues.length > 0)
    : cueEntries;
  const pageCount = Math.max(1, Math.ceil(filteredEntries.length / PAGE_SIZE));
  const effectivePage = Math.min(page, pageCount);
  const visibleEntries = filteredEntries.slice(
    (effectivePage - 1) * PAGE_SIZE,
    effectivePage * PAGE_SIZE,
  );

  const replaceInput = (
    nextSource: string,
    format: SubtitleFormat,
    status: string,
  ) => {
    setSource(nextSource);
    setOriginalSource(nextSource);
    setHistory([]);
    setOutputFormat(format);
    setPage(1);
    setIssuesOnly(false);
    setMessage(status);
  };

  const commitCues = (cues: SubtitleCue[], status: string) => {
    setHistory((current) => [...current.slice(-19), source]);
    setSource(formatSubtitle(cues, result.format));
    setMessage(status);
  };

  const loadSample = () => {
    replaceInput(
      SAMPLE,
      "srt",
      "重なりがあるサンプルを読み込みました。一括移動と個別修正を試せます。",
    );
    setOffsetMs(-500);
  };

  const loadFile = async (file?: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setMessage("5MB以下のSRT・VTTファイルを選択してください。");
      return;
    }
    const text = await file.text();
    const detected = parseSubtitle(text).format;
    replaceInput(
      text,
      detected,
      `${file.name}をブラウザー内で読み込みました。`,
    );
  };

  const applyShift = () => {
    if (result.cues.length === 0) return;
    const shifted = shiftCues(result.cues, offsetMs);
    commitCues(
      shifted.cues,
      shifted.appliedMs === offsetMs
        ? `全字幕を${offsetMs >= 0 ? "+" : ""}${offsetMs}ミリ秒移動しました。`
        : `先頭が0秒より前にならないよう、${shifted.appliedMs}ミリ秒まで調整しました。`,
    );
  };

  const saveCueTiming = (position: number, startMs: number, endMs: number) => {
    const next = updateCueTiming(result.cues, position, startMs, endMs);
    commitCues(
      next,
      `字幕${result.cues[position].index}の時刻を反映し、再診断しました。`,
    );
  };

  const nudgeCue = (position: number, requestedDelta: number) => {
    const cue = result.cues[position];
    const delta = Math.max(requestedDelta, -cue.startMs);
    const next = updateCueTiming(
      result.cues,
      position,
      cue.startMs + delta,
      cue.endMs + delta,
    );
    commitCues(
      next,
      `字幕${cue.index}を${delta >= 0 ? "+" : ""}${delta}ミリ秒移動し、再診断しました。`,
    );
  };

  const undo = () => {
    const previous = history.at(-1);
    if (previous === undefined) return;
    setSource(previous);
    setHistory((current) => current.slice(0, -1));
    setMessage("直前の時刻変更を取り消しました。");
  };

  const restoreOriginal = () => {
    if (!originalSource || source === originalSource) return;
    setHistory((current) => [...current.slice(-19), source]);
    setSource(originalSource);
    setMessage("読み込み時の字幕へ戻しました。");
  };

  const download = () => {
    if (!canExport) return;
    const blob = new Blob([formatSubtitle(result.cues, outputFormat)], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `subtitles-fixed.${outputFormat}`;
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage(
      `${outputFormat.toUpperCase()}形式で保存しました。動画上でも同期を確認してください。`,
    );
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <p className="text-xs font-black uppercase tracking-[.2em] text-blue-600">
          動画字幕
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          SRT・VTT字幕チェック／時間ずれ修正
        </h1>
        <p className="mt-4 max-w-3xl leading-7 text-slate-600">
          字幕ファイルの時刻形式、逆転、重なり、連番を確認し、全字幕の一括移動または字幕ごとの微調整で修正します。自動文字起こしやAIは使わず、ファイルは端末内だけで処理します。
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.02fr_.98fr]">
          <section className="min-w-0">
            <h2 className="text-xl font-black text-slate-950">
              1. 字幕を読み込む
            </h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="rounded-full bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-700"
              >
                SRT・VTTファイルを選ぶ
              </button>
              <button
                type="button"
                onClick={loadSample}
                data-analytics-event="sample_load"
                data-analytics-tool-id="subtitle-timing-fixer"
                className="rounded-full border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 hover:border-blue-400"
              >
                サンプルで試す
              </button>
              <input
                ref={fileRef}
                type="file"
                accept=".srt,.vtt,text/plain"
                className="sr-only"
                onChange={(event) => loadFile(event.target.files?.[0])}
              />
            </div>
            <label className="mt-4 block text-sm font-bold text-slate-700">
              字幕内容を貼り付けても使えます
              <textarea
                value={source}
                onChange={(event) => {
                  setSource(event.target.value);
                  setOriginalSource(event.target.value);
                  setHistory([]);
                  setPage(1);
                  setMessage("");
                }}
                rows={17}
                placeholder={
                  "1\n00:00:01,000 --> 00:00:04,000\nここに字幕を入力"
                }
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-950 p-4 font-mono text-sm leading-6 text-slate-50 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </label>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              対象はUTF-8のSRT・WebVTT、最大5MBです。読み込んだ字幕をサーバーへ送信しません。
            </p>
          </section>

          <section className="min-w-0">
            <h2 className="text-xl font-black text-slate-950">
              2. 診断して時間を直す
            </h2>
            {!source ? (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
                ファイルを選ぶか、サンプルを読み込むと診断結果が表示されます。
              </div>
            ) : (
              <>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <span className="block text-2xl font-black">
                      {result.cues.length}
                    </span>
                    <span className="text-xs text-slate-500">字幕数</span>
                  </div>
                  <div className="rounded-2xl bg-rose-50 p-3 text-rose-800">
                    <span className="block text-2xl font-black">
                      {errors.length}
                    </span>
                    <span className="text-xs">エラー</span>
                  </div>
                  <div className="rounded-2xl bg-amber-50 p-3 text-amber-800">
                    <span className="block text-2xl font-black">
                      {warnings.length}
                    </span>
                    <span className="text-xs">確認事項</span>
                  </div>
                </div>
                <div className="mt-4 rounded-2xl border border-slate-200 p-4">
                  <p className="text-sm font-black text-slate-900">
                    検出形式：{result.format.toUpperCase()}
                  </p>
                  {result.issues.length === 0 ? (
                    <p className="mt-2 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-800">
                      形式上の問題は見つかりませんでした。
                    </p>
                  ) : (
                    <ul className="mt-3 max-h-52 space-y-2 overflow-auto text-sm leading-5">
                      {result.issues.map((issue, index) => (
                        <li
                          key={`${issue.cue}-${index}`}
                          className={`rounded-xl p-3 ${issue.level === "error" ? "bg-rose-50 text-rose-800" : "bg-amber-50 text-amber-900"}`}
                        >
                          <strong>
                            {issue.level === "error" ? "要修正" : "確認"}
                            {issue.cue ? `・字幕${issue.cue}` : ""}：
                          </strong>
                          {issue.message}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="mt-4 rounded-2xl bg-blue-50 p-4">
                  <label className="text-sm font-black text-blue-950">
                    全字幕を移動する時間（ミリ秒）
                    <input
                      type="number"
                      step="100"
                      value={offsetMs}
                      onChange={(event) =>
                        setOffsetMs(Number(event.target.value))
                      }
                      className="mt-2 w-full rounded-xl border border-blue-200 bg-white px-4 py-3 text-slate-950"
                    />
                  </label>
                  <p className="mt-2 text-xs leading-5 text-blue-900">
                    マイナスは早め、プラスは遅らせます。例：-500で0.5秒早めます。
                  </p>
                  <button
                    type="button"
                    onClick={applyShift}
                    disabled={result.cues.length === 0}
                    data-analytics-event="tool_run"
                    data-analytics-tool-id="subtitle-timing-fixer"
                    className="mt-3 w-full rounded-full bg-blue-600 px-5 py-3 font-black text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    全字幕の時間を調整
                  </button>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={undo}
                    disabled={history.length === 0}
                    className="rounded-full border border-slate-300 px-4 py-2.5 text-sm font-black text-slate-700 disabled:text-slate-300"
                  >
                    1操作戻す
                  </button>
                  <button
                    type="button"
                    onClick={restoreOriginal}
                    disabled={!originalSource || source === originalSource}
                    className="rounded-full border border-slate-300 px-4 py-2.5 text-sm font-black text-slate-700 disabled:text-slate-300"
                  >
                    読み込み時に戻す
                  </button>
                </div>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <select
                    value={outputFormat}
                    onChange={(event) =>
                      setOutputFormat(event.target.value as SubtitleFormat)
                    }
                    className="rounded-full border border-slate-300 px-4 py-3 text-sm font-bold"
                  >
                    <option value="srt">SRTで保存</option>
                    <option value="vtt">WebVTTで保存</option>
                  </select>
                  <button
                    type="button"
                    onClick={download}
                    disabled={!canExport}
                    className="flex-1 rounded-full border border-blue-600 px-5 py-3 font-black text-blue-700 hover:bg-blue-50 disabled:border-slate-300 disabled:text-slate-400"
                  >
                    修正版をダウンロード
                  </button>
                </div>
              </>
            )}
            {message && (
              <p
                role="status"
                className="mt-4 rounded-xl bg-slate-100 p-3 text-sm font-bold text-slate-700"
              >
                {message}
              </p>
            )}
          </section>
        </div>

        {result.cues.length > 0 && (
          <section className="mt-10 border-t border-slate-200 pt-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-950">
                  3. 字幕ごとに微調整する
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  時刻を直接入力するか、字幕全体を100ミリ秒・1秒単位で前後へ移動できます。変更後は自動で再診断します。
                </p>
              </div>
              <label className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">
                <input
                  type="checkbox"
                  checked={issuesOnly}
                  onChange={(event) => {
                    setIssuesOnly(event.target.checked);
                    setPage(1);
                  }}
                />
                要確認の字幕だけ表示
              </label>
            </div>
            {filteredEntries.length === 0 ? (
              <p className="mt-5 rounded-2xl bg-emerald-50 p-5 text-sm font-bold text-emerald-800">
                要確認の字幕はありません。チェックを外すと全字幕を編集できます。
              </p>
            ) : (
              <>
                <p className="mt-5 text-xs font-bold text-slate-500">
                  {filteredEntries.length}件中{" "}
                  {(effectivePage - 1) * PAGE_SIZE + 1}〜
                  {Math.min(effectivePage * PAGE_SIZE, filteredEntries.length)}
                  件を表示（1ページ最大{PAGE_SIZE}件）
                </p>
                <div className="mt-3 grid gap-4 lg:grid-cols-2">
                  {visibleEntries.map((entry) => (
                    <CueEditor
                      key={`${entry.position}-${entry.cue.index}-${entry.cue.startMs}-${entry.cue.endMs}-${result.format}`}
                      cue={entry.cue}
                      position={entry.position}
                      format={result.format}
                      issues={entry.issues}
                      onSave={saveCueTiming}
                      onNudge={nudgeCue}
                    />
                  ))}
                </div>
                {pageCount > 1 && (
                  <div className="mt-5 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setPage((current) => Math.max(1, current - 1))
                      }
                      disabled={effectivePage === 1}
                      className="rounded-full border border-slate-300 px-4 py-2 text-sm font-black disabled:text-slate-300"
                    >
                      前の50件
                    </button>
                    <span className="text-sm font-bold text-slate-600">
                      {effectivePage} / {pageCount}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setPage((current) => Math.min(pageCount, current + 1))
                      }
                      disabled={effectivePage === pageCount}
                      className="rounded-full border border-slate-300 px-4 py-2 text-sm font-black disabled:text-slate-300"
                    >
                      次の50件
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        )}

        <p className="mt-8 text-xs leading-5 text-slate-500">
          形式チェックは映像との一致を保証しません。保存後は実際の動画プレーヤーで字幕の開始・終了を確認してください。
        </p>
      </section>
    </main>
  );
}
