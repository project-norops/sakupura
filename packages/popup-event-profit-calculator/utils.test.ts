import {
  calculateEventProfit,
  createEventProfitCsv,
  type EventCostInputs,
  type EventProduct,
} from "./utils";

const costs: EventCostInputs = {
  boothFee: 12000,
  travelCost: 6000,
  fixtureCost: 3000,
  laborCost: 7000,
  otherFixedCost: 2000,
  paymentFeeRate: 3.6,
  packagingCostPerSale: 100,
};

const products: EventProduct[] = [
  {
    id: "a",
    name: "アクセサリー",
    price: 2500,
    unitCost: 800,
    broughtQuantity: 20,
    expectedSellThroughRate: 70,
  },
  {
    id: "b",
    name: "ポストカード",
    price: 800,
    unitCost: 200,
    broughtQuantity: 30,
    expectedSellThroughRate: 60,
  },
  {
    id: "c",
    name: "トートバッグ",
    price: 3200,
    unitCost: 1200,
    broughtQuantity: 12,
    expectedSellThroughRate: 50,
  },
];

test("calculates break-even, expected profit, and sold-out profit", () => {
  const result = calculateEventProfit(costs, products);
  expect(result.fixedCosts).toBe(30000);
  expect(result.expectedSoldQuantity).toBe(38);
  expect(result.expectedRevenue).toBe(68600);
  expect(result.expectedProfit).toBeCloseTo(10330.4);
  expect(result.soldOutProfit).toBeCloseTo(35753.6);
  expect(result.inventoryCost).toBe(36400);
  expect(result.breakEvenQuantity).toBe(29);
  expect(result.canBreakEvenWithInventory).toBe(true);
});

test("limits products to three and detects an impossible inventory plan", () => {
  const expensiveCosts = { ...costs, boothFee: 200000 };
  const result = calculateEventProfit(expensiveCosts, [
    ...products,
    {
      id: "d",
      name: "対象外",
      price: 10000,
      unitCost: 0,
      broughtQuantity: 100,
      expectedSellThroughRate: 100,
    },
  ]);
  expect(result.productResults).toHaveLength(3);
  expect(result.canBreakEvenWithInventory).toBe(false);
});

test("creates a quoted result and product CSV", () => {
  const csv = createEventProfitCsv(calculateEventProfit(costs, products));
  expect(csv).toContain('"必要販売数（目安）","29"');
  expect(csv).toContain('"想定利益","10330"');
  expect(csv).toContain('"アクセサリー","2500","800","20","70%"');
});
