"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";

// 手数料プリセット
const feeOptions = [
  { label: "Stripe (3.6%)", value: "stripe", rate: 3.6, fixedFee: 0 },
  { label: "Brain (12.0%)", value: "brain", rate: 12.0, fixedFee: 0 },
  {
    label: "BOOTH (5.6% + 22円想定)",
    value: "booth",
    rate: 5.6,
    fixedFee: 22,
  },
  { label: "note (14.5%)", value: "note", rate: 14.5, fixedFee: 0 },
  { label: "カスタム", value: "custom", rate: 0, fixedFee: 0 },
] as const;

type FeeType = (typeof feeOptions)[number]["value"];

type PricingState = {
  targetNet: number;
  costPerUnit: number;
  paymentFeeType: FeeType;
  customFee: number;
  monthlyUnits: number;
};

const defaultState: PricingState = {
  targetNet: 300000,
  costPerUnit: 1200,
  paymentFeeType: "stripe",
  customFee: 5,
  monthlyUnits: 50,
};

const clampNumber = (
  value: unknown,
  fallback: number,
  min: number,
  max = Number.MAX_SAFE_INTEGER,
) => {
  const number =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim()
        ? Number(value)
        : Number.NaN;

  return Number.isFinite(number)
    ? Math.min(max, Math.max(min, number))
    : fallback;
};

const isFeeType = (value: unknown): value is FeeType =>
  typeof value === "string" &&
  feeOptions.some((option) => option.value === value);

const formatYen = (value: number) =>
  new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(value);

const formatPercent = (value: number) => `${value.toFixed(1)}%`;

