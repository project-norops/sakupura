export type ReturnCostInputs = {
  orderCount: number;
  averageOrderAmount: number;
  productCostPerOrder: number;
  outboundShippingPerOrder: number;
  paymentFeeRate: number;
  returnShippingPerReturn: number;
  inspectionCostPerReturn: number;
};

export type ReturnScenario = {
  id: string;
  name: string;
  returnRate: number;
  resalableRate: number;
};

export type ReturnScenarioResult = ReturnScenario & {
  returnedOrders: number;
  keptOrders: number;
  refundedAmount: number;
  recoveredInventoryCost: number;
  returnHandlingCost: number;
  profitAfterReturns: number;
  lossFromReturns: number;
  costPerReturn: number;
  profitMarginRate: number;
};

export function calculateReturnScenario(
  inputs: ReturnCostInputs,
  scenario: ReturnScenario,
): ReturnScenarioResult {
  const returnRate = scenario.returnRate / 100;
  const resalableRate = scenario.resalableRate / 100;
  const returnedOrders = inputs.orderCount * returnRate;
  const keptOrders = inputs.orderCount - returnedOrders;
  const grossSales = inputs.orderCount * inputs.averageOrderAmount;
  const keptSales = keptOrders * inputs.averageOrderAmount;
  const paymentFees = grossSales * (inputs.paymentFeeRate / 100);
  const recoveredInventoryCost =
    returnedOrders * inputs.productCostPerOrder * resalableRate;
  const netProductCost =
    inputs.orderCount * inputs.productCostPerOrder - recoveredInventoryCost;
  const outboundShipping = inputs.orderCount * inputs.outboundShippingPerOrder;
  const returnHandlingCost =
    returnedOrders *
    (inputs.returnShippingPerReturn + inputs.inspectionCostPerReturn);
  const profitBeforeReturns =
    grossSales -
    inputs.orderCount * inputs.productCostPerOrder -
    outboundShipping -
    paymentFees;
  const profitAfterReturns =
    keptSales -
    netProductCost -
    outboundShipping -
    paymentFees -
    returnHandlingCost;
  const lossFromReturns = profitBeforeReturns - profitAfterReturns;

  return {
    ...scenario,
    returnedOrders,
    keptOrders,
    refundedAmount: returnedOrders * inputs.averageOrderAmount,
    recoveredInventoryCost,
    returnHandlingCost,
    profitAfterReturns,
    lossFromReturns,
    costPerReturn: returnedOrders > 0 ? lossFromReturns / returnedOrders : 0,
    profitMarginRate:
      grossSales > 0 ? (profitAfterReturns / grossSales) * 100 : 0,
  };
}

export function compareReturnScenarios(
  inputs: ReturnCostInputs,
  scenarios: ReturnScenario[],
) {
  return scenarios
    .slice(0, 3)
    .map((scenario) => calculateReturnScenario(inputs, scenario));
}

export function createReturnResultsCsv(results: ReturnScenarioResult[]) {
  const rows = [
    [
      "シナリオ",
      "返品率",
      "再販可能率",
      "返品件数",
      "返金額",
      "返品対応費",
      "返品後利益",
      "返品による利益減少",
      "返品1件当たり影響",
      "売上利益率",
    ],
    ...results.map((result) => [
      result.name,
      `${result.returnRate}%`,
      `${result.resalableRate}%`,
      result.returnedOrders.toFixed(1),
      Math.round(result.refundedAmount),
      Math.round(result.returnHandlingCost),
      Math.round(result.profitAfterReturns),
      Math.round(result.lossFromReturns),
      Math.round(result.costPerReturn),
      `${result.profitMarginRate.toFixed(1)}%`,
    ]),
  ];
  return rows
    .map((row) =>
      row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","),
    )
    .join("\r\n");
}
