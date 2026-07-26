"use client";

import { useMemo, useRef, useState } from "react";
import {
  formatSubtitle,
  parseSubtitle,
  shiftCues,
  type SubtitleFormat,
} from "./utils";

const SAMPLE = `1
00:00:02,000 --> 00:00:05,000
字幕の表示が映像より少し遅れています。

2
00:00:05,500 --> 00:00:09,000
全字幕をまとめて前へ移動して調整します。

3
00:00:09,500 --> 00:00:13,000
形式と時間の重なりも保存前に確認できます。`;

export function SubtitleTimingFixerPage() {
  const [source, setSource] = useState("");
  const [offsetMs, setOffsetMs] = useState(-500);
  const [outputFormat, setOutputFormat] = useState<SubtitleFormat>("srt");
  const [message, setMessage] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const result = useMemo(() => parseSubtitle(source), [source]);
  const errors = result.issues.filter((issue) => issue.level === "error");
  const warnings = result.issues.filter((issue) => issue.level === "warning");
  const canExport = result.cues.length > 0 && errors.length === 0;

  const loadSample = () => {
    setSource(SAMPLE);
    setOutputFormat("srt");
    setOffsetMs(-500);
    setMessage("サンプルを読み込みました。-500ミリ秒の調整を試せます。");
  };

  const loadFile = async (file?: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setMessage("5MB以下のSRT・VTTファイルを選択してください。");
      return;
    }
    const text = await file.text();
    const detected = parseSubtitle(text).format;
    setSource(text);
    setOutputFormat(detected);
    setMessage(`${file.name}をブラウザ内で読み込みました。`);
  };

  const applyShift = () => {
    if (!canExport) return;
    const shifted = shiftCues(result.cues, offsetMs);
    setSource(formatSubtitle(shifted.cues, result.format));
    setMessage(
      shifted.appliedMs === offsetMs
        ? `全字幕を${offsetMs >= 0 ? "+" : ""}${offsetMs}ミリ秒移動しました。`
        : `先頭が0秒より前にならないよう、${shifted.appliedMs}ミリ秒まで調整しました。`,
    );
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
          字幕ファイルの時刻形式、逆転、重なり、連番を確認し、映像とのずれを全字幕まとめて前後へ移動します。自動文字起こしやAIは使わず、ファイルは端末内だけで処理します。
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.05fr_.95fr]">
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
                    マイナスは字幕を早め、プラスは遅らせます。例：-500で0.5秒早めます。
                  </p>
                  <button
                    type="button"
                    onClick={applyShift}
                    disabled={!canExport}
                    data-analytics-event="tool_run"
                    data-analytics-tool-id="subtitle-timing-fixer"
                    className="mt-3 w-full rounded-full bg-blue-600 px-5 py-3 font-black text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    全字幕の時間を調整
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
            <p className="mt-5 text-xs leading-5 text-slate-500">
              形式チェックは映像との一致を保証しません。保存後は実際の動画プレーヤーで字幕の開始・終了を確認してください。
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
