"use client";

import { PremiumInterestCards } from "@sakupla/shared-ui/PremiumInterestCards";
import { useState, type FormEvent } from "react";
import {
  calculateLaborPlan,
  type LaborPlanResult,
  type LaborSlot,
  type LaborTargets,
} from "./utils";

const SAMPLE_SLOTS: LaborSlot[] = [
  {
    id: "lunch",
    label: "ランチ 11〜14時",
    expectedSales: 60000,
    people: 4,
    hoursPerPerson: 3,
    hourlyWage: 1200,
    ancillaryRate: 15,
  },
  {
    id: "cafe",
    label: "カフェ 14〜17時",
    expectedSales: 24000,
    people: 2,
    hoursPerPerson: 3,
    hourlyWage: 1200,
    ancillaryRate: 15,
  },
  {
    id: "dinner",
    label: "ディナー 17〜21時",
    expectedSales: 80000,
    people: 4,
    hoursPerPerson: 4,
    hourlyWage: 1300,
    ancillaryRate: 15,
  },
];
const SAMPLE_TARGETS: LaborTargets = {
  laborSalesPerHour: 5000,
  laborCostRatio: 30,
};
const PREMIUM_CANDIDATES = [
  {
    featureId: "shift_template_save" as const,
    name: "シフト条件の保存",
    description:
      "よく使う時間帯や目標値をこの端末に保存し、翌週の比較で呼び出せる候補です。",
  },
  {
    featureId: "multi_store_labor_compare" as const,
    name: "複数店舗の比較",
    description:
      "店舗ごとの計画を並べ、人時売上と人件費率の違いを一覧で確認できる候補です。",
  },
];
const inputClass =
  "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

function yen(value: number) {
  return `${Math.round(value).toLocaleString("ja-JP")}円`;
}
function percent(value: number) {
  return `${value.toLocaleString("ja-JP", { maximumFractionDigits: 1 })}%`;
}

