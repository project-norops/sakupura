import { calculateReorderPoint } from "./utils";

test("calculates the sample with weekly sales converted to daily sales", () => {
  const result = calculateReorderPoint({
    averageWeeklySales: 10,
    maximumWeeklySales: 16,
    averageLeadTimeDays: 5,
    maximumLeadTimeDays: 7,
    currentStock: 8,
    incomingStock: 0,
  });

  expect(result.averageDailySales).toBeCloseTo(10 / 7);
  expect(result.safetyStock).toBe(9);
  expect(result.reorderPoint).toBe(16);
  expect(result.daysUntilReorder).toBe(0);
  expect(result.recommendedOrderQuantity).toBe(18);
  expect(result.status).toBe("now");
});

test("includes incoming stock when calculating the next reorder timing", () => {
  const result = calculateReorderPoint({
    averageWeeklySales: 14,
    maximumWeeklySales: 14,
    averageLeadTimeDays: 3,
    maximumLeadTimeDays: 3,
    currentStock: 10,
    incomingStock: 7,
  });

  expect(result.safetyStock).toBe(0);
  expect(result.reorderPoint).toBe(6);
  expect(result.daysUntilReorder).toBeCloseTo(5.5);
  expect(result.status).toBe("later");
});
