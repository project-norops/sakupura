"use client";

import { PremiumInterestCards } from "@sakupla/shared-ui/PremiumInterestCards";
import { useState, type FormEvent } from "react";
import {
  compareReturnScenarios,
  createReturnResultsCsv,
  type ReturnCostInputs,
  type ReturnScenario,
  type ReturnScenarioResult,
} from "./utils";

const SAMPLE_INPUTS: ReturnCostInputs = {
  orderCount: 100,
  averageOrderAmount: 4500,
  productCostPerOrder: 1600,
  outboundShippingPerOrder: 500,
  paymentFeeRate: 3.6,
  returnShippingPerReturn: 700,
  inspectionCostPerReturn: 300,
};

const SAMPLE_SCENARIOS: ReturnScenario[] = [
  { id: "current", name: "現在", returnRate: 8, resalableRate: 50 },
  { id: "improve-a", name: "改善案A", returnRate: 6, resalableRate: 70 },
  { id: "improve-b", name: "改善案B", returnRate: 4, resalableRate: 80 },
];

const PREMIUM_CANDIDATES = [
  {
    featureId: "return_scenario_save" as const,
    name: "返品条件の保存",
    description:
      "商品カテゴリごとの返品率、返送料、再販条件を保存し、翌月も同じ条件から比較を再開できる候補です。",
  },
  {
    featureId: "multi_product_return_compare" as const,
    name: "複数商品の返品比較",
    description:
      "商品別の返品率と利益影響をまとめ、改善対象を優先順位付けできる候補です。",
  },
];

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100";
const yen = (value: number) => `${Math.round(value).toLocaleString("ja-JP")}円`;
const count = (value: number) => `${value.toFixed(1)}件`;

