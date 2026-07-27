"use client";

import { PremiumInterestCards } from "@sakupla/shared-ui/PremiumInterestCards";
import { useState, type FormEvent } from "react";
import {
  compareShippingThresholds,
  type ShippingInputs,
  type ShippingScenario,
  type ShippingScenarioResult,
} from "./utils";

const SAMPLE_SCENARIOS: ShippingScenario[] = [
  { id: "a", threshold: 4000, expectedAddition: 1000 },
  { id: "b", threshold: 5000, expectedAddition: 2000 },
  { id: "c", threshold: 6000, expectedAddition: 3000 },
];

const SAMPLE_INPUTS: ShippingInputs = {
  averageOrderAmount: 3000,
  grossMarginRate: 40,
  shippingCost: 700,
  paymentFeeRate: 3.6,
  scenarios: SAMPLE_SCENARIOS,
};

const PREMIUM_CANDIDATES = [
  {
    featureId: "shipping_scenario_save" as const,
    name: "送料無料条件の保存",
    description:
      "粗利率、送料、候補ラインを保存し、キャンペーンごとに同じ条件から比較を再開できる候補です。",
  },
  {
    featureId: "multi_region_shipping" as const,
    name: "地域・温度帯別の送料比較",
    description:
      "地域や常温・冷蔵などで異なる送料を登録し、条件別の送料無料ラインをまとめて比較できる候補です。",
  },
];

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

const yen = (value: number) => `${Math.round(value).toLocaleString("ja-JP")}円`;

