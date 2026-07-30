"use client";

import { PremiumInterestCards } from "@sakupla/shared-ui/PremiumInterestCards";
import { useState, type FormEvent } from "react";
import {
  calculateEventProfit,
  createEventProfitCsv,
  type EventCostInputs,
  type EventProduct,
  type EventProfitResult,
} from "./utils";

const SAMPLE_COSTS: EventCostInputs = {
  boothFee: 12000,
  travelCost: 6000,
  fixtureCost: 3000,
  laborCost: 7000,
  otherFixedCost: 2000,
  paymentFeeRate: 3.6,
  packagingCostPerSale: 100,
};

const SAMPLE_PRODUCTS: EventProduct[] = [
  {
    id: "item-1",
    name: "アクセサリー",
    price: 2500,
    unitCost: 800,
    broughtQuantity: 20,
    expectedSellThroughRate: 70,
  },
  {
    id: "item-2",
    name: "ポストカード",
    price: 800,
    unitCost: 200,
    broughtQuantity: 30,
    expectedSellThroughRate: 60,
  },
  {
    id: "item-3",
    name: "トートバッグ",
    price: 3200,
    unitCost: 1200,
    broughtQuantity: 12,
    expectedSellThroughRate: 50,
  },
];

const PREMIUM_CANDIDATES = [
  {
    featureId: "event_scenario_save" as const,
    name: "出店条件の保存",
    description:
      "会場ごとの出店料や移動費、商品構成を保存し、次回の出店計画を同じ条件から再開できる候補です。",
  },
  {
    featureId: "multi_event_compare" as const,
    name: "複数イベント比較",
    description:
      "複数会場の固定費、必要販売数、実績差分を並べ、出店判断を比較できる候補です。",
  },
];

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100";
const yen = (value: number) => `${Math.round(value).toLocaleString("ja-JP")}円`;
const quantity = (value: number) => `${value.toFixed(1)}点`;

