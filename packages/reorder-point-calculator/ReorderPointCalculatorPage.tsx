"use client";

import { PremiumInterestCards } from "@sakupla/shared-ui/PremiumInterestCards";
import { useState, type FormEvent } from "react";
import {
  calculateReorderPoint,
  type InventoryInputs,
  type InventoryResult,
} from "./utils";

const SAMPLE: InventoryInputs = {
  averageWeeklySales: 10,
  maximumWeeklySales: 16,
  averageLeadTimeDays: 5,
  maximumLeadTimeDays: 7,
  currentStock: 8,
  incomingStock: 0,
};

const PREMIUM_CANDIDATES = [
  {
    featureId: "inventory_profile_save" as const,
    name: "商品条件の保存",
    description:
      "販売数や納期などの商品条件をこの端末に保存し、毎週の在庫確認で呼び出せる候補です。",
  },
  {
    featureId: "multi_sku_inventory" as const,
    name: "複数SKUの一括確認",
    description:
      "複数商品の在庫条件をまとめて読み込み、発注点に達した商品を一覧で確認できる候補です。",
  },
];

const fieldClass =
  "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

function formatNumber(value: number, digits = 1) {
  return value.toLocaleString("ja-JP", {
    maximumFractionDigits: digits,
  });
}

function resultMessage(result: InventoryResult) {
  if (result.status === "now") {
    return "在庫位置が発注点以下です。現在庫と入荷予定を確認し、発注の要否を検討してください。";
  }
  if (result.status === "soon") {
    return `約${formatNumber(result.daysUntilReorder)}日で発注点へ達する試算です。納期と次回の在庫確認日を先に確認してください。`;
  }
  return `約${formatNumber(result.daysUntilReorder)}日で発注点へ達する試算です。販売ペースや納期が変わったら再計算してください。`;
}

