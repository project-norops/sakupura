import { calculateLaborPlan } from "./utils";

test("calculates labor sales and labor cost for the sample", () => {
  const result = calculateLaborPlan(
    [
      {
        id: "lunch",
        label: "ランチ",
        expectedSales: 60000,
        people: 4,
        hoursPerPerson: 3,
        hourlyWage: 1200,
        ancillaryRate: 15,
      },
    ],
    { laborSalesPerHour: 5000, laborCostRatio: 30 },
  );
  expect(result.totalStaffHours).toBe(12);
  expect(result.totalLaborCost).toBeCloseTo(16560);
  expect(result.laborSalesPerHour).toBe(5000);
  expect(result.laborCostRatio).toBeCloseTo(27.6);
  expect(result.slots[0].laborSalesGap).toBe(0);
  expect(result.slots[0].laborCostRatioGap).toBeCloseTo(-2.4);
});

test("aggregates multiple time slots using total sales and hours", () => {
  const result = calculateLaborPlan(
    [
      {
        id: "a",
        label: "A",
        expectedSales: 60000,
        people: 4,
        hoursPerPerson: 3,
        hourlyWage: 1200,
        ancillaryRate: 0,
      },
      {
        id: "b",
        label: "B",
        expectedSales: 24000,
        people: 2,
        hoursPerPerson: 3,
        hourlyWage: 1200,
        ancillaryRate: 0,
      },
    ],
    { laborSalesPerHour: 5000, laborCostRatio: 30 },
  );
  expect(result.totalSales).toBe(84000);
  expect(result.totalStaffHours).toBe(18);
  expect(result.laborSalesPerHour).toBeCloseTo(4666.67, 1);
});
