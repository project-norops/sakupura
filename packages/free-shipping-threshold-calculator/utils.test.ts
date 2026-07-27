import { compareShippingThresholds } from "./utils";

test("compares current profit with eligible free-shipping scenarios", () => {
  const [result] = compareShippingThresholds({
    averageOrderAmount: 3000,
    grossMarginRate: 40,
    shippingCost: 700,
    paymentFeeRate: 3.6,
    scenarios: [{ id: "a", threshold: 4000, expectedAddition: 1000 }],
  });
  expect(result.requiredAddition).toBe(1000);
  expect(result.projectedOrderAmount).toBe(4000);
  expect(result.qualifies).toBe(true);
  expect(result.profitPerOrder).toBeCloseTo(756);
  expect(result.profitDifference).toBeCloseTo(-336);
});

test("reports the amount still needed when the projected order misses the line", () => {
  const [result] = compareShippingThresholds({
    averageOrderAmount: 3000,
    grossMarginRate: 40,
    shippingCost: 700,
    paymentFeeRate: 3.6,
    scenarios: [{ id: "a", threshold: 5000, expectedAddition: 800 }],
  });
  expect(result.qualifies).toBe(false);
  expect(result.shortfall).toBe(1200);
});
