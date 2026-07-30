export type EventCostInputs = {
  boothFee: number;
  travelCost: number;
  fixtureCost: number;
  laborCost: number;
  otherFixedCost: number;
  paymentFeeRate: number;
  packagingCostPerSale: number;
};

export type EventProduct = {
  id: string;
  name: string;
  price: number;
  unitCost: number;
  broughtQuantity: number;
  expectedSellThroughRate: number;
};

export type EventProductResult = EventProduct & {
  expectedSoldQuantity: number;
  expectedRevenue: number;
  contributionPerSale: number;
  expectedContribution: number;
  soldOutContribution: number;
  inventoryCost: number;
};

export type EventProfitResult = {
  fixedCosts: number;
  expectedSoldQuantity: number;
  expectedRevenue: number;
  expectedProfit: number;
  soldOutRevenue: number;
  soldOutProfit: number;
  inventoryCost: number;
  breakEvenQuantity: number;
  breakEvenRevenue: number;
  canBreakEvenWithInventory: boolean;
  productResults: EventProductResult[];
};

export function calculateEventProfit(
  inputs: EventCostInputs,
  products: EventProduct[],
): EventProfitResult {
  const fixedCosts =
    inputs.boothFee +
    inputs.travelCost +
    inputs.fixtureCost +
    inputs.laborCost +
    inputs.otherFixedCost;
  const feeRate = inputs.paymentFeeRate / 100;
  const productResults = products.slice(0, 3).map((product) => {
    const expectedSoldQuantity =
      product.broughtQuantity * (product.expectedSellThroughRate / 100);
    const contributionPerSale =
      product.price -
      product.unitCost -
      product.price * feeRate -
      inputs.packagingCostPerSale;
    return {
      ...product,
      expectedSoldQuantity,
      expectedRevenue: expectedSoldQuantity * product.price,
      contributionPerSale,
      expectedContribution: expectedSoldQuantity * contributionPerSale,
      soldOutContribution: product.broughtQuantity * contributionPerSale,
      inventoryCost: product.broughtQuantity * product.unitCost,
    };
  });
  const expectedSoldQuantity = productResults.reduce(
    (sum, product) => sum + product.expectedSoldQuantity,
    0,
  );
  const expectedRevenue = productResults.reduce(
    (sum, product) => sum + product.expectedRevenue,
    0,
  );
  const expectedContribution = productResults.reduce(
    (sum, product) => sum + product.expectedContribution,
    0,
  );
  const soldOutRevenue = productResults.reduce(
    (sum, product) => sum + product.price * product.broughtQuantity,
    0,
  );
  const soldOutContribution = productResults.reduce(
    (sum, product) => sum + product.soldOutContribution,
    0,
  );
  const inventoryCost = productResults.reduce(
    (sum, product) => sum + product.inventoryCost,
    0,
  );
  const averageContribution =
    expectedSoldQuantity > 0 ? expectedContribution / expectedSoldQuantity : 0;
  const averagePrice =
    expectedSoldQuantity > 0 ? expectedRevenue / expectedSoldQuantity : 0;
  const breakEvenQuantity =
    averageContribution > 0 ? Math.ceil(fixedCosts / averageContribution) : 0;
  const totalBroughtQuantity = productResults.reduce(
    (sum, product) => sum + product.broughtQuantity,
    0,
  );

  return {
    fixedCosts,
    expectedSoldQuantity,
    expectedRevenue,
    expectedProfit: expectedContribution - fixedCosts,
    soldOutRevenue,
    soldOutProfit: soldOutContribution - fixedCosts,
    inventoryCost,
    breakEvenQuantity,
    breakEvenRevenue: breakEvenQuantity * averagePrice,
    canBreakEvenWithInventory:
      averageContribution > 0 && breakEvenQuantity <= totalBroughtQuantity,
    productResults,
  };
}

export function createEventProfitCsv(result: EventProfitResult) {
  const rows: Array<Array<string | number>> = [
    ["項目", "値"],
    ["固定費合計", Math.round(result.fixedCosts)],
    ["損益分岐売上（目安）", Math.round(result.breakEvenRevenue)],
    ["必要販売数（目安）", result.breakEvenQuantity],
    ["想定販売数", result.expectedSoldQuantity.toFixed(1)],
    ["想定売上", Math.round(result.expectedRevenue)],
    ["想定利益", Math.round(result.expectedProfit)],
    ["完売時売上", Math.round(result.soldOutRevenue)],
    ["完売時利益", Math.round(result.soldOutProfit)],
    ["持込在庫原価", Math.round(result.inventoryCost)],
    [],
    [
      "商品",
      "販売単価",
      "原価",
      "持込数",
      "想定販売率",
      "想定販売数",
      "想定売上",
      "1点当たり限界利益",
    ],
    ...result.productResults.map((product) => [
      product.name,
      product.price,
      product.unitCost,
      product.broughtQuantity,
      `${product.expectedSellThroughRate}%`,
      product.expectedSoldQuantity.toFixed(1),
      Math.round(product.expectedRevenue),
      Math.round(product.contributionPerSale),
    ]),
  ];

  return rows
    .map((row) =>
      row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","),
    )
    .join("\r\n");
}
