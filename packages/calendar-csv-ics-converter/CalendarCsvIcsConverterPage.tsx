"use client";

import { PremiumInterestCards } from "@sakupla/shared-ui/PremiumInterestCards";
import { useState } from "react";
import {
  createIcs,
  decodeUtf8,
  mapCalendarEvents,
  parseCsv,
  suggestMapping,
  type CalendarEvent,
  type CalendarMapping,
  type CsvTable,
} from "./utils";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const SAMPLE = `件名,開始,終了,終日,場所,説明,タイムゾーン\n朝会,2026-08-03 09:00,2026-08-03 09:30,いいえ,会議室A,週次の進捗共有,Asia/Tokyo\n夏季休業,2026-08-13,2026-08-16,はい,,終日予定,Asia/Tokyo`;
const TEMPLATE = `件名,開始,終了,終日,場所,説明,タイムゾーン\n例：打ち合わせ,2026-08-03 10:00,2026-08-03 11:00,いいえ,例：会議室,例：議題,Asia/Tokyo`;
const fields: {
  key: keyof CalendarMapping;
  label: string;
  required?: boolean;
}[] = [
  { key: "title", label: "件名", required: true },
  { key: "start", label: "開始", required: true },
  { key: "end", label: "終了", required: true },
  { key: "allDay", label: "終日" },
  { key: "location", label: "場所" },
  { key: "description", label: "説明" },
  { key: "timezone", label: "タイムゾーン" },
];