export function LaborSalesPlannerPage() {
  const [slots, setSlots] = useState<LaborSlot[]>(SAMPLE_SLOTS);
  const [targets, setTargets] = useState<LaborTargets>(SAMPLE_TARGETS);
  const [result, setResult] = useState<LaborPlanResult | null>(null);
  const [error, setError] = useState("");

  const resetResult = () => {
    setResult(null);
    setError("");
  };
  const updateSlot = (
    id: string,
    key: keyof Omit<LaborSlot, "id">,
    value: string,
  ) => {
    setSlots((current) =>
      current.map((slot) =>
        slot.id === id
          ? {
              ...slot,
              [key]: key === "label" ? value : Math.max(0, Number(value) || 0),
            }
          : slot,
      ),
    );
    resetResult();
  };
  const addSlot = () => {
    const id = `slot-${Date.now()}`;
    setSlots((current) => [
      ...current,
      {
        id,
        label: `時間帯 ${current.length + 1}`,
        expectedSales: 30000,
        people: 2,
        hoursPerPerson: 3,
        hourlyWage: 1200,
        ancillaryRate: 15,
      },
    ]);
    resetResult();
  };
  const removeSlot = (id: string) => {
    setSlots((current) => current.filter((slot) => slot.id !== id));
    resetResult();
  };
  const loadSample = () => {
    setSlots(SAMPLE_SLOTS);
    setTargets(SAMPLE_TARGETS);
    resetResult();
  };
  const run = (event: FormEvent) => {
    event.preventDefault();
    const invalid = slots.find(
      (slot) =>
        !slot.label.trim() ||
        slot.expectedSales <= 0 ||
        slot.people <= 0 ||
        slot.hoursPerPerson <= 0 ||
        slot.hourlyWage <= 0,
    );
    if (invalid) {
      setError(
        "各時間帯の名称、予想売上、人数、勤務時間、時給は0より大きい値で入力してください。",
      );
      return;
    }
    if (targets.laborSalesPerHour <= 0 || targets.laborCostRatio <= 0) {
      setError("比較する目標値は0より大きい値で入力してください。");
      return;
    }
    setError("");
    setResult(calculateLaborPlan(slots, targets));
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
          店舗のシフト計画
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          人時売上・シフト採算シミュレーター
        </h1>
        <p className="mt-4 max-w-4xl leading-7 text-slate-600">
          時間帯ごとの予想売上と予定シフトから、1人が1時間働く間の売上である「人時売上」と、売上に占める人件費の割合を試算します。入力内容は外部へ送らず、ブラウザ内だけで計算します。
        </p>

        <section
          aria-label="入力・算出・判断"
          className="mt-6 grid gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 sm:grid-cols-3 sm:p-5"
        >
          <div>
            <h2 className="font-black text-slate-950">1. 入力するもの</h2>
            <p className="mt-1 text-sm leading-6 text-slate-700">
              予想売上、人数、1人の勤務時間、時給、付随人件費率
            </p>
          </div>
          <div>
            <h2 className="font-black text-slate-950">2. 算出されるもの</h2>
            <p className="mt-1 text-sm leading-6 text-slate-700">
              人時売上、総人件費、人件費率と目標との差
            </p>
          </div>
          <div>
            <h2 className="font-black text-slate-950">3. 判断できること</h2>
            <p className="mt-1 text-sm leading-6 text-slate-700">
              どの時間帯の前提を優先して見直すかを比較
            </p>
          </div>
        </section>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          例：ランチの予想売上6万円、4人が各3時間、時給1,200円なら、人時売上は5,000円です。付随人件費率15%も含めると人件費率は27.6%になります。
        </p>

        <form onSubmit={run} noValidate className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-black text-slate-950">
              時間帯別の計画
            </h2>
            <button
              type="button"
              onClick={loadSample}
              data-analytics-event="sample_load"
              data-analytics-tool-id="labor-sales-planner"
              className="min-h-11 rounded-full border border-blue-300 px-4 py-2 text-sm font-bold text-blue-700 hover:border-blue-500"
            >
              飲食店サンプルに戻す
            </button>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            付随人件費率は、会社負担の社会保険料や交通費などを時給分へ上乗せして概算するための割合です。実際の費用に合わせて調整してください。
          </p>

          <div className="mt-5 grid gap-4">
            {slots.map((slot, index) => (
              <fieldset
                key={slot.id}
                className="min-w-0 rounded-2xl border border-slate-200 p-4"
              >
                <legend className="px-2 font-black text-slate-800">
                  時間帯 {index + 1}
                </legend>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
                  <TextField
                    label="名称"
                    value={slot.label}
                    onChange={(value) => updateSlot(slot.id, "label", value)}
                  />
                  <NumberField
                    label="予想売上"
                    unit="円"
                    value={slot.expectedSales}
                    onChange={(value) =>
                      updateSlot(slot.id, "expectedSales", value)
                    }
                  />
                  <NumberField
                    label="人数"
                    unit="人"
                    value={slot.people}
                    onChange={(value) => updateSlot(slot.id, "people", value)}
                  />
                  <NumberField
                    label="1人の勤務"
                    unit="時間"
                    value={slot.hoursPerPerson}
                    onChange={(value) =>
                      updateSlot(slot.id, "hoursPerPerson", value)
                    }
                  />
                  <NumberField
                    label="時給"
                    unit="円"
                    value={slot.hourlyWage}
                    onChange={(value) =>
                      updateSlot(slot.id, "hourlyWage", value)
                    }
                  />
                  <NumberField
                    label="付随人件費率"
                    unit="%"
                    value={slot.ancillaryRate}
                    onChange={(value) =>
                      updateSlot(slot.id, "ancillaryRate", value)
                    }
                  />
                </div>
                {slots.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => removeSlot(slot.id)}
                    className="mt-3 min-h-11 rounded-full px-3 text-sm font-bold text-rose-700 hover:bg-rose-50"
                  >
                    この時間帯を削除
                  </button>
                ) : null}
              </fieldset>
            ))}
          </div>
          <button
            type="button"
            onClick={addSlot}
            className="mt-4 min-h-11 rounded-full border border-slate-300 px-4 text-sm font-bold text-slate-700 hover:border-slate-500"
          >
            時間帯を追加
          </button>

          <fieldset className="mt-6 rounded-2xl bg-slate-50 p-4">
            <legend className="px-2 font-black text-slate-800">
              比較する自社目標
            </legend>
            <p className="mb-3 text-sm leading-6 text-slate-600">
              業種共通の正解値ではありません。自社で決めた目標を入力してください。
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberField
                label="目標人時売上"
                unit="円／人時"
                value={targets.laborSalesPerHour}
                onChange={(value) => {
                  setTargets((current) => ({
                    ...current,
                    laborSalesPerHour: Math.max(0, Number(value) || 0),
                  }));
                  resetResult();
                }}
              />
              <NumberField
                label="目標人件費率"
                unit="%"
                value={targets.laborCostRatio}
                onChange={(value) => {
                  setTargets((current) => ({
                    ...current,
                    laborCostRatio: Math.max(0, Number(value) || 0),
                  }));
                  resetResult();
                }}
              />
            </div>
          </fieldset>
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
            data-analytics-tool-id="labor-sales-planner"
            className="mt-6 w-full rounded-full bg-blue-600 px-5 py-4 font-black text-white hover:bg-blue-700"
          >
            シフト採算を計算する
          </button>
        </form>

        <section aria-live="polite" aria-label="計算結果" className="mt-10">
          <h2 className="text-xl font-black text-slate-950">計算結果</h2>
          {!result ? (
            <div className="mt-4 rounded-2xl bg-slate-50 p-7 text-center text-slate-500">
              時間帯と目標を確認して計算してください。
            </div>
          ) : (
            <>
              <dl className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <ResultCard
                  term="予想売上 合計"
                  value={yen(result.totalSales)}
                />
                <ResultCard
                  term="勤務時間 合計"
                  value={`${result.totalStaffHours.toLocaleString("ja-JP", { maximumFractionDigits: 1 })}人時`}
                />
                <ResultCard
                  term="全体の人時売上"
                  value={`${yen(result.laborSalesPerHour)}／人時`}
                />
                <ResultCard
                  term="全体の人件費率"
                  value={percent(result.laborCostRatio)}
                />
              </dl>
              <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
                <table className="min-w-[820px] w-full text-left text-sm">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="p-3">時間帯</th>
                      <th className="p-3">人時売上</th>
                      <th className="p-3">目標との差</th>
                      <th className="p-3">総人件費</th>
                      <th className="p-3">人件費率</th>
                      <th className="p-3">判断の目安</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.slots.map((slot) => (
                      <tr key={slot.id} className="border-t border-slate-200">
                        <th className="p-3 font-black text-slate-900">
                          {slot.label}
                          <span className="block text-xs font-normal text-slate-500">
                            {slot.staffHours.toLocaleString("ja-JP", {
                              maximumFractionDigits: 1,
                            })}
                            人時
                          </span>
                        </th>
                        <td className="p-3">{yen(slot.laborSalesPerHour)}</td>
                        <td className="p-3">
                          {slot.laborSalesGap >= 0 ? "+" : ""}
                          {yen(slot.laborSalesGap)}
                        </td>
                        <td className="p-3">{yen(slot.laborCost)}</td>
                        <td className="p-3">
                          {percent(slot.laborCostRatio)}
                          <span className="block text-xs text-slate-500">
                            目標差 {slot.laborCostRatioGap >= 0 ? "+" : ""}
                            {percent(slot.laborCostRatioGap)}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-slate-800">
                          {slot.laborSalesGap >= 0
                            ? "人時売上は目標以上"
                            : "人時売上は目標未満"}
                          <span className="block">
                            {slot.laborCostRatioGap <= 0
                              ? "人件費率は目標以内"
                              : "人件費率は目標超過"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <section className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <h3 className="font-black text-amber-950">
                  結果の使い方と注意
                </h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-amber-950">
                  <li>
                    目標との差が大きい時間帯は、売上予測・作業量・配置人数の前提から確認します。
                  </li>
                  <li>
                    この試算だけで人員削減を決めず、必要業務、接客品質、休憩、最低賃金や労務ルールを確認してください。
                  </li>
                  <li>
                    最適な人数や売上を保証するものではありません。実績と比較し、少しずつ計画を調整してください。
                  </li>
                </ul>
              </section>
              <PremiumInterestCards
                toolId="labor-sales-planner"
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

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-bold text-slate-700">
      {label}
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
      />
    </label>
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
function ResultCard({ term, value }: { term: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <dt className="text-sm font-bold text-slate-600">{term}</dt>
      <dd className="mt-1 text-xl font-black text-slate-950 sm:text-2xl">
        {value}
      </dd>
    </div>
  );
}
