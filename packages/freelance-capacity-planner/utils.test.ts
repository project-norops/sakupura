import { calculateCapacity, countWeekdays } from "./utils";

test("counts weekdays for the selected month", () => {
  expect(countWeekdays("2026-08")).toBe(21);
});

test("calculates capacity, utilization, remaining hours, and sales gap", () => {
  const result = calculateCapacity({
    month: "2026-08",
    holidayWeekdays: 1,
    hoursPerDay: 7,
    nonBillableHours: 28,
    salesTarget: 600000,
    projects: [
      { id: "a", name: "A", plannedHours: 60, reward: 300000 },
      { id: "b", name: "B", plannedHours: 28, reward: 140000 },
    ],
  });
  expect(result.capacityHours).toBe(112);
  expect(result.plannedHours).toBe(88);
  expect(result.remainingHours).toBe(24);
  expect(result.utilizationRate).toBeCloseTo(78.57, 1);
  expect(result.expectedSales).toBe(440000);
  expect(result.salesGap).toBe(-160000);
});