function DynamicPricingCalculator() {
  const [targetNet, setTargetNet] = useState(defaultState.targetNet);
  const [costPerUnit, setCostPerUnit] = useState(defaultState.costPerUnit);
  const [paymentFeeType, setPaymentFeeType] = useState<FeeType>(
    defaultState.paymentFeeType,
  );
  const [customFee, setCustomFee] = useState(defaultState.customFee);
  const [monthlyUnits, setMonthlyUnits] = useState(defaultState.monthlyUnits);
  const [copied, setCopied] = useState<boolean>(false);
  const [restored, setRestored] = useState(false);

  // 初回読み込み時: URLパラメータまたは LocalStorage から復元
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const hasUrlState = [
      "target",
      "cost",
      "feetype",
      "customfee",
      "units",
    ].some((key) => params.has(key));
    let source: Record<string, unknown> = {};

    if (hasUrlState) {
      source = {
        targetNet: params.get("target"),
        costPerUnit: params.get("cost"),
        paymentFeeType: params.get("feetype"),
        customFee: params.get("customfee"),
        monthlyUnits: params.get("units"),
      };
    } else {
      const saved = localStorage.getItem("sakupura_001_pricing");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === "object") {
            source = parsed as Record<string, unknown>;
          }
        } catch (e) {
          console.error("Failed to parse saved state", e);
        }
      }
    }

    const nextState: PricingState = {
      targetNet: clampNumber(source.targetNet, defaultState.targetNet, 0),
      costPerUnit: clampNumber(source.costPerUnit, defaultState.costPerUnit, 0),
      paymentFeeType: isFeeType(source.paymentFeeType)
        ? source.paymentFeeType
        : defaultState.paymentFeeType,
      customFee: clampNumber(source.customFee, defaultState.customFee, 0, 99),
      monthlyUnits: clampNumber(
        source.monthlyUnits,
        defaultState.monthlyUnits,
        1,
      ),
    };

    const frame = window.requestAnimationFrame(() => {
      setTargetNet(nextState.targetNet);
      setCostPerUnit(nextState.costPerUnit);
      setPaymentFeeType(nextState.paymentFeeType);
      setCustomFee(nextState.customFee);
      setMonthlyUnits(nextState.monthlyUnits);
      setRestored(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  // 状態変更時: LocalStorage に自動保存 & URL書き換え
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!restored) return;

    const stateToSave = {
      targetNet,
      costPerUnit,
      paymentFeeType,
      customFee,
      monthlyUnits,
    };

    localStorage.setItem("sakupura_001_pricing", JSON.stringify(stateToSave));

    const params = new URLSearchParams();
    params.set("target", targetNet.toString());
    params.set("cost", costPerUnit.toString());
    params.set("feetype", paymentFeeType);
    params.set("customfee", customFee.toString());
    params.set("units", monthlyUnits.toString());

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", newUrl);
  }, [
    targetNet,
    costPerUnit,
    paymentFeeType,
    customFee,
    monthlyUnits,
    restored,
  ]);

  // URL共有コピー処理
  const handleCopyShareUrl = async () => {
    if (typeof window === "undefined") return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy the share URL", error);
    }
  };

  const feeRate = useMemo(() => {
    const option = feeOptions.find((item) => item.value === paymentFeeType);
    const rate = paymentFeeType === "custom" ? customFee : (option?.rate ?? 0);
    return Math.min(99, Math.max(0, rate));
  }, [paymentFeeType, customFee]);

  const fixedFee = useMemo(() => {
    const option = feeOptions.find((item) => item.value === paymentFeeType);
    return paymentFeeType === "custom" ? 0 : (option?.fixedFee ?? 0);
  }, [paymentFeeType]);

  const results = useMemo(() => {
    const units = Math.max(1, monthlyUnits);
    const cost = Math.max(0, costPerUnit);
    const target = Math.max(0, targetNet);
    const feeRatio = Math.max(0, feeRate) / 100;

    const priceExTax = (cost + fixedFee + target / units) / (1 - feeRatio);
    const priceInTax = priceExTax * 1.1;
    const platformFee = priceExTax * feeRatio + fixedFee;
    const profitPerUnit = priceExTax - cost - platformFee;
    const profitRate = priceExTax > 0 ? (profitPerUnit / priceExTax) * 100 : 0;
    const monthlyRevenue = priceInTax * units;
    const monthlyProfit = profitPerUnit * units;

    return {
      priceExTax,
      priceInTax,
      platformFee,
      profitPerUnit,
      profitRate,
      monthlyRevenue,
      monthlyProfit,
    };
  }, [targetNet, costPerUnit, monthlyUnits, feeRate, fixedFee]);

  return (
    <>
      <main
        style={{
          flex: 1,
          maxWidth: "1000px",
          width: "100%",
          margin: "0 auto",
          padding: "32px 16px",
        }}
      >
        <div style={{ marginBottom: "24px" }}>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: "bold",
              marginBottom: "8px",
            }}
          >
            動的プライシング・収益シミュレーター
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.95rem" }}>
            目標手取り額・原価・各種手数料から「本当に手元に残る利益」と「最適な販売価格」をリアルタイムに自動計算します。
          </p>
        </div>

        {/* コントロール & 結果エリア (2カラム構造) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "24px",
          }}
        >
          {/* 左カラム：入力フォーム */}
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              padding: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <h2
              style={{
                fontSize: "1.1rem",
                fontWeight: "bold",
                marginBottom: "16px",
                borderBottom: "2px solid #3b82f6",
                paddingBottom: "8px",
              }}
            >
              シミュレーション条件
            </h2>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    marginBottom: "6px",
                  }}
                >
                  月間目標手取り額 (円)
                </label>
                <input
                  type="number"
                  min="0"
                  value={targetNet}
                  onChange={(e) => setTargetNet(Number(e.target.value))}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    fontSize: "1rem",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    marginBottom: "6px",
                  }}
                >
                  1件あたりの原価 / 経費 (円)
                </label>
                <input
                  type="number"
                  min="0"
                  value={costPerUnit}
                  onChange={(e) => setCostPerUnit(Number(e.target.value))}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    fontSize: "1rem",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    marginBottom: "6px",
                  }}
                >
                  月間想定販売数 (個 / 件)
                </label>
                <input
                  type="number"
                  min="1"
                  value={monthlyUnits}
                  onChange={(e) => setMonthlyUnits(Number(e.target.value))}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    fontSize: "1rem",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    marginBottom: "6px",
                  }}
                >
                  決済・プラットフォーム手数料
                </label>
                <select
                  value={paymentFeeType}
                  onChange={(e) => {
                    if (isFeeType(e.target.value)) {
                      setPaymentFeeType(e.target.value);
                    }
                  }}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    fontSize: "1rem",
                    backgroundColor: "#fff",
                  }}
                >
                  {feeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {paymentFeeType === "custom" && (
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      marginBottom: "6px",
                    }}
                  >
                    カスタム手数料率 (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    step="0.1"
                    value={customFee}
                    onChange={(e) => setCustomFee(Number(e.target.value))}
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      fontSize: "1rem",
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* 右カラム：試算結果 */}
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              padding: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  marginBottom: "16px",
                  borderBottom: "2px solid #10b981",
                  paddingBottom: "8px",
                }}
              >
                最適価格・利益結果
              </h2>

              <div
                style={{
                  backgroundColor: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: "8px",
                  padding: "16px",
                  marginBottom: "20px",
                }}
              >
                <span
                  style={{
                    fontSize: "0.875rem",
                    color: "#166534",
                    fontWeight: "600",
                  }}
                >
                  推奨販売価格 (税込)
                </span>
                <div
                  style={{
                    fontSize: "2rem",
                    fontWeight: "bold",
                    color: "#15803d",
                    marginTop: "4px",
                  }}
                >
                  {formatYen(results.priceInTax)}
                </div>
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "#166534",
                    marginTop: "2px",
                  }}
                >
                  (税抜参考: {formatYen(results.priceExTax)})
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  fontSize: "0.95rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderBottom: "1px dashed #e2e8f0",
                    paddingBottom: "8px",
                  }}
                >
                  <span style={{ color: "#64748b" }}>
                    1件あたり手数料 ({formatPercent(feeRate)})
                  </span>
                  <span style={{ fontWeight: "600" }}>
                    {formatYen(results.platformFee)}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderBottom: "1px dashed #e2e8f0",
                    paddingBottom: "8px",
                  }}
                >
                  <span style={{ color: "#64748b" }}>1件あたり手取り利益</span>
                  <span style={{ fontWeight: "600", color: "#2563eb" }}>
                    {formatYen(results.profitPerUnit)}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderBottom: "1px dashed #e2e8f0",
                    paddingBottom: "8px",
                  }}
                >
                  <span style={{ color: "#64748b" }}>粗利益率</span>
                  <span style={{ fontWeight: "600" }}>
                    {formatPercent(results.profitRate)}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderBottom: "1px dashed #e2e8f0",
                    paddingBottom: "8px",
                  }}
                >
                  <span style={{ color: "#64748b" }}>
                    月間想定売上高 (税込)
                  </span>
                  <span style={{ fontWeight: "600" }}>
                    {formatYen(results.monthlyRevenue)}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    paddingTop: "4px",
                  }}
                >
                  <span style={{ color: "#64748b", fontWeight: "bold" }}>
                    月間想定最終利益
                  </span>
                  <span
                    style={{
                      fontWeight: "bold",
                      color: "#16a34a",
                      fontSize: "1.1rem",
                    }}
                  >
                    {formatYen(results.monthlyProfit)}
                  </span>
                </div>
              </div>
            </div>

            {/* URL共有ボタン */}
            <div style={{ marginTop: "24px" }}>
              <button
                onClick={handleCopyShareUrl}
                style={{
                  width: "100%",
                  padding: "12px",
                  backgroundColor: copied ? "#16a34a" : "#2563eb",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                }}
              >
                {copied
                  ? "✓ 共有URLをコピーしました！"
                  : "🔗 シミュレーション結果のURLをコピー"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export function DynamicPricingPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: "32px", textAlign: "center" }}>Loading...</div>
      }
    >
      <DynamicPricingCalculator />
    </Suspense>
  );
}

export default DynamicPricingPage;
