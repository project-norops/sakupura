"use client";

import { useState } from "react";
import {
  calculateBusinessDeadline,
  formatJapaneseDate,
  HOLIDAY_DATA_RANGE,
  type Direction,
} from "./utils";

function initialDate() {
  const today = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  return today >= "2025-01-01" && today <= "2027-12-31" ? today : "2026-07-27";
}

export function BusinessDayCalculatorPage() {
  const [start, setStart] = useState(initialDate);
  const [days, setDays] = useState(5);
  const [direction, setDirection] = useState<Direction>("forward");
  const [saturdayBusiness, setSaturdayBusiness] = useState(false);
  const [sundayBusiness, setSundayBusiness] = useState(false);
  const [customDate, setCustomDate] = useState("");
  const [customHolidays, setCustomHolidays] = useState<string[]>([]);
  const [result, setResult] = useState<ReturnType<
    typeof calculateBusinessDeadline
  > | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const calculate = () => {
    try {
      const next = calculateBusinessDeadline(start, days, direction, {
        saturdayBusiness,
        sundayBusiness,
        customHolidays,
      });
      setResult(next);
      setError("");
    } catch (cause) {
      setResult(null);
      setError(
        cause instanceof Error ? cause.message : "計算できませんでした。",
      );
    }
  };

  const addCustomHoliday = () => {
    if (!customDate || customHolidays.includes(customDate)) return;
    setCustomHolidays((current) => [...current, customDate].sort());
    setCustomDate("");
    setResult(null);
  };

  const copyResult = async () => {
    if (!result) return;
    const text = `${formatJapaneseDate(result.resultDate)}（${days}営業日${direction === "forward" ? "後" : "前"}）`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <p className="text-xs font-black uppercase tracking-[.2em] text-blue-600">
          業務計算
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          営業日・期限計算カレンダー
        </h1>
        <p className="mt-4 max-w-3xl leading-7 text-slate-600">
          「今日から5営業日後」「納期から3営業日前」などの期限を、土日・日本の祝日・会社独自の休業日を除外して計算します。除外した日も順番に表示するため、根拠を確認できます。
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {[
            ["入金確認・3営業日", 3],
            ["発送目安・5営業日", 5],
            ["制作確認・10営業日", 10],
          ].map(([label, value]) => (
            <button
              key={label}
              type="button"
              onClick={() => {
                setDays(value as number);
                setDirection("forward");
                setResult(null);
              }}
              className="rounded-full border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:border-blue-400 hover:text-blue-700"
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[.85fr_1.15fr]">
          <section className="min-w-0">
            <h2 className="text-xl font-black text-slate-950">
              1. 計算条件を設定
            </h2>
            <label className="mt-4 block text-sm font-bold text-slate-700">
              基準日
              <input
                type="date"
                min="2025-01-01"
                max="2027-12-31"
                value={start}
                onChange={(event) => {
                  setStart(event.target.value);
                  setResult(null);
                }}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
              />
            </label>
            <div className="mt-4 grid grid-cols-[1fr_8rem] gap-3">
              <label className="text-sm font-bold text-slate-700">
                計算方向
                <select
                  value={direction}
                  onChange={(event) => {
                    setDirection(event.target.value as Direction);
                    setResult(null);
                  }}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
                >
                  <option value="forward">基準日の後</option>
                  <option value="backward">基準日の前</option>
                </select>
              </label>
              <label className="text-sm font-bold text-slate-700">
                営業日数
                <input
                  type="number"
                  min="1"
                  max="366"
                  value={days}
                  onChange={(event) => {
                    setDays(Number(event.target.value));
                    setResult(null);
                  }}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
                />
              </label>
            </div>
            <fieldset className="mt-5 rounded-2xl bg-slate-50 p-4">
              <legend className="px-1 text-sm font-black text-slate-800">
                通常営業日に含める曜日
              </legend>
              <label className="mt-2 flex items-center gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={saturdayBusiness}
                  onChange={(event) => {
                    setSaturdayBusiness(event.target.checked);
                    setResult(null);
                  }}
                  className="h-5 w-5"
                />
                土曜日を営業日にする
              </label>
              <label className="mt-3 flex items-center gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={sundayBusiness}
                  onChange={(event) => {
                    setSundayBusiness(event.target.checked);
                    setResult(null);
                  }}
                  className="h-5 w-5"
                />
                日曜日を営業日にする
              </label>
              <p className="mt-3 text-xs leading-5 text-slate-500">
                日本の祝日は曜日設定にかかわらず除外します。
              </p>
            </fieldset>
            <div className="mt-5 rounded-2xl border border-slate-200 p-4">
              <label className="text-sm font-black text-slate-800">
                会社独自の休業日（任意）
                <div className="mt-2 flex gap-2">
                  <input
                    type="date"
                    min="2025-01-01"
                    max="2027-12-31"
                    value={customDate}
                    onChange={(event) => setCustomDate(event.target.value)}
                    className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2"
                  />
                  <button
                    type="button"
                    onClick={addCustomHoliday}
                    className="rounded-xl border border-blue-500 px-4 py-2 text-sm font-bold text-blue-700"
                  >
                    追加
                  </button>
                </div>
              </label>
              {customHolidays.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {customHolidays.map((date) => (
                    <button
                      key={date}
                      type="button"
                      onClick={() => {
                        setCustomHolidays((current) =>
                          current.filter((item) => item !== date),
                        );
                        setResult(null);
                      }}
                      className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700"
                    >
                      {date} ×
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={calculate}
              data-analytics-event="tool_run"
              data-analytics-tool-id="business-day-calculator"
              className="mt-5 w-full rounded-full bg-blue-600 px-5 py-3.5 font-black text-white hover:bg-blue-700"
            >
              期限を計算する
            </button>
            {error && (
              <p
                role="alert"
                className="mt-3 rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-800"
              >
                {error}
              </p>
            )}
          </section>

          <section className="min-w-0">
            <h2 className="text-xl font-black text-slate-950">
              2. 期限と計算根拠を確認
            </h2>
            {!result ? (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
                条件を設定して「期限を計算する」を押してください。
              </div>
            ) : (
              <>
                <div className="mt-4 rounded-3xl bg-blue-600 p-6 text-white shadow-sm">
                  <p className="text-sm font-bold text-blue-100">計算結果</p>
                  <p className="mt-2 text-2xl font-black sm:text-3xl">
                    {formatJapaneseDate(result.resultDate)}
                  </p>
                  <p className="mt-2 text-sm text-blue-100">
                    基準日を0日目とし、{days}営業日
                    {direction === "forward" ? "後" : "前"}を計算しました。
                  </p>
                  <button
                    type="button"
                    onClick={copyResult}
                    className="mt-4 rounded-full bg-white px-5 py-2.5 text-sm font-black text-blue-700"
                  >
                    {copied ? "コピーしました" : "結果をコピー"}
                  </button>
                </div>
                <div className="mt-5 rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <strong className="text-sm text-slate-900">
                      数えた日付
                    </strong>
                    <span className="text-xs text-slate-500">
                      除外日を含む{result.trace.length}日
                    </span>
                  </div>
                  <ol className="mt-3 max-h-[28rem] space-y-2 overflow-auto pr-1">
                    {result.trace.map((day) => (
                      <li
                        key={day.date}
                        className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm ${day.business ? "bg-emerald-50 text-emerald-900" : "bg-slate-50 text-slate-500"}`}
                      >
                        <span>
                          <strong>{formatJapaneseDate(day.date)}</strong>
                          <span className="ml-2 text-xs">{day.reason}</span>
                        </span>
                        <span className="shrink-0 font-black">
                          {day.business ? `${day.counted}日目` : "除外"}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              </>
            )}
            <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-xs leading-6 text-amber-950">
              <strong>祝日データ：{HOLIDAY_DATA_RANGE}</strong>
              <br />
              内閣府公表の国民の祝日を基準にしています。金融機関、配送会社、契約上の営業日は独自の扱いになる場合があります。重要な期限は関係先へ確認してください。
            </div>
            <a
              href="https://www8.cao.go.jp/chosei/shukujitsu/gaiyou.html"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-sm font-bold text-blue-700 underline underline-offset-4"
            >
              内閣府：国民の祝日について
            </a>
          </section>
        </div>
      </section>
    </main>
  );
}
