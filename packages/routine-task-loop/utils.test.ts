import {
  completeTask,
  dueLabel,
  nextDueDate,
  undoCompleteTask,
  type RoutineTask,
} from "./utils";

describe("定期タスクの日付計算", () => {
  test("週次は7日後、指定日数はその日数後", () => {
    expect(nextDueDate("2026-07-26", "weekly")).toBe("2026-08-02");
    expect(nextDueDate("2026-07-26", "days", 3)).toBe("2026-07-29");
  });

  test("月末は翌月の最終日に丸める", () => {
    expect(nextDueDate("2025-01-31", "monthly")).toBe("2025-02-28");
    expect(nextDueDate("2024-01-31", "monthly")).toBe("2024-02-29");
  });

  test("完了回数と次回日を更新する", () => {
    const task: RoutineTask = {
      id: "1",
      title: "請求書",
      frequency: "monthly",
      interval: 1,
      nextDue: "2026-07-15",
      completedCount: 2,
    };
    expect(completeTask(task)).toMatchObject({
      previousDue: "2026-07-15",
      nextDue: "2026-08-15",
      completedCount: 3,
    });
  });

  test("直前の完了を取り消すと予定日と完了回数を戻す", () => {
    const task: RoutineTask = {
      id: "1",
      title: "請求書",
      frequency: "monthly",
      interval: 1,
      nextDue: "2026-07-15",
      completedCount: 2,
    };
    expect(undoCompleteTask(completeTask(task))).toEqual(task);
  });

  test("取り消せる完了がない場合は変更しない", () => {
    const task: RoutineTask = {
      id: "1",
      title: "請求書",
      frequency: "monthly",
      interval: 1,
      nextDue: "2026-07-15",
      completedCount: 0,
    };
    expect(undoCompleteTask(task)).toBe(task);
  });

  test("期限状態を分類する", () => {
    expect(dueLabel("2026-07-25", "2026-07-26")).toBe("期限切れ");
    expect(dueLabel("2026-07-26", "2026-07-26")).toBe("今日");
  });
});
