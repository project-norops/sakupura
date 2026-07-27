export type LaborSlot = {
  id: string;
  label: string;
  expectedSales: number;
  people: number;
  hoursPerPerson: number;
  hourlyWage: number;
  ancillaryRate: number;
};

export type LaborTargets = {
  laborSalesPerHour: number;
  laborCostRatio: number;
};

export type LaborSlotResult = LaborSlot & {
  staffHours: number;
  laborCost: number;
  laborSalesPerHour: number;
  laborCostRatio: number;
  laborSalesGap: number;
  laborCostRatioGap: number;
};

export type LaborPlanResult = {
  slots: LaborSlotResult[];
  totalSales: number;
  totalStaffHours: number;
  totalLaborCost: number;
  laborSalesPerHour: number;
  laborCostRatio: number;
};

export function calculateLaborPlan(
  slots: LaborSlot[],
  targets: LaborTargets,
): LaborPlanResult {
  const calculated = slots.map((slot) => {
    const staffHours = slot.people * slot.hoursPerPerson;
    const laborCost =
      staffHours * slot.hourlyWage * (1 + slot.ancillaryRate / 100);
    const laborSalesPerHour = slot.expectedSales / staffHours;
    const laborCostRatio = (laborCost / slot.expectedSales) * 100;

    return {
      ...slot,
      staffHours,
      laborCost,
      laborSalesPerHour,
      laborCostRatio,
      laborSalesGap: laborSalesPerHour - targets.laborSalesPerHour,
      laborCostRatioGap: laborCostRatio - targets.laborCostRatio,
    };
  });

  const totalSales = calculated.reduce(
    (sum, slot) => sum + slot.expectedSales,
    0,
  );
  const totalStaffHours = calculated.reduce(
    (sum, slot) => sum + slot.staffHours,
    0,
  );
  const totalLaborCost = calculated.reduce(
    (sum, slot) => sum + slot.laborCost,
    0,
  );

  return {
    slots: calculated,
    totalSales,
    totalStaffHours,
    totalLaborCost,
    laborSalesPerHour: totalSales / totalStaffHours,
    laborCostRatio: (totalLaborCost / totalSales) * 100,
  };
}
