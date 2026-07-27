export type CapacityProject = {
  id: string;
  name: string;
  plannedHours: number;
  reward: number;
};

export type CapacityInputs = {
  month: string;
  holidayWeekdays: number;
  hoursPerDay: number;
  nonBillableHours: number;
  salesTarget: number;
  projects: CapacityProject[];
};

export type CapacityResult = {
  weekdays: number;
  workingDays: number;
  grossHours: number;
  capacityHours: number;
  plannedHours: number;
  remainingHours: number;
  utilizationRate: number;
  expectedSales: number;
  salesGap: number;
};

export function countWeekdays(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  if (!year || !monthNumber || monthNumber < 1 || monthNumber > 12) return 0;
  const lastDay = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  let count = 0;
  for (let day = 1; day <= lastDay; day += 1) {
    const weekday = new Date(Date.UTC(year, monthNumber - 1, day)).getUTCDay();
    if (weekday !== 0 && weekday !== 6) count += 1;
  }
  return count;
}

export function calculateCapacity(inputs: CapacityInputs): CapacityResult {
  const weekdays = countWeekdays(inputs.month);
  const workingDays = Math.max(0, weekdays - inputs.holidayWeekdays);
  const grossHours = workingDays * inputs.hoursPerDay;
  const capacityHours = Math.max(0, grossHours - inputs.nonBillableHours);
  const plannedHours = inputs.projects.reduce(
    (sum, project) => sum + project.plannedHours,
    0,
  );
  const expectedSales = inputs.projects.reduce(
    (sum, project) => sum + project.reward,
    0,
  );

  return {
    weekdays,
    workingDays,
    grossHours,
    capacityHours,
    plannedHours,
    remainingHours: capacityHours - plannedHours,
    utilizationRate:
      capacityHours > 0 ? (plannedHours / capacityHours) * 100 : 0,
    expectedSales,
    salesGap: expectedSales - inputs.salesTarget,
  };
}
