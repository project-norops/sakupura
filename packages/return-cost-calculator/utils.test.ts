import {
  calculateReturnScenario,
  compareReturnScenarios,
  createReturnResultsCsv,
  type ReturnCostInputs,
} from "./utils";

const inputs: ReturnCostInputs = {
  orderCount: 100,
  averageOrderAmount: 4500,
  productCostPerOrder: 1600,
  outboundShippingPerOrder: 500,
  paymentFeeRate: 3.6,
  returnShippingPerReturn: 700,
  inspectionCostPerReturn: 300,
};

test("calculates refund, recovered inventory, and profit impact", () => {
  const result = calculateReturnScenario(inputs, {
    id: "current",
    name: "現在",
    returnRate: 8,
    resalableRate: 50,
  });

  expect(result.returnedOrders).toBe(8);
  expect(result.refundedAmount).toBe(36000);
  expect(result.recoveredInventoryCost).toBe(6400);
  expect(result.returnHandlingCost).toBe(8000);
  expect(result.profitAfterReturns).toBe(186200);
  expect(result.lossFromReturns).toBe(37600);
  expect(result.costPerReturn).toBe(4700);
});

test("limits comparison to three scenarios and handles zero returns", () => {
  const results = compareReturnScenarios(inputs, [
    { id: "a", name: "返品なし", returnRate: 0, resalableRate: 0 },
    { id: "b", name: "B", returnRate: 2, resalableRate: 50 },
    { id: "c", name: "C", returnRate: 4, resalableRate: 50 },
    { id: "d", name: "D", returnRate: 6, resalableRate: 50 },
  ]);

  expect(results).toHaveLength(3);
  expect(results[0].costPerReturn).toBe(0);
  expect(results[0].lossFromReturns).toBe(0);
});

test("creates a quoted comparison CSV", () => {
  const result = calculateReturnScenario(inputs, {
    id: "current",
    name: "現在",
    returnRate: 8,
    resalableRate: 50,
  });
  const csv = createReturnResultsCsv([result]);
  expect(csv).toContain('"シナリオ","返品率"');
  expect(csv).toContain('"現在","8%","50%","8.0"');
  expect(csv).toContain('"186200","37600","4700"');
});
