import { addDays, createLaunchPlan, tasksToIcs, tasksToText } from "./utils";

test("creates a product-specific plan by counting back from launch day", () => {
  const tasks = createLaunchPlan({
    type: "digital_product",
    launchDate: "2026-08-11",
    stage: "core_ready",
    today: "2026-07-28",
  });
  expect(tasks[0]).toMatchObject({
    title: "収録内容と購入者像を確定",
    date: "2026-07-28",
    completed: true,
  });
  expect(tasks.find((task) => task.id === "sales-page")).toMatchObject({
    date: "2026-08-04",
    completed: false,
  });
  expect(tasks.at(-1)?.date).toBe("2026-08-12");
});

test("uses different work for commission and stream launches", () => {
  const commission = createLaunchPlan({
    type: "commission",
    launchDate: "2026-08-10",
    stage: "not_started",
    today: "2026-07-28",
  });
  const stream = createLaunchPlan({
    type: "stream_event",
    launchDate: "2026-08-10",
    stage: "not_started",
    today: "2026-07-28",
  });
  expect(commission.some((task) => task.title.includes("依頼フォーム"))).toBe(
    true,
  );
  expect(stream.some((task) => task.title.includes("テスト配信"))).toBe(true);
});

test("marks an unfinished past task as a delay candidate", () => {
  const tasks = createLaunchPlan({
    type: "digital_product",
    launchDate: "2026-07-30",
    stage: "not_started",
    today: "2026-07-28",
  });
  expect(tasks.filter((task) => task.overdue).length).toBeGreaterThan(0);
});

test("creates valid all-day ICS events and copy text", () => {
  const tasks = createLaunchPlan({
    type: "commission",
    launchDate: "2026-08-10",
    stage: "not_started",
    today: "2026-07-28",
  });
  const ics = tasksToIcs(tasks, "秋の受付");
  expect(ics).toContain("BEGIN:VCALENDAR");
  expect(ics).toContain("DTSTART;VALUE=DATE:20260731");
  expect(ics).toContain("SUMMARY:[秋の受付] 募集内容と受付対象を確定");
  expect(tasksToText(tasks, "秋の受付", "commission")).toContain(
    "[ ] 2026-07-31",
  );
});

test("adds days without UTC date shifts", () => {
  expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
});