export function ReorderPointCalculatorPage() {
  const [inputs, setInputs] = useState<InventoryInputs>(SAMPLE);
  const [result, setResult] = useState<InventoryResult | null>(null);
  const [error, setError] = useState("");

  const update = (key: keyof InventoryInputs, value: string) => {
    setInputs((current) => ({
      ...current,
      [key]: Math.max(0, Number(value) || 0),
    }));
    setResult(null);
    setError("");
  };

  const runCalculation = (event: FormEvent) => {
    event.preventDefault();
    if (inputs.averageWeeklySales <= 0) {
      setError("平均販売数は0より大きい数を入力してください。");
      return;
    }
    if (inputs.maximumWeeklySales < inputs.averageWeeklySales) {
      setError("最大販売数は平均販売数以上で入力してください。");
      return;
    }
    if (inputs.averageLeadTimeDays <= 0) {
      setError("平均納期は0より大きい日数を入力してください。");
      return;
    }
    if (inputs.maximumLeadTimeDays < inputs.averageLeadTimeDays) {
      setError("最大納期は平均納期以上で入力してください。");
      return;
    }
    setError("");
    setResult(calculateReorderPoint(inputs));
  };

  const loadSample = () => {
    setInputs(SAMPLE);
    setResult(null);
    setError("");
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
          EC・店舗の在庫管理
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          発注点・安全在庫計算
        </h1>
        <p className="mt-4 max-w-3xl leading-7 text-slate-600">
          毎週10個売れ、納品に5日かかる商品のような在庫条件から、安全在庫と発注を検討する在庫数を計算します。入力値と結果は外部へ送らず、ブラウザ内だけで処理します。
        </p>

        <section
          aria-label="かんたん操作手順"
          className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4 sm:p-5"
        >
          <h2 className="font-black text-slate-950">3ステップで確認</h2>
          <ol className="mt-3 grid gap-3 text-sm leading-6 text-slate-700 sm:grid-cols-3">
            <li><strong>1. 販売数</strong><br />1週間に売れる平均・最大個数を入力</li>
            <li><strong>2. 納期と在庫</strong><br />発注から入荷までの日数と在庫を入力</li>
            <li><strong>3. 結果を確認</strong><br />発注点と次に確認する条件を見る</li>
          </ol>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[.9fr_1.1fr]">
          <form onSubmit={runCalculation} noValidate>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-black text-slate-950">商品条件</h2>
              <button
                type="button"
                onClick={loadSample}
                data-analytics-event="sample_load"
                data-analytics-tool-id="reorder-point-calculator"
                className="min-h-11 rounded-full border border-blue-300 px-4 py-2 text-sm font-bold text-blue-700 hover:border-blue-500"
              >
                サンプル値に戻す
              </button>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              販売数は「個／週」、納期は「日」で入力します。初期値は毎週10個売れる商品のサンプルです。
            </p>

            <fieldset className="mt-5 grid gap-4 sm:grid-cols-2">
              <legend className="sr-only">販売数と納期</legend>
              <NumberField label="平均販売数" unit="個／週" value={inputs.averageWeeklySales} onChange={(value) => update("averageWeeklySales", value)} />
              <NumberField label="最大販売数" unit="個／週" value={inputs.maximumWeeklySales} onChange={(value) => update("maximumWeeklySales", value)} />
              <NumberField label="平均納期" unit="日" value={inputs.averageLeadTimeDays} onChange={(value) => update("averageLeadTimeDays", value)} />
              <NumberField label="最大納期" unit="日" value={inputs.maximumLeadTimeDays} onChange={(value) => update("maximumLeadTimeDays", value)} />
              <NumberField label="現在庫" unit="個" value={inputs.currentStock} onChange={(value) => update("currentStock", value)} />
              <NumberField label="発注残" unit="個" value={inputs.incomingStock} onChange={(value) => update("incomingStock", value)} help="発注済みで、まだ入荷していない数量です。" />
            </fieldset>

            {error ? (
              <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-4 text-sm font-bold text-rose-800">{error}</p>
            ) : null}

            <button
              type="submit"
              data-analytics-event="tool_run"
              data-analytics-tool-id="reorder-point-calculator"
              className="mt-6 w-full rounded-full bg-blue-600 px-5 py-4 font-black text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              発注目安を計算する
            </button>
          </form>

          <section aria-live="polite" aria-label="計算結果">
            <h2 className="text-xl font-black text-slate-950">計算結果</h2>
            {!result ? (
              <div className="mt-4 rounded-2xl bg-slate-50 p-7 text-center text-slate-500">
                商品条件を確認して「発注目安を計算する」を押してください。
              </div>
            ) : (
              <>
                <div className="mt-4 rounded-2xl bg-slate-950 p-5 text-white sm:p-6">
                  <p className="text-sm font-bold text-slate-300">今回の読み方</p>
                  <p className="mt-2 text-lg font-black leading-8">{resultMessage(result)}</p>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3">
                  <ResultCard term="安全在庫" value={`${formatNumber(result.safetyStock, 0)}個`} description="販売増や納期遅れに備える余裕分" />
                  <ResultCard term="発注点" value={`${formatNumber(result.reorderPoint, 0)}個`} description="発注を検討し始める在庫位置" />
                  <ResultCard term="到達目安" value={result.daysUntilReorder === 0 ? "到達済み" : `約${formatNumber(result.daysUntilReorder)}日`} description="現在庫＋発注残からの試算" />
                  <ResultCard term="発注量の参考" value={`${formatNumber(result.recommendedOrderQuantity, 0)}個`} description="発注点＋平均1週間分まで補充" />
                </dl>
                <details className="mt-4 rounded-2xl border border-slate-200 p-4">
                  <summary
                    data-analytics-event="select_content"
                    data-analytics-content-type="calculation_formula"
                    data-analytics-item-id="reorder-point-calculator"
                    className="cursor-pointer font-black text-slate-800"
                  >
                    使用した式と前提を見る
                  </summary>
                  <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                    <p>1日平均販売数＝1週間の平均販売数÷7</p>
                    <p>安全在庫＝最大販売数／日×最大納期−平均販売数／日×平均納期（0未満は0）</p>
                    <p>発注点＝平均販売数／日×平均納期＋安全在庫</p>
                    <p>発注量の参考＝発注点＋平均1週間分−（現在庫＋発注残）。個数は不足しないよう切り上げています。</p>
                  </div>
                </details>
                <section className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <h3 className="font-black text-amber-950">発注前に確認すること</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-amber-950">
                    <li>実際の在庫数と、発注残の入荷予定日</li>
                    <li>最低発注数・ロット・保管場所・廃棄期限</li>
                    <li>季節変動、販促予定、仕入先の休業や供給遅延</li>
                  </ul>
                </section>
                <PremiumInterestCards
                  toolId="reorder-point-calculator"
                  placement="result_after"
                  candidates={PREMIUM_CANDIDATES}
                />
              </>
            )}
          </section>
        </div>
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
}: {
  label: string;
  unit: string;
  value: number;
  onChange: (value: string) => void;
  help?: string;
}) {
  return (
    <label className="block text-sm font-bold text-slate-700">
      <span>{label}</span>
      <span className="ml-1 font-normal text-slate-500">（{unit}）</span>
      <input
        type="number"
        min={0}
        step="any"
        inputMode="decimal"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={fieldClass}
      />
      {help ? <span className="mt-1 block text-xs font-normal leading-5 text-slate-500">{help}</span> : null}
    </label>
  );
}

function ResultCard({ term, value, description }: { term: string; value: string; description: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <dt className="text-sm font-bold text-slate-600">{term}</dt>
      <dd className="mt-1 text-2xl font-black text-slate-950">{value}</dd>
      <dd className="mt-1 text-xs leading-5 text-slate-500">{description}</dd>
    </div>
  );
}
