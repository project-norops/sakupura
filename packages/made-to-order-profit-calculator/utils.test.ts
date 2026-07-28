import {
  compareProductionScenarios,
  resultsToCsv,
  type ProfitInputs,
} from "./utils";

const inputs: ProfitInputs = {
  sellingPrice: 1800,
  fixedCost: 5000,
  packagingCost: 120,
  salesFeeRate: 5,
  shippingCost: 250,
  defectReserveRate: 5,
  scenarios: [
    { id: "30", quantity: 30, manufacturingCost: 21000 },
    { id: "50", quantity: 50, manufacturingCost: 30000 },
  ],
};

test("compares break-even orders and sellout profit by production lot", () => {
  const [lot30, lot50] = compareProductionScenarios(inputs);
  expect(lot30).toMatchObject({
    sellableQuantity: 28,
    reservedQuantity: 2,
    contributionPerOrder: 1340,
    breakEvenOrders: 20,
    breakEvenReachable: true,
    selloutProfit: 11520,
  });
  expect(lot50).toMatchObject({
    sellableQuantity: 47,
    breakEvenOrders: 27,
    selloutProfit: 27980,
  });
});

test("marks break-even as unreachable when sellable quantity is too small", () => {
  const [result] = compareProductionScenarios({
    ...inputs,
    fixedCost: 50000,
    scenarios: [{ id: "small", quantity: 10, manufacturingCost: 10000 }],
  });
  expect(result.breakEvenOrders).toBe(45);
  expect(result.breakEvenReachable).toBe(false);
  expect(result.selloutProfit).toBeLessThan(0);
});

test("creates a CSV with headings and calculated values", () => {
  const csv = resultsToCsv(compareProductionScenarios(inputs));
  expect(csv).toContain("製造数,製造原価合計,販売可能数");
  expect(csv).toContain("30,21000,28,2,20,50400,11520");
});
