"use client";

import { PremiumInterestCards } from "@sakupla/shared-ui/PremiumInterestCards";
import { useState, type FormEvent } from "react";
import {
  compareProductionScenarios,
  resultsToCsv,
  type ProfitInputs,
  type ProductionScenarioResult,
} from "./utils";

const SAMPLE_INPUTS: ProfitInputs = {
  sellingPrice: 1800,
  fixedCost: 5000,
  packagingCost: 120,
  salesFeeRate: 5,
  shippingCost: 250,
  defectReserveRate: 5,
  scenarios: [
    { id: "30", quantity: 30, manufacturingCost: 21000 },
    { id: "50", quantity: 50, manufacturingCost: 30000 },
    { id: "100", quantity: 100, manufacturingCost: 52000 },
  ],
};

const EMPTY_INPUTS: ProfitInputs = {
  sellingPrice: 0,
  fixedCost: 0,
  packagingCost: 0,
  salesFeeRate: 0,
  shippingCost: 0,
  defectReserveRate: 0,
  scenarios: [
    { id: "a", quantity: 0, manufacturingCost: 0 },
    { id: "b", quantity: 0, manufacturingCost: 0 },
  ],
};

const PREMIUM_CANDIDATES = [
  {
    featureId: "production_scenario_save" as const,
    name: "製造条件の保存",
    description:
      "販売価格、手数料、梱包費、製造見積りを保存し、再販や次の商品でも同じ条件から比較を再開できる候補です。",
  },
  {
    featureId: "multi_product_compare" as const,
    name: "複数商品のまとめ比較",
    description:
      "アクリルグッズ、冊子、セット商品など、複数商品の完売ラインと利益を同じ画面で比較できる候補です。",
  },
];

const fieldClass =
  "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100";
const yen = (value: number) => `${Math.round(value).toLocaleString("ja-JP")}円`;