export function FreeShippingThresholdCalculatorPage() {
  const [inputs, setInputs] = useState<ShippingInputs>(SAMPLE_INPUTS);
  const [results, setResults] = useState<ShippingScenarioResult[] | null>(null);
  const [error, setError] = useState("");

  const updateBase = (
    key: Exclude<keyof ShippingInputs, "scenarios">,
    value: string,
  ) => {
    setInputs((current) => ({
      ...current,
      [key]: Math.max(0, Number(value) || 0),
    }));
    setResults(null);
    setError("");
  };

  const updateScenario = (
    index: number,
    key: "threshold" | "expectedAddition",
    value: string,
  ) => {
    setInputs((current) => ({
      ...current,
      scenarios: current.scenarios.map((scenario, scenarioIndex) =>
        scenarioIndex === index
          ? { ...scenario, [key]: Math.max(0, Number(value) || 0) }
          : scenario,
      ),
    }));
    setResults(null);
    setError("");
  };

  const run = (event: FormEvent) => {
    event.preventDefault();
    if (inputs.averageOrderAmount <= 0)
      return setError("平均注文額は0円より大きい金額を入力してください。");
    if (inputs.grossMarginRate <= 0 || inputs.grossMarginRate > 100)
      return setError("粗利率は0%より大きく100%以下で入力してください。");
    if (inputs.paymentFeeRate > 100)
      return setError("決済費率は100%以下で入力してください。");
    if (inputs.scenarios.some((scenario) => scenario.threshold <= 0))
      return setError("候補ラインは0円より大きい金額を入力してください。");
    setError("");
    setResults(compareShippingThresholds(inputs));
  };

  const loadSample = () => {
    setInputs(SAMPLE_INPUTS);
    setResults(null);
    setError("");
  };

  const currentProfit =
    inputs.averageOrderAmount * (inputs.grossMarginRate / 100) -
    inputs.averageOrderAmount * (inputs.paymentFeeRate / 100);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <p className="text-xs font-black uppercase tracking-[.2em] text-blue-600">
          ECの利益設計
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          送料無料ライン・利益シミュレーター
        </h1>
        <p className="mt-4 max-w-3xl leading-7 text-slate-600">
          平均注文3,000円、送料700円のような条件から、最大3つの送料無料ラインを注文当たり利益で比較します。注文情報は使わず、入力と結果はブラウザ内だけで処理します。
        </p>

        <section
          aria-label="かんたん操作手順"
          className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4 sm:p-5"
        >
          <h2 className="font-black text-slate-950">3ステップで比較</h2>
          <ol className="mt-3 grid gap-3 text-sm leading-6 text-slate-700 sm:grid-cols-3">
            <li>
              <strong>1. 現在の注文</strong>
              <br />
              注文額・粗利率・送料・決済費率を入力
            </li>
            <li>
              <strong>2. 候補を設定</strong>
              <br />
              送料無料ラインと見込む追加購入額を入力
            </li>
            <li>
              <strong>3. 利益差を確認</strong>
              <br />
              未達額と注文当たり利益を比べる
            </li>
          </ol>
        </section>

        <form onSubmit={run} className="mt-8 min-w-0" noValidate>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-950">
                現在の注文条件
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                粗利率は、売上から商品原価を引いた割合です。決済費率は注文額に対するカード・決済手数料の割合です。
              </p>
            </div>
            <button
              type="button"
              onClick={loadSample}
              data-analytics-event="sample_load"
              data-analytics-tool-id="free-shipping-threshold-calculator"
              className="min-h-11 rounded-full border border-blue-300 px-4 py-2 text-sm font-bold text-blue-700"
            >
              サンプル値に戻す
            </button>
          </div>
          <div className="mt-5 grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <NumberField
              label="平均注文額"
              unit="円／注文"
              value={inputs.averageOrderAmount}
              onChange={(value) => updateBase("averageOrderAmount", value)}
            />
            <NumberField
              label="粗利率"
              unit="%"
              value={inputs.grossMarginRate}
              onChange={(value) => updateBase("grossMarginRate", value)}
            />
            <NumberField
              label="平均送料"
              unit="円／配送"
              value={inputs.shippingCost}
              onChange={(value) => updateBase("shippingCost", value)}
            />
            <NumberField
              label="決済費率"
              unit="注文額の%"
              value={inputs.paymentFeeRate}
              onChange={(value) => updateBase("paymentFeeRate", value)}
            />
          </div>

          <section className="mt-8">
            <h2 className="text-xl font-black text-slate-950">
              送料無料の候補
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              追加購入額は、送料無料をきっかけに平均注文へ上乗せされると仮定する金額です。確実に増える金額ではありません。
            </p>
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              {inputs.scenarios.map((scenario, index) => (
                <fieldset
                  key={scenario.id}
                  className="min-w-0 rounded-2xl border border-slate-200 p-4"
                >
                  <legend className="px-1 font-black text-slate-800">
                    候補{index + 1}
                  </legend>
                  <NumberField
                    label="送料無料ライン"
                    unit="円"
                    value={scenario.threshold}
                    onChange={(value) =>
                      updateScenario(index, "threshold", value)
                    }
                  />
                  <div className="mt-4">
                    <NumberField
                      label="見込む追加購入額"
                      unit="円／注文"
                      value={scenario.expectedAddition}
                      onChange={(value) =>
                        updateScenario(index, "expectedAddition", value)
                      }
                    />
                  </div>
                </fieldset>
              ))}
            </div>
          </section>

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
            data-analytics-tool-id="free-shipping-threshold-calculator"
            className="mt-6 w-full rounded-full bg-blue-600 px-5 py-4 font-black text-white hover:bg-blue-700"
          >
            送料無料ラインを比較する
          </button>
        </form>

        <section
          aria-live="polite"
          aria-label="比較結果"
          className="mt-10 min-w-0 border-t border-slate-200 pt-8"
        >
          <h2 className="text-xl font-black text-slate-950">比較結果</h2>
          {!results ? (
            <p className="mt-4 rounded-2xl bg-slate-50 p-6 text-center text-slate-500">
              条件を確認して「送料無料ラインを比較する」を押してください。
            </p>
          ) : (
            <>
              <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="p-4">条件</th>
                      <th className="p-4">注文額の想定</th>
                      <th className="p-4">到達状況</th>
                      <th className="p-4">注文当たり利益</th>
                      <th className="p-4">現在との差</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-slate-200">
                      <th className="p-4">現在（送料を別途受領）</th>
                      <td className="p-4">{yen(inputs.averageOrderAmount)}</td>
                      <td className="p-4">基準</td>
                      <td className="p-4 font-black">{yen(currentProfit)}</td>
                      <td className="p-4">基準</td>
                    </tr>
                    {results.map((result, index) => (
                      <tr key={result.id} className="border-t border-slate-200">
                        <th className="p-4">
                          候補{index + 1}：{yen(result.threshold)}以上
                        </th>
                        <td className="p-4">
                          {yen(result.projectedOrderAmount)}
                        </td>
                        <td className="p-4 font-bold">
                          {result.qualifies
                            ? "ライン到達"
                            : `あと${yen(result.shortfall)}`}
                        </td>
                        <td className="p-4 font-black">
                          {result.qualifies
                            ? yen(result.profitPerOrder)
                            : "未達のため算出対象外"}
                        </td>
                        <td className="p-4">
                          {result.qualifies
                            ? `${result.profitDifference >= 0 ? "+" : ""}${yen(result.profitDifference)}`
                            : "未達のため算出対象外"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                表は色だけで判定せず、「ライン到達／あと○円」と利益差の数値で確認できます。未達の候補は、入力した追加購入額では送料無料条件に届かないため、送料無料適用後の利益と差額を算出対象外とします。
              </p>
              <details className="mt-4 rounded-2xl border border-slate-200 p-4">
                <summary
                  data-analytics-event="select_content"
                  data-analytics-content-type="calculation_formula"
                  data-analytics-item-id="free-shipping-threshold-calculator"
                  className="cursor-pointer font-black"
                >
                  計算の前提を見る
                </summary>
                <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                  <p>
                    現在利益＝平均注文額×粗利率−平均注文額×決済費率。現在は購入者から送料実費相当を受け取り、送料収支は差し引き0と仮定します。
                  </p>
                  <p>
                    送料無料時利益＝（平均注文額＋追加購入額）×粗利率−決済費−店舗負担送料。税、返品、遠隔地追加料金、複数配送、商品別粗利は含みません。
                  </p>
                </div>
              </details>
              <aside className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
                <strong className="block">結果の読み方と次の確認</strong>
                利益差は1注文当たりの試算です。送料無料にしても購入率や売上が必ず伸びるとは限りません。実施前後の注文数、客単価、地域別送料、返品率を記録して検証してください。
              </aside>
              <PremiumInterestCards
                toolId="free-shipping-threshold-calculator"
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
    <label className="block min-w-0 text-sm font-bold text-slate-700">
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