function download(content: string, name: string, type: string) {
  const url = URL.createObjectURL(
    new Blob([type.includes("csv") ? "\uFEFF" : "", content], { type }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function CalendarCsvIcsConverterPage() {
  const [table, setTable] = useState<CsvTable | null>(null);
  const [fileName, setFileName] = useState("");
  const [mapping, setMapping] = useState<CalendarMapping>({
    title: "",
    start: "",
    end: "",
    allDay: "",
    location: "",
    description: "",
    timezone: "",
  });
  const [events, setEvents] = useState<CalendarEvent[] | null>(null);
  const [error, setError] = useState("");
  const setSource = (next: CsvTable, name: string) => {
    setTable(next);
    setFileName(name);
    setMapping(suggestMapping(next.headers));
    setEvents(null);
    setError("");
  };
  const loadFile = async (file?: File) => {
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setError("初期版では10MB以下のUTF-8 CSVを読み込めます。");
      return;
    }
    try {
      setSource(parseCsv(decodeUtf8(await file.arrayBuffer())), file.name);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "CSVを読み込めませんでした。",
      );
    }
  };
  const validate = () => {
    if (!table) return;
    try {
      setEvents(mapCalendarEvents(table, mapping));
      setError("");
    } catch (caught) {
      setEvents(null);
      setError(
        caught instanceof Error
          ? caught.message
          : "予定を検証できませんでした。",
      );
    }
  };
  const valid =
    events &&
    events.length > 0 &&
    events.every((event) => event.errors.length === 0);
  const saveIcs = () => {
    if (valid)
      download(
        createIcs(events),
        "calendar-events.ics",
        "text/calendar;charset=utf-8",
      );
  };
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
          業務効率化
        </p>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          予定CSV・ICS一括変換
        </h1>
        <p className="mt-4 leading-7 text-slate-600">
          日本語の予定CSVで列を割り当て、日付・時刻・終日・タイムゾーンを行ごとに検証してICSへ一括変換します。ファイルはブラウザ内だけで処理します。
        </p>
        <section
          aria-labelledby="quick-steps"
          className="mt-6 rounded-2xl bg-blue-50 p-5"
        >
          <h2 id="quick-steps" className="font-black text-slate-950">
            かんたん操作手順
          </h2>
          <ol className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-4">
            {[
              "CSVを読み込む",
              "列を割り当てる",
              "行ごとのエラーを確認",
              "ICSを保存する",
            ].map((step, index) => (
              <li key={step}>
                <span className="mr-2 font-black text-blue-700">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </section>
        <label className="mt-6 block rounded-2xl border-2 border-dashed border-slate-300 p-5 font-bold text-slate-800">
          予定CSV{" "}
          <span className="mt-1 block text-sm font-normal text-slate-500">
            {fileName || "見出し行と1行以上の予定を含むUTF-8 CSV"}
          </span>
          <input
            className="mt-3 block w-full text-sm"
            type="file"
            accept=".csv,text/csv"
            onChange={(event) => void loadFile(event.target.files?.[0])}
          />
        </label>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-full bg-blue-600 px-4 py-2 text-sm font-bold text-white"
            onClick={() => setSource(parseCsv(SAMPLE), "calendar-sample.csv")}
          >
            操作サンプルを読み込む
          </button>
          <button
            type="button"
            className="rounded-full border px-4 py-2 text-sm font-bold"
            onClick={() =>
              download(SAMPLE, "calendar-sample.csv", "text/csv;charset=utf-8")
            }
          >
            入力サンプルCSVを保存
          </button>
          <button
            type="button"
            className="rounded-full border px-4 py-2 text-sm font-bold"
            onClick={() =>
              download(
                TEMPLATE,
                "calendar-template.csv",
                "text/csv;charset=utf-8",
              )
            }
          >
            入力テンプレートCSVを保存
          </button>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          初期版はUTF-8・10MB以下、開始・終了は「YYYY-MM-DD
          HH:mm」、終日は「YYYY-MM-DD」です。仕様は
          <a
            className="text-blue-700 underline"
            href="https://www.rfc-editor.org/rfc/rfc5545"
            target="_blank"
            rel="noreferrer"
          >
            RFC 5545
          </a>
          と
          <a
            className="ml-1 text-blue-700 underline"
            href="https://support.google.com/calendar/answer/37118"
            target="_blank"
            rel="noreferrer"
          >
            Google Calendarのインポート案内
          </a>
          を参照しています。
        </p>
        {error && (
          <p
            role="alert"
            className="mt-4 rounded-xl bg-red-50 p-4 font-bold text-red-700"
          >
            {error}
          </p>
        )}
        {table && (
          <section className="mt-8" aria-labelledby="mapping-heading">
            <h2 id="mapping-heading" className="text-xl font-black">
              列の割り当て
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {fields.map((field) => (
                <label key={field.key} className="text-sm font-bold">
                  {field.label}
                  {field.required && (
                    <span className="text-red-600">（必須）</span>
                  )}
                  <select
                    className="mt-2 w-full rounded-xl border p-3 font-normal"
                    aria-label={`${field.label}の列`}
                    value={mapping[field.key]}
                    onChange={(event) => {
                      setMapping({
                        ...mapping,
                        [field.key]: event.target.value,
                      });
                      setEvents(null);
                    }}
                  >
                    <option value="">
                      {field.required ? "選択してください" : "使わない"}
                    </option>
                    {table.headers.map((header) => (
                      <option key={header}>{header}</option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
            <button
              type="button"
              data-analytics-event="tool_run"
              data-analytics-tool-id="calendar-csv-ics-converter"
              className="mt-6 rounded-full bg-blue-600 px-5 py-3 font-bold text-white"
              onClick={validate}
            >
              予定を検証する
            </button>
          </section>
        )}
        {events && (
          <section className="mt-8" aria-labelledby="result-heading">
            <h2 id="result-heading" className="text-xl font-black">
              検証結果
            </h2>
            <p className="mt-2 text-slate-600">
              {events.length}件中、エラー
              {events.filter((event) => event.errors.length).length}件
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-[620px] w-full text-left text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="p-2">元行</th>
                    <th className="p-2">件名</th>
                    <th className="p-2">開始</th>
                    <th className="p-2">終了</th>
                    <th className="p-2">状態</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.rowNumber} className="border-b align-top">
                      <td className="p-2">{event.rowNumber}</td>
                      <td className="p-2">{event.title || "（空欄）"}</td>
                      <td className="p-2">{event.start}</td>
                      <td className="p-2">{event.end}</td>
                      <td
                        className={`p-2 font-bold ${event.errors.length ? "text-red-700" : "text-emerald-700"}`}
                      >
                        {event.errors.length
                          ? event.errors.join("／")
                          : "変換できます"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              disabled={!valid}
              className="mt-5 rounded-full bg-emerald-600 px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
              onClick={saveIcs}
            >
              ICSファイルを保存
            </button>
            {valid && (
              <PremiumInterestCards
                toolId="calendar-csv-ics-converter"
                placement="result_after"
                candidates={[
                  {
                    featureId: "conversion_preset_save",
                    name: "変換プリセット保存",
                    description:
                      "同じ列割り当てを次回も呼び出せる候補機能です。",
                  },
                  {
                    featureId: "recurring_events",
                    name: "繰り返し予定",
                    description: "定期開催の予定をまとめて作れる候補機能です。",
                  },
                ]}
              />
            )}
          </section>
        )}
      </section>
    </main>
  );
}