export function MadeToOrderProfitCalculatorPage() {
  const [inputs, setInputs] = useState<ProfitInputs>(EMPTY_INPUTS);
  const [results, setResults] = useState<ProductionScenarioResult[] | null>(
    null,
  );
  const [error, setError] = useState("");

  const resetResult = () => {
    setResults(null);
    setError("");
  };

  const updateBase = (
    key: Exclude<keyof ProfitInputs, "scenarios">,
    value: string,
  ) => {
    setInputs((current) => ({
      ...current,
      [key]: Math.max(0, Number(value) || 0),
    }));
    resetResult();
  };

  const updateScenario = (
    index: number,
    key: "quantity" | "manufacturingCost",
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
    resetResult();
  };

  const addScenario = () => {
    if (inputs.scenarios.length >= 3) return;
    setInputs((current) => ({
      ...current,
      scenarios: [
        ...current.scenarios,
        {
          id: `${Date.now()}`,
          quantity: 0,
          manufacturingCost: 0,
        },
      ],
    }));
    resetResult();
  };

  const removeScenario = (index: number) => {
    if (inputs.scenarios.length <= 2) return;
    setInputs((current) => ({
      ...current,
      scenarios: current.scenarios.filter(
        (_, itemIndex) => itemIndex !== index,
      ),
    }));
    resetResult();
  };

  const loadSample = () => {
    setInputs(SAMPLE_INPUTS);
    setResults(null);
    setError("");
  };

  const clear = () => {
    setInputs(EMPTY_INPUTS);
    setResults(null);
    setError("");
  };

  const run = (event: FormEvent) => {
    event.preventDefault();
    if (inputs.sellingPrice <= 0)
      return setError("販売価格は0円より大きい金額を入力してください。");
    if (inputs.salesFeeRate >= 100)
      return setError("販売手数料率は100%未満で入力してください。");
    if (inputs.defectReserveRate >= 100)
      return setError("不良予備率は100%未満で入力してください。");
    if (
      inputs.scenarios.some(
        (scenario) =>
          !Number.isInteger(scenario.quantity) || scenario.quantity <= 0,
      )
    )
      return setError("各候補の製造数は1個以上の整数で入力してください。");
    if (inputs.scenarios.some((scenario) => scenario.manufacturingCost <= 0))
      return setError(
        "各候補の製造原価合計は0円より大きい金額を入力してください。",
      );
    if (
      new Set(inputs.scenarios.map((scenario) => scenario.quantity)).size !==
      inputs.scenarios.length
    )
      return setError(
        "比較しやすいよう、候補ごとに異なる製造数を入力してください。",
      );

    const calculated = compareProductionScenarios(inputs);
    if (calculated.some((result) => result.contributionPerOrder <= 0))
      return setError(
        "販売価格から手数料・梱包費・送料を引いた金額が0円以下です。価格または費用を見直してください。",
      );
    if (calculated.some((result) => result.sellableQuantity <= 0))
      return setError(
        "不良予備を除いた販売可能数が1個以上になる条件を入力してください。",
      );
    setError("");
    setResults(calculated);
  };

  const downloadCsv = () => {
    if (!results) return;
    const blob = new Blob(["\uFEFF", resultsToCsv(results)], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "goods-production-profit-comparison.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const bestResult = results?.reduce((best, current) =>
    current.selloutProfit > best.selloutProfit ? current : best,
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <p className="text-xs font-black uppercase tracking-[.2em] text-blue-600">
          グッズ販売の採算確認
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          グッズ受注生産・完売ライン計算
        </h1>
        <p className="mt-4 max-w-3xl leading-7 text-slate-600">
          アクリルグッズなどを30個・50個で作るとき、何件の注文で赤字を抜け、完売するといくら残るかを比較できます。製造見積りや販売条件は外部へ送信せず、ブラウザ内だけで計算します。
        </p>

        <section
          aria-label="かんたん操作手順"
          className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4 sm:p-5"
        >
          <h2 className="font-black text-slate-950">かんたん操作手順</h2>
          <ol className="mt-3 grid gap-3 text-sm leading-6 text-slate-700 sm:grid-cols-3">
            <li className="rounded-xl bg-white p-4">
              <strong className="text-blue-700">1. 販売条件を入力</strong>
              <br />
              販売価格、固定費、梱包費、手数料、送料、不良予備率を入力します。
            </li>
            <li className="rounded-xl bg-white p-4">
              <strong className="text-blue-700">2. ロットを比較</strong>
              <br />
              30個・50個など、製造数と見積りの製造原価合計を2〜3案入力します。
            </li>
            <li className="rounded-xl bg-white p-4">
              <strong className="text-blue-700">3. 発注前に確認</strong>
              <br />
              損益分岐注文数と完売時利益を見て、売り切る必要数と資金負担を確認します。
            </li>
          </ol>
          <p className="mt-3 text-sm font-bold leading-6 text-slate-800">
            この計算は1注文につき1個を発送する前提です。需要、完売、最適な製造数は予測・保証しません。
          </p>
        </section>

        <form onSubmit={run} className="mt-8 min-w-0" noValidate>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-950">販売条件</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                税や販売手数料は固定プリセットを使わず、利用する販売先の条件を入力してください。
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={loadSample}
                data-analytics-event="sample_load"
                data-analytics-tool-id="made-to-order-profit-calculator"
                className="min-h-11 rounded-full border border-blue-300 px-4 py-2 text-sm font-bold text-blue-700"
              >
                30個・50個のサンプル
              </button>
              <button
                type="button"
                onClick={clear}
                className="min-h-11 rounded-full border border-slate-300 px-4 py-2 text-sm font-bold text-slate-600"
              >
                入力をクリア
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <NumberField
              label="販売価格"
              unit="円／個"
              value={inputs.sellingPrice}
              onChange={(value) => updateBase("sellingPrice", value)}
            />
            <NumberField
              label="固定費"
              unit="円"
              value={inputs.fixedCost}
              onChange={(value) => updateBase("fixedCost", value)}
              help="デザイン外注、試作、撮影など、ロットにかかわらず発生する費用"
            />
            <NumberField
              label="梱包費"
              unit="円／注文"
              value={inputs.packagingCost}
              onChange={(value) => updateBase("packagingCost", value)}
            />
            <NumberField
              label="販売手数料率"
              unit="売上の%"
              value={inputs.salesFeeRate}
              onChange={(value) => updateBase("salesFeeRate", value)}
              help="決済・販売サービス等の合計率を入力"
            />
            <NumberField
              label="販売者が負担する送料"
              unit="円／注文"
              value={inputs.shippingCost}
              onChange={(value) => updateBase("shippingCost", value)}
              help="購入者が全額負担する場合は0円"
            />
            <NumberField
              label="不良予備率"
              unit="製造数の%"
              value={inputs.defectReserveRate}
              onChange={(value) => updateBase("defectReserveRate", value)}
              help="交換用や検品落ちとして販売しない分"
            />
          </div>

          <section className="mt-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-950">
                  製造ロットの候補
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  製造会社の見積りにある数量と、その数量を作る製造原価の合計を入力します。
                </p>
              </div>
              <button
                type="button"
                onClick={addScenario}
                disabled={inputs.scenarios.length >= 3}
                className="min-h-11 rounded-full border border-blue-300 px-4 py-2 text-sm font-bold text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                候補を追加（最大3案）
              </button>
            </div>
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
                    label={`候補${index + 1}の製造数`}
                    unit="個"
                    integer
                    value={scenario.quantity}
                    onChange={(value) =>
                      updateScenario(index, "quantity", value)
                    }
                  />
                  <div className="mt-4">
                    <NumberField
                      label={`候補${index + 1}の製造原価合計`}
                      unit="円"
                      value={scenario.manufacturingCost}
                      onChange={(value) =>
                        updateScenario(index, "manufacturingCost", value)
                      }
                    />
                  </div>
                  {inputs.scenarios.length > 2 ? (
                    <button
                      type="button"
                      onClick={() => removeScenario(index)}
                      className="mt-4 min-h-11 text-sm font-bold text-rose-700"
                    >
                      この候補を削除
                    </button>
                  ) : null}
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
            data-analytics-tool-id="made-to-order-profit-calculator"
            className="mt-6 w-full rounded-full bg-blue-600 px-5 py-4 font-black text-white hover:bg-blue-700"
          >
            損益分岐と完売時利益を計算する
          </button>
        </form>

        <section
          aria-live="polite"
          aria-label="比較結果"
          className="mt-10 min-w-0 border-t border-slate-200 pt-8"
        >
          <h2 className="text-xl font-black text-slate-950">ロット比較結果</h2>
          {!results ? (
            <p className="mt-4 rounded-2xl bg-slate-50 p-6 text-center text-slate-500">
              サンプルまたは販売条件とロット候補を入力して計算すると、ここに比較結果が表示されます。
            </p>
          ) : (
            <>
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950">
                <p className="text-sm font-bold">
                  入力条件で完売時利益が最も大きい候補
                </p>
                <p className="mt-1 text-2xl font-black">
                  {bestResult?.quantity.toLocaleString("ja-JP")}個製造：
                  {yen(bestResult?.selloutProfit ?? 0)}
                </p>
                <p className="mt-2 text-sm leading-6">
                  利益だけの比較です。必要な先払い資金、保管場所、売れ残りリスクも合わせて確認してください。
                </p>
              </div>
              <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="p-4">製造候補</th>
                      <th className="p-4">販売可能数</th>
                      <th className="p-4">損益分岐注文数</th>
                      <th className="p-4">完売時売上</th>
                      <th className="p-4">完売時利益</th>
                      <th className="p-4">1個当たり利益</th>
                      <th className="p-4">判断の目安</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result) => (
                      <tr key={result.id} className="border-t border-slate-200">
                        <th className="p-4">
                          {result.quantity.toLocaleString("ja-JP")}個（製造原価{" "}
                          {yen(result.manufacturingCost)}）
                        </th>
                        <td className="p-4">
                          {result.sellableQuantity.toLocaleString("ja-JP")}
                          個（予備 {result.reservedQuantity}個）
                        </td>
                        <td className="p-4 font-black">
                          {result.breakEvenReachable
                            ? `${result.breakEvenOrders.toLocaleString("ja-JP")}件`
                            : `${result.breakEvenOrders.toLocaleString("ja-JP")}件（完売しても未達）`}
                        </td>
                        <td className="p-4">{yen(result.selloutRevenue)}</td>
                        <td
                          className={`p-4 font-black ${result.selloutProfit >= 0 ? "text-emerald-700" : "text-rose-700"}`}
                        >
                          {yen(result.selloutProfit)}
                        </td>
                        <td className="p-4">
                          {yen(result.profitPerSellableItem)}
                        </td>
                        <td className="p-4 font-bold">
                          {!result.breakEvenReachable
                            ? "条件の見直しが必要"
                            : result.breakEvenOrders /
                                  result.sellableQuantity >=
                                0.8
                              ? "完売近くまで販売が必要"
                              : "完売前に損益分岐へ到達"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={downloadCsv}
                  className="min-h-11 rounded-full bg-slate-900 px-5 py-3 text-sm font-black text-white"
                >
                  比較結果CSVを保存
                </button>
              </div>
              <details className="mt-4 rounded-2xl border border-slate-200 p-4">
                <summary
                  data-analytics-event="select_content"
                  data-analytics-content-type="calculation_formula"
                  data-analytics-item-id="made-to-order-profit-calculator"
                  className="cursor-pointer font-black"
                >
                  計算の前提を見る
                </summary>
                <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                  <p>
                    販売可能数＝製造数×（1−不良予備率）を小数点以下切り捨て。1注文1個として計算します。
                  </p>
                  <p>
                    1注文の回収額＝販売価格−販売手数料−梱包費−販売者負担送料。損益分岐注文数＝（製造原価合計＋固定費）÷1注文の回収額を切り上げます。
                  </p>
                  <p>
                    完売時利益＝販売可能数×1注文の回収額−製造原価合計−固定費です。
                  </p>
                </div>
              </details>
              <aside className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
                <strong className="block">結果から確認できないこと</strong>
                実際の注文数、販売期間、完売可能性、返品・再発送、在庫処分、税、為替変動、保管費は予測しません。製造会社・販売先の最新見積りと条件を確認し、完売しない場合も支払える金額かを判断してください。
              </aside>
              <aside className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                <strong className="block text-slate-950">
                  販売前に確認する公式情報
                </strong>
                通信販売では販売価格や送料などの表示事項があります。計算結果をそのまま販売条件にせず、
                <a
                  className="font-bold text-blue-700 underline"
                  href="https://www.no-trouble.caa.go.jp/what/mailorder/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  消費者庁 特定商取引法ガイド
                </a>
                と、利用する販売サービス・製造会社の最新規約を確認してください。税務上の経費判断は
                <a
                  className="font-bold text-blue-700 underline"
                  href="https://www.nta.go.jp/taxes/shiraberu/taxanswer/code/bunya-kojinjigyo.htm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  国税庁「個人事業」
                </a>
                を入口に確認し、不明点は専門家へ相談してください。
              </aside>
              <PremiumInterestCards
                toolId="made-to-order-profit-calculator"
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
  help,
  integer = false,
}: {
  label: string;
  unit: string;
  value: number;
  onChange: (value: string) => void;
  help?: string;
  integer?: boolean;
}) {
  return (
    <label className="block text-sm font-bold text-slate-700">
      <span>{label}</span>
      <span className="ml-1 font-normal text-slate-500">（{unit}）</span>
      <input
        type="number"
        min={0}
        step={integer ? 1 : "any"}
        inputMode={integer ? "numeric" : "decimal"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={fieldClass}
      />
      {help ? (
        <span className="mt-1 block text-xs font-normal leading-5 text-slate-500">
          {help}
        </span>
      ) : null}
    </label>
  );
}
