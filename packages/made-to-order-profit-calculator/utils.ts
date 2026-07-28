export type ProductionScenario = {
  id: string;
  quantity: number;
  manufacturingCost: number;
};

export type ProfitInputs = {
  sellingPrice: number;
  fixedCost: number;
  packagingCost: number;
  salesFeeRate: number;
  shippingCost: number;
  defectReserveRate: number;
  scenarios: ProductionScenario[];
};

export type ProductionScenarioResult = ProductionScenario & {
  sellableQuantity: number;
  reservedQuantity: number;
  revenuePerOrder: number;
  variableCostPerOrder: number;
  contributionPerOrder: number;
  totalCost: number;
  breakEvenOrders: number;
  breakEvenReachable: boolean;
  selloutRevenue: number;
  selloutProfit: number;
  profitPerSellableItem: number;
};

export function compareProductionScenarios(
  inputs: ProfitInputs,
): ProductionScenarioResult[] {
  const feeRate = inputs.salesFeeRate / 100;
  const reserveRate = inputs.defectReserveRate / 100;
  const revenuePerOrder = inputs.sellingPrice;
  const variableCostPerOrder =
    inputs.sellingPrice * feeRate + inputs.packagingCost + inputs.shippingCost;
  const contributionPerOrder = revenuePerOrder - variableCostPerOrder;

  return inputs.scenarios.slice(0, 3).map((scenario) => {
    const sellableQuantity = Math.max(
      0,
      Math.floor(scenario.quantity * (1 - reserveRate)),
    );
    const reservedQuantity = scenario.quantity - sellableQuantity;
    const totalCost = scenario.manufacturingCost + inputs.fixedCost;
    const breakEvenOrders =
      contributionPerOrder > 0
        ? Math.ceil(totalCost / contributionPerOrder)
        : Number.POSITIVE_INFINITY;
    const selloutRevenue = sellableQuantity * inputs.sellingPrice;
    const selloutProfit = sellableQuantity * contributionPerOrder - totalCost;

    return {
      ...scenario,
      sellableQuantity,
      reservedQuantity,
      revenuePerOrder,
      variableCostPerOrder,
      contributionPerOrder,
      totalCost,
      breakEvenOrders,
      breakEvenReachable: breakEvenOrders <= sellableQuantity,
      selloutRevenue,
      selloutProfit,
      profitPerSellableItem:
        sellableQuantity > 0 ? selloutProfit / sellableQuantity : 0,
    };
  });
}

export function resultsToCsv(results: ProductionScenarioResult[]) {
  const rows = [
    [
      "製造数",
      "製造原価合計",
      "販売可能数",
      "不良予備数",
      "損益分岐注文数",
      "完売時売上",
      "完売時利益",
      "販売可能1個当たり利益",
    ],
    ...results.map((result) => [
      result.quantity,
      Math.round(result.manufacturingCost),
      result.sellableQuantity,
      result.reservedQuantity,
      Number.isFinite(result.breakEvenOrders)
        ? result.breakEvenOrders
        : "算出不可",
      Math.round(result.selloutRevenue),
      Math.round(result.selloutProfit),
      Math.round(result.profitPerSellableItem),
    ]),
  ];
  return rows.map((row) => row.join(",")).join("\r\n");
}
