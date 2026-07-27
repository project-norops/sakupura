"use client";

import { PremiumInterestCards } from "@sakupla/shared-ui/PremiumInterestCards";
import { useState, type FormEvent } from "react";
import {
  calculateCapacity,
  countWeekdays,
  type CapacityInputs,
  type CapacityProject,
  type CapacityResult,
} from "./utils";

const SAMPLE: CapacityInputs = {
  month: "2026-08",
  holidayWeekdays: 1,
  hoursPerDay: 7,
  nonBillableHours: 28,
  salesTarget: 600000,
  projects: [
    { id: "site", name: "Webサイト制作", plannedHours: 60, reward: 300000 },
    { id: "operation", name: "SNS運用", plannedHours: 28, reward: 140000 },
  ],
};
const PREMIUM_CANDIDATES = [
  {
    featureId: "capacity_plan_save" as const,
    name: "月次計画の保存",
    description:
      "案件と稼働条件をこの端末に保存し、受注前の見直しで呼び出せる候補です。",
  },
  {
    featureId: "multi_month_capacity" as const,
    name: "複数月の見通し",
    description:
      "今月から数か月先までの稼働余力と売上見込みを横並びで確認できる候補です。",
  },
];
const inputClass =
  "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

function number(value: number, digits = 1) {
  return value.toLocaleString("ja-JP", { maximumFractionDigits: digits });
}
function yen(value: number) {
  return `${Math.round(value).toLocaleString("ja-JP")}円`;
}