export function PopupEventProfitCalculatorPage() {
  const [costs, setCosts] = useState<EventCostInputs>(SAMPLE_COSTS);
  const [products, setProducts] = useState<EventProduct[]>(SAMPLE_PRODUCTS);
  const [result, setResult] = useState<EventProfitResult | null>(null);
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  const clearResult = () => {
    setResult(null);
    setError("");
    setSaveMessage("");
  };

  const updateCost = (key: keyof EventCostInputs, value: string) => {
    setCosts((current) => ({
      ...current,
      [key]: Math.max(0, Number(value) || 0),
    }));
    clearResult();
  };

  const updateProduct = (
    index: number,
    key: keyof Omit<EventProduct, "id">,
    value: string,
  ) => {
    setProducts((current) =>
      current.map((product, productIndex) =>
        productIndex === index
          ? {
              ...product,
              [key]: key === "name" ? value : Math.max(0, Number(value) || 0),
            }
          : product,
      ),
    );
    clearResult();
  };

  const run = (event: FormEvent) => {
    event.preventDefault();
    if (costs.paymentFeeRate > 100)
      return setError("決済費率は100%以下で入力してください。");
    if (
      products.some(
        (product) =>
          !product.name.trim() ||
          product.price <= 0 ||
          product.broughtQuantity <= 0,
      )
    )
      return setError(
        "商品名、0円より大きい販売単価、0点より多い持込数を入力してください。",
      );
    if (products.some((product) => product.expectedSellThroughRate > 100))
      return setError("想定販売率は0〜100%で入力してください。");
    if (
      products.some(
        (product) =>
          product.price -
            product.unitCost -
            product.price * (costs.paymentFeeRate / 100) -
            costs.packagingCostPerSale <=
          0,
      )
    )
      return setError(
        "原価・決済費・梱包費を引いた1点当たりの利益が0円より大きくなるよう確認してください。",
      );
    setError("");
    setSaveMessage("");
    setResult(calculateEventProfit(costs, products));
  };

  const loadSample = () => {
    setCosts(SAMPLE_COSTS);
    setProducts(SAMPLE_PRODUCTS);
    clearResult();
  };

  const saveCsv = () => {
    if (!result) return;
    const blob = new Blob([`\uFEFF${createEventProfitCsv(result)}`], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "popup-event-profit.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    setSaveMessage("採算結果CSVを保存しました。");
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <p className="text-xs font-black uppercase tracking-[.2em] text-blue-600">
          対面販売の出店計画
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          ポップアップ出店採算・必要販売数
        </h1>
        <p className="mt-4 max-w-3xl leading-7 text-slate-600">
          週末マルシェへ3商品を持ち込む場合のように、出店料、移動費、人件費と商品構成から、何点売れば固定費を回収できるか試算します。入力と結果はブラウザ内だけで処理します。
        </p>

        <section
          aria-label="かんたん操作手順"
          className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4 sm:p-5"
        >
          <h2 className="font-black text-slate-950">
            出店前に、固定費を回収できる販売数を確認します
          </h2>
          <ol className="mt-3 grid gap-3 text-sm leading-6 text-slate-700 sm:grid-cols-3">
            <li className="rounded-xl bg-white p-4">
              <strong className="text-blue-700">1. 共通費</strong>
              <br />
              出店料、移動・宿泊、什器、人件費などを入力します。
            </li>
            <li className="rounded-xl bg-white p-4">
              <strong className="text-blue-700">2. 商品構成</strong>
              <br />
              最大3商品の価格、原価、持込数、想定販売率を設定します。
            </li>
            <li className="rounded-xl bg-white p-4">
              <strong className="text-blue-700">3. 採算確認</strong>
              <br />
              損益分岐、想定利益、完売時利益を確認します。
            </li>
          </ol>
          <p className="mt-3 text-sm font-bold leading-6 text-slate-800">
            来場者数や需要、販売数、完売、利益を予測・保証するツールではありません。複数の販売率で再計算してください。
          </p>
        </section>

        <form onSubmit={run} className="mt-8 min-w-0" noValidate>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-950">
                イベント共通費
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                売れた数にかかわらず発生する固定費と、1点ごとの変動費を分けて入力します。
              </p>
            </div>
            <button
              type="button"
              onClick={loadSample}
              data-analytics-event="sample_load"
              data-analytics-tool-id="popup-event-profit-calculator"
              className="min-h-11 rounded-full border border-blue-300 px-4 py-2 text-sm font-bold text-blue-700"
            >
              サンプル値に戻す
            </button>
          </div>
          <div className="mt-5 grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <NumberField
              label="出店料"
              unit="円"
              value={costs.boothFee}
              onChange={(value) => updateCost("boothFee", value)}
            />
            <NumberField
              label="移動・宿泊費"
              unit="円"
              value={costs.travelCost}
              onChange={(value) => updateCost("travelCost", value)}
            />
            <NumberField
              label="什器・備品費"
              unit="円"
              value={costs.fixtureCost}
              onChange={(value) => updateCost("fixtureCost", value)}
            />
            <NumberField
              label="人件費"
              unit="円"
              value={costs.laborCost}
              onChange={(value) => updateCost("laborCost", value)}
            />
            <NumberField
              label="その他固定費"
              unit="円"
              value={costs.otherFixedCost}
              onChange={(value) => updateCost("otherFixedCost", value)}
            />
            <NumberField
              label="決済費率"
              unit="売上の%"
              value={costs.paymentFeeRate}
              onChange={(value) => updateCost("paymentFeeRate", value)}
            />
            <NumberField
              label="梱包・袋代"
              unit="円／販売1点"
              value={costs.packagingCostPerSale}
              onChange={(value) => updateCost("packagingCostPerSale", value)}
            />
          </div>

          <section className="mt-8">
            <h2 className="text-xl font-black text-slate-950">持ち込む商品</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              想定販売率は、持込数のうち当日売れると仮定する割合です。
            </p>
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              {products.map((product, index) => (
                <fieldset
                  key={product.id}
                  className="min-w-0 rounded-2xl border border-slate-200 p-4"
                >
                  <legend className="px-1 font-black text-slate-800">
                    商品{index + 1}
                  </legend>
                  <label className="block text-sm font-bold text-slate-700">
                    商品名
                    <input
                      type="text"
                      value={product.name}
                      onChange={(event) =>
                        updateProduct(index, "name", event.target.value)
                      }
                      className={inputClass}
                    />
                  </label>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                    <NumberField
                      label="販売単価"
                      unit="円"
                      value={product.price}
                      onChange={(value) => updateProduct(index, "price", value)}
                    />
                    <NumberField
                      label="商品原価"
                      unit="円"
                      value={product.unitCost}
                      onChange={(value) =>
                        updateProduct(index, "unitCost", value)
                      }
                    />
                    <NumberField
                      label="持込数"
                      unit="点"
                      value={product.broughtQuantity}
                      onChange={(value) =>
                        updateProduct(index, "broughtQuantity", value)
                      }
                    />
                    <NumberField
                      label="想定販売率"
                      unit="持込数の%"
                      value={product.expectedSellThroughRate}
                      onChange={(value) =>
                        updateProduct(index, "expectedSellThroughRate", value)
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
            data-analytics-tool-id="popup-event-profit-calculator"
            className="mt-6 w-full rounded-full bg-blue-600 px-5 py-4 font-black text-white hover:bg-blue-700"
          >
            出店採算を計算する
          </button>
        </form>

        <section
          aria-live="polite"
          aria-label="採算結果"
          className="mt-10 min-w-0 border-t border-slate-200 pt-8"
        >
          <h2 className="text-xl font-black text-slate-950">採算結果</h2>
          {!result ? (
            <p className="mt-4 rounded-2xl bg-slate-50 p-6 text-center text-slate-500">
              条件を確認して「出店採算を計算する」を押してください。
            </p>
          ) : (
            <>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <ResultCard
                  label="必要販売数の目安"
                  value={`${result.breakEvenQuantity}点`}
                  note={`損益分岐売上 ${yen(result.breakEvenRevenue)}`}
                />
                <ResultCard
                  label="想定売上"
                  value={yen(result.expectedRevenue)}
                  note={`想定販売数 ${quantity(result.expectedSoldQuantity)}`}
                />
                <ResultCard
                  label="想定利益"
                  value={yen(result.expectedProfit)}
                  note={`固定費 ${yen(result.fixedCosts)}`}
                  emphasis
                />
                <ResultCard
                  label="完売時利益"
                  value={yen(result.soldOutProfit)}
                  note={`持込在庫原価 ${yen(result.inventoryCost)}`}
                />
              </div>
              {!result.canBreakEvenWithInventory ? (
                <p
                  role="status"
                  className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-950"
                >
                  現在の商品構成では、持込商品をすべて売っても固定費を回収できません。固定費、販売単価、原価、持込数を見直してください。
                </p>
              ) : null}
              <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full min-w-[800px] text-left text-sm">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="p-4">商品</th>
                      <th className="p-4">持込数</th>
                      <th className="p-4">想定販売数</th>
                      <th className="p-4">想定売上</th>
                      <th className="p-4">1点当たり限界利益</th>
                      <th className="p-4">想定限界利益</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.productResults.map((product) => (
                      <tr
                        key={product.id}
                        className="border-t border-slate-200"
                      >
                        <th className="p-4">
                          {product.name}
                          <span className="mt-1 block font-normal text-slate-500">
                            販売率{product.expectedSellThroughRate}%
                          </span>
                        </th>
                        <td className="p-4">{product.broughtQuantity}点</td>
                        <td className="p-4">
                          {quantity(product.expectedSoldQuantity)}
                        </td>
                        <td className="p-4">{yen(product.expectedRevenue)}</td>
                        <td className="p-4">
                          {yen(product.contributionPerSale)}
                        </td>
                        <td className="p-4 font-bold">
                          {yen(product.expectedContribution)}
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
                  data-analytics-tool-id="popup-event-profit-calculator"
                  className="min-h-11 rounded-full border border-blue-300 px-5 py-2.5 text-sm font-bold text-blue-700"
                >
                  採算結果CSVを保存
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
                  data-analytics-item-id="popup-event-profit-calculator"
                  className="cursor-pointer font-black"
                >
                  計算の前提を見る
                </summary>
                <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                  <p>
                    想定利益＝各商品の想定販売数×（販売単価−原価−決済費−梱包費）−固定費です。必要販売数は、入力した想定販売構成の平均限界利益で固定費を回収する目安です。
                  </p>
                  <p>
                    税、廃棄、返品、盗難、値引き、決済端末の月額・最低手数料は含みません。人件費を自分の作業時間にも設定すると採算を過大評価しにくくなります。
                  </p>
                </div>
              </details>
              <aside className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
                <strong className="block">結果の読み方と次の確認</strong>
                想定利益だけでなく、販売率を下げても赤字にならないかを確認してください。この結果から来場者数や需要は分からないため、主催者の過去実績、客層、天候、搬入条件、キャンセル条件を別途確認します。
              </aside>
              <PremiumInterestCards
                toolId="popup-event-profit-calculator"
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

function ResultCard({
  label,
  value,
  note,
  emphasis = false,
}: {
  label: string;
  value: string;
  note: string;
  emphasis?: boolean;
}) {
  return (
    <article
      className={`rounded-2xl border p-5 ${emphasis ? "border-blue-200 bg-blue-50" : "border-slate-200"}`}
    >
      <p className="text-sm font-bold text-slate-600">{label}</p>
      <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-sm text-slate-600">{note}</p>
    </article>
  );
}