export function ReturnCostCalculatorPage() {
  const [inputs, setInputs] = useState<ReturnCostInputs>(SAMPLE_INPUTS);
  const [scenarios, setScenarios] =
    useState<ReturnScenario[]>(SAMPLE_SCENARIOS);
  const [results, setResults] = useState<ReturnScenarioResult[] | null>(null);
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  const clearResult = () => {
    setResults(null);
    setError("");
    setSaveMessage("");
  };

  const updateInput = (key: keyof ReturnCostInputs, value: string) => {
    setInputs((current) => ({
      ...current,
      [key]: Math.max(0, Number(value) || 0),
    }));
    clearResult();
  };

  const updateScenario = (
    index: number,
    key: "name" | "returnRate" | "resalableRate",
    value: string,
  ) => {
    setScenarios((current) =>
      current.map((scenario, scenarioIndex) =>
        scenarioIndex === index
          ? {
              ...scenario,
              [key]: key === "name" ? value : Math.max(0, Number(value) || 0),
            }
          : scenario,
      ),
    );
    clearResult();
  };

  const run = (event: FormEvent) => {
    event.preventDefault();
    if (inputs.orderCount <= 0)
      return setError("注文数は0件より大きい件数を入力してください。");
    if (inputs.averageOrderAmount <= 0)
      return setError("平均注文額は0円より大きい金額を入力してください。");
    if (inputs.productCostPerOrder > inputs.averageOrderAmount)
      return setError(
        "商品原価が平均注文額を超えています。入力単位を確認してください。",
      );
    if (inputs.paymentFeeRate > 100)
      return setError("決済費率は100%以下で入力してください。");
    if (
      scenarios.some(
        (scenario) =>
          !scenario.name.trim() ||
          scenario.returnRate > 100 ||
          scenario.resalableRate > 100,
      )
    )
      return setError(
        "シナリオ名を入力し、返品率と再販可能率を0〜100%で指定してください。",
      );
    setError("");
    setSaveMessage("");
    setResults(compareReturnScenarios(inputs, scenarios));
  };

  const loadSample = () => {
    setInputs(SAMPLE_INPUTS);
    setScenarios(SAMPLE_SCENARIOS);
    clearResult();
  };

  const saveCsv = () => {
    if (!results) return;
    const blob = new Blob([`\uFEFF${createReturnResultsCsv(results)}`], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "return-cost-scenarios.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    setSaveMessage("比較結果CSVを保存しました。");
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <p className="text-xs font-black uppercase tracking-[.2em] text-blue-600">
          ECの販売後コスト
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          返品・交換コスト試算
        </h1>
        <p className="mt-4 max-w-3xl leading-7 text-slate-600">
          100件販売して返品率が8%だった場合のように、返金、返送料、検品、再販できない商品の影響をまとめて試算します。注文情報や顧客情報は使わず、入力と結果はブラウザ内だけで処理します。
        </p>

        <section
          aria-label="かんたん操作手順"
          className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4 sm:p-5"
        >
          <h2 className="font-black text-slate-950">
            返品率の変化で、利益がどれだけ残るかを比較します
          </h2>
          <ol className="mt-3 grid gap-3 text-sm leading-6 text-slate-700 sm:grid-cols-3">
            <li className="rounded-xl bg-white p-4">
              <strong className="text-blue-700">1. 販売条件</strong>
              <br />
              注文数、平均注文額、商品原価、発送費、決済費率を入力します。
            </li>
            <li className="rounded-xl bg-white p-4">
              <strong className="text-blue-700">2. 返品条件</strong>
              <br />
              返品率、返送料、検品費、再販できる割合を最大3案で設定します。
            </li>
            <li className="rounded-xl bg-white p-4">
              <strong className="text-blue-700">3. 利益への影響</strong>
              <br />
              返品後利益、利益減少、返品1件当たりの影響を比較します。
            </li>
          </ol>
          <p className="mt-3 text-sm font-bold leading-6 text-slate-800">
            返品の可否や返品特約の適法性を判定するツールではありません。返品条件は販売先の最新規約と消費者庁の案内を確認してください。
          </p>
        </section>

        <form onSubmit={run} className="mt-8 min-w-0" noValidate>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-950">販売条件</h2>
              <p className="mt-1 text-sm text-slate-500">
                1か月や1キャンペーンなど、同じ集計期間の平均値を入力します。
              </p>
            </div>
            <button
              type="button"
              onClick={loadSample}
              data-analytics-event="sample_load"
              data-analytics-tool-id="return-cost-calculator"
              className="min-h-11 rounded-full border border-blue-300 px-4 py-2 text-sm font-bold text-blue-700"
            >
              サンプル値に戻す
            </button>
          </div>
          <div className="mt-5 grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <NumberField
              label="注文数"
              unit="件"
              value={inputs.orderCount}
              onChange={(value) => updateInput("orderCount", value)}
            />
            <NumberField
              label="平均注文額"
              unit="円／注文"
              value={inputs.averageOrderAmount}
              onChange={(value) => updateInput("averageOrderAmount", value)}
            />
            <NumberField
              label="商品原価"
              unit="円／注文"
              value={inputs.productCostPerOrder}
              onChange={(value) => updateInput("productCostPerOrder", value)}
            />
            <NumberField
              label="初回発送費"
              unit="円／注文"
              value={inputs.outboundShippingPerOrder}
              onChange={(value) =>
                updateInput("outboundShippingPerOrder", value)
              }
            />
            <NumberField
              label="決済費率"
              unit="売上の%"
              value={inputs.paymentFeeRate}
              onChange={(value) => updateInput("paymentFeeRate", value)}
            />
            <NumberField
              label="返品時の返送料"
              unit="円／返品"
              value={inputs.returnShippingPerReturn}
              onChange={(value) =>
                updateInput("returnShippingPerReturn", value)
              }
            />
            <NumberField
              label="検品・再梱包費"
              unit="円／返品"
              value={inputs.inspectionCostPerReturn}
              onChange={(value) =>
                updateInput("inspectionCostPerReturn", value)
              }
            />
          </div>

          <section className="mt-8">
            <h2 className="text-xl font-black text-slate-950">
              比較する返品シナリオ
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              再販可能率は、返品された商品のうち通常在庫へ戻せる割合です。再販できる商品の原価は回収できるものとして計算します。
            </p>
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              {scenarios.map((scenario, index) => (
                <fieldset
                  key={scenario.id}
                  className="min-w-0 rounded-2xl border border-slate-200 p-4"
                >
                  <legend className="px-1 font-black text-slate-800">
                    シナリオ{index + 1}
                  </legend>
                  <label className="block text-sm font-bold text-slate-700">
                    シナリオ名
                    <input
                      type="text"
                      value={scenario.name}
                      onChange={(event) =>
                        updateScenario(index, "name", event.target.value)
                      }
                      className={inputClass}
                    />
                  </label>
                  <div className="mt-4">
                    <NumberField
                      label="返品率"
                      unit="注文の%"
                      value={scenario.returnRate}
                      onChange={(value) =>
                        updateScenario(index, "returnRate", value)
                      }
                    />
                  </div>
                  <div className="mt-4">
                    <NumberField
                      label="再販可能率"
                      unit="返品の%"
                      value={scenario.resalableRate}
                      onChange={(value) =>
                        updateScenario(index, "resalableRate", value)
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
            data-analytics-tool-id="return-cost-calculator"
            className="mt-6 w-full rounded-full bg-blue-600 px-5 py-4 font-black text-white hover:bg-blue-700"
          >
            返品後の利益を比較する
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
              条件を確認して「返品後の利益を比較する」を押してください。
            </p>
          ) : (
            <>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {results.map((result, index) => (
                  <article
                    key={result.id}
                    className={`rounded-2xl border p-5 ${index === 0 ? "border-slate-200" : "border-blue-200 bg-blue-50"}`}
                  >
                    <p className="text-sm font-bold text-slate-600">
                      {result.name}
                    </p>
                    <p className="mt-2 text-2xl font-black text-slate-950">
                      {yen(result.profitAfterReturns)}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      返品後利益・売上利益率{" "}
                      {result.profitMarginRate.toFixed(1)}%
                    </p>
                  </article>
                ))}
              </div>
              <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="p-4">条件</th>
                      <th className="p-4">返品件数</th>
                      <th className="p-4">返金額</th>
                      <th className="p-4">返品対応費</th>
                      <th className="p-4">返品後利益</th>
                      <th className="p-4">利益減少</th>
                      <th className="p-4">返品1件の影響</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result) => (
                      <tr key={result.id} className="border-t border-slate-200">
                        <th className="p-4">
                          {result.name}
                          <span className="mt-1 block font-normal text-slate-500">
                            返品{result.returnRate}%・再販{result.resalableRate}
                            %
                          </span>
                        </th>
                        <td className="p-4">{count(result.returnedOrders)}</td>
                        <td className="p-4">{yen(result.refundedAmount)}</td>
                        <td className="p-4">
                          {yen(result.returnHandlingCost)}
                        </td>
                        <td className="p-4 font-black">
                          {yen(result.profitAfterReturns)}
                        </td>
                        <td className="p-4">{yen(result.lossFromReturns)}</td>
                        <td className="p-4 font-bold">
                          {yen(result.costPerReturn)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={saveCsv}
                  data-analytics-event="result_download"
                  data-analytics-tool-id="return-cost-calculator"
                  className="min-h-11 rounded-full border border-blue-300 px-5 py-2.5 text-sm font-bold text-blue-700"
                >
                  比較結果CSVを保存
                </button>
                {saveMessage ? (
                  <p
                    role="status"
                    className="text-sm font-bold text-emerald-700"
                  >
                    {saveMessage}
                  </p>
                ) : null}
              </div>
              <details className="mt-4 rounded-2xl border border-slate-200 p-4">
                <summary
                  data-analytics-event="select_content"
                  data-analytics-content-type="calculation_formula"
                  data-analytics-item-id="return-cost-calculator"
                  className="cursor-pointer font-black"
                >
                  計算の前提を見る
                </summary>
                <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                  <p>
                    返品後利益＝返品されなかった売上−回収できなかった商品原価−全注文の初回発送費−全注文の決済費−返送料・検品費です。
                  </p>
                  <p>
                    決済費は返金後も戻らない前提です。利用中の決済・販売サービスで返金時の手数料が戻る場合は、決済費率を調整してください。交換品の再発送、値引き返金、税、チャージバックは含みません。
                  </p>
                </div>
              </details>
              <aside className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
                <strong className="block">結果の読み方と次の確認</strong>
                まず利益減少額が大きい要因を、返品率、返送料、再販可能率に分けて確認します。返品理由、商品別の返品率、検品後に再販できなかった理由を別途記録し、説明・サイズ表・梱包・検品工程など改善可能な箇所を小さく試してください。返品条件そのものを変更する場合は、購入前表示と最新法令を必ず確認してください。
              </aside>
              <PremiumInterestCards
                toolId="return-cost-calculator"
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