export function FreelanceCapacityPlannerPage() {
  const [inputs, setInputs] = useState<CapacityInputs>(SAMPLE);
  const [result, setResult] = useState<CapacityResult | null>(null);
  const [error, setError] = useState("");

  const reset = () => {
    setResult(null);
    setError("");
  };
  const updateNumber = (
    key: keyof Omit<CapacityInputs, "month" | "projects">,
    value: string,
  ) => {
    setInputs((current) => ({
      ...current,
      [key]: Math.max(0, Number(value) || 0),
    }));
    reset();
  };
  const updateProject = (
    id: string,
    key: keyof Omit<CapacityProject, "id">,
    value: string,
  ) => {
    setInputs((current) => ({
      ...current,
      projects: current.projects.map((project) =>
        project.id === id
          ? {
              ...project,
              [key]: key === "name" ? value : Math.max(0, Number(value) || 0),
            }
          : project,
      ),
    }));
    reset();
  };
  const addProject = () => {
    setInputs((current) => ({
      ...current,
      projects: [
        ...current.projects,
        {
          id: `project-${Date.now()}`,
          name: `案件 ${current.projects.length + 1}`,
          plannedHours: 20,
          reward: 100000,
        },
      ],
    }));
    reset();
  };
  const removeProject = (id: string) => {
    setInputs((current) => ({
      ...current,
      projects: current.projects.filter((project) => project.id !== id),
    }));
    reset();
  };
  const loadSample = () => {
    setInputs(SAMPLE);
    reset();
  };
  const run = (event: FormEvent) => {
    event.preventDefault();
    const weekdays = countWeekdays(inputs.month);
    if (!weekdays) {
      setError("計画する月を選んでください。");
      return;
    }
    if (
      inputs.hoursPerDay <= 0 ||
      inputs.holidayWeekdays > weekdays ||
      inputs.nonBillableHours >=
        (weekdays - inputs.holidayWeekdays) * inputs.hoursPerDay
    ) {
      setError(
        "休日、1日の稼働時間、非請求時間を確認してください。案件に使える時間が1時間以上必要です。",
      );
      return;
    }
    if (
      inputs.projects.length === 0 ||
      inputs.projects.some(
        (project) =>
          !project.name.trim() ||
          project.plannedHours <= 0 ||
          project.reward < 0,
      )
    ) {
      setError("案件名と0より大きい予定時間を入力してください。");
      return;
    }
    setError("");
    setResult(calculateCapacity(inputs));
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
          フリーランスの受注計画
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          稼働・売上キャパシティ計画
        </h1>
        <p className="mt-4 max-w-4xl leading-7 text-slate-600">
          「来月、この新規案件を受けても大丈夫か」を判断する前に、平日の稼働時間から休日・営業・事務などの時間と既存案件を差し引き、残り時間と売上見込みを確認します。入力内容はブラウザ内だけで計算します。
        </p>
        <section
          aria-label="かんたん操作手順"
          className="mt-6 grid gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 sm:grid-cols-3 sm:p-5"
        >
          <div>
            <h2 className="font-black">1. 稼働条件</h2>
            <p className="mt-1 text-sm leading-6">
              月、平日の休日、1日時間、営業・事務時間を入力
            </p>
          </div>
          <div>
            <h2 className="font-black">2. 既存案件</h2>
            <p className="mt-1 text-sm leading-6">
              各案件の予定時間と報酬を入力
            </p>
          </div>
          <div>
            <h2 className="font-black">3. 余力を確認</h2>
            <p className="mt-1 text-sm leading-6">
              残り時間、稼働率、売上目標との差を見る
            </p>
          </div>
        </section>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          サンプルは、平日から休日1日を除き1日7時間、営業・経理などの非請求時間を月28時間確保した個人事業の計画です。
        </p>

        <form onSubmit={run} noValidate className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-black">月の稼働条件</h2>
            <button
              type="button"
              onClick={loadSample}
              data-analytics-event="sample_load"
              data-analytics-tool-id="freelance-capacity-planner"
              className="min-h-11 rounded-full border border-blue-300 px-4 text-sm font-bold text-blue-700"
            >
              サンプルに戻す
            </button>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <label className="block text-sm font-bold text-slate-700">
              計画する月
              <input
                type="month"
                value={inputs.month}
                onChange={(event) => {
                  setInputs((current) => ({
                    ...current,
                    month: event.target.value,
                  }));
                  reset();
                }}
                className={inputClass}
              />
            </label>
            <NumberField
              label="平日に取る休日"
              unit="日"
              value={inputs.holidayWeekdays}
              onChange={(value) => updateNumber("holidayWeekdays", value)}
            />
            <NumberField
              label="1日の稼働時間"
              unit="時間"
              value={inputs.hoursPerDay}
              onChange={(value) => updateNumber("hoursPerDay", value)}
            />
            <NumberField
              label="非請求時間"
              unit="時間／月"
              value={inputs.nonBillableHours}
              onChange={(value) => updateNumber("nonBillableHours", value)}
            />
            <NumberField
              label="売上目標"
              unit="円／月"
              value={inputs.salesTarget}
              onChange={(value) => updateNumber("salesTarget", value)}
            />
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            非請求時間は、営業、見積、経理、学習、社内作業など、案件報酬へ直接ひも付けない時間の合計です。土日は最初から稼働日に含めません。
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-black">受注済み・予定案件</h2>
            <button
              type="button"
              onClick={addProject}
              className="min-h-11 rounded-full border border-slate-300 px-4 text-sm font-bold text-slate-700"
            >
              案件を追加
            </button>
          </div>
          <div className="mt-4 grid gap-4">
            {inputs.projects.map((project, index) => (
              <fieldset
                key={project.id}
                className="rounded-2xl border border-slate-200 p-4"
              >
                <legend className="px-2 font-black">案件 {index + 1}</legend>
                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="block text-sm font-bold text-slate-700">
                    案件名
                    <input
                      type="text"
                      value={project.name}
                      onChange={(event) =>
                        updateProject(project.id, "name", event.target.value)
                      }
                      className={inputClass}
                    />
                  </label>
                  <NumberField
                    label="予定時間"
                    unit="時間"
                    value={project.plannedHours}
                    onChange={(value) =>
                      updateProject(project.id, "plannedHours", value)
                    }
                  />
                  <NumberField
                    label="報酬"
                    unit="円"
                    value={project.reward}
                    onChange={(value) =>
                      updateProject(project.id, "reward", value)
                    }
                  />
                </div>
                {inputs.projects.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => removeProject(project.id)}
                    className="mt-3 min-h-11 rounded-full px-3 text-sm font-bold text-rose-700 hover:bg-rose-50"
                  >
                    この案件を削除
                  </button>
                ) : null}
              </fieldset>
            ))}
          </div>
          {error ? (
            <p
              role="alert"
              className="mt-4 rounded-xl bg-rose-50 p-4 text-sm font-bold text-rose-800"
            >
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            data-analytics-event="tool_run"
            data-analytics-tool-id="freelance-capacity-planner"
            className="mt-6 w-full rounded-full bg-blue-600 px-5 py-4 font-black text-white hover:bg-blue-700"
          >
            来月の余力を計算する
          </button>
        </form>

        <section aria-live="polite" aria-label="計算結果" className="mt-10">
          <h2 className="text-xl font-black">計算結果</h2>
          {!result ? (
            <div className="mt-4 rounded-2xl bg-slate-50 p-7 text-center text-slate-500">
              稼働条件と案件を入力して計算してください。
            </div>
          ) : (
            <>
              <div
                className={`mt-4 rounded-2xl p-5 ${result.remainingHours >= 0 ? "bg-slate-950 text-white" : "bg-rose-900 text-white"}`}
              >
                <p className="text-sm font-bold opacity-80">
                  新規案件を検討する前の読み方
                </p>
                <p className="mt-2 text-lg font-black leading-8">
                  {result.remainingHours >= 0
                    ? `既存案件後の余力は${number(result.remainingHours)}時間です。新規案件の必要時間と納期をこの範囲に収められるか確認してください。`
                    : `既存案件だけで${number(Math.abs(result.remainingHours))}時間超過する計画です。追加受注前に予定時間か稼働条件を見直してください。`}
                </p>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <ResultCard
                  term="案件に使える時間"
                  value={`${number(result.capacityHours)}時間`}
                  note={`平日${result.weekdays}日−休日${inputs.holidayWeekdays}日、非請求時間を除外`}
                />
                <ResultCard
                  term="既存案件の予定"
                  value={`${number(result.plannedHours)}時間`}
                  note={`稼働率 ${number(result.utilizationRate)}%`}
                />
                <ResultCard
                  term="残り時間"
                  value={`${number(result.remainingHours)}時間`}
                  note={
                    result.remainingHours >= 0
                      ? "新規案件と予備時間の候補"
                      : "計画を超過"
                  }
                />
                <ResultCard
                  term="売上見込み"
                  value={yen(result.expectedSales)}
                  note={`目標差 ${result.salesGap >= 0 ? "+" : ""}${yen(result.salesGap)}`}
                />
              </dl>
              <section className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <h3 className="font-black text-amber-950">
                  受注前に確認すること
                </h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-amber-950">
                  <li>
                    修正対応、連絡待ち、急な休みのための予備時間は残り時間から別に確保してください。
                  </li>
                  <li>
                    この計算は受注、収入、納期達成を保証せず、長時間労働を勧めるものではありません。
                  </li>
                  <li>
                    契約範囲、納期、入金時期、体調と生活時間を確認して最終判断してください。
                  </li>
                </ul>
              </section>
              <PremiumInterestCards
                toolId="freelance-capacity-planner"
                placement="result_after"
                candidates={PREMIUM_CANDIDATES}
              />
            </>
          )}
        </section>
      </section>
    </main>
  );
}

function NumberField({
  label,
  unit,
  value,
  onChange,
}: {
  label: string;
  unit: string;
  value: number;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-bold text-slate-700">
      {label}
      <span className="ml-1 font-normal text-slate-500">（{unit}）</span>
      <input
        type="number"
        min={0}
        step="any"
        inputMode="decimal"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
      />
    </label>
  );
}
function ResultCard({
  term,
  value,
  note,
}: {
  term: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <dt className="text-sm font-bold text-slate-600">{term}</dt>
      <dd className="mt-1 text-xl font-black text-slate-950 sm:text-2xl">
        {value}
      </dd>
      <dd className="mt-1 text-xs leading-5 text-slate-500">{note}</dd>
    </div>
  );
}
