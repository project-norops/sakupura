export type Frequency = "weekly" | "monthly" | "days";
export type RoutineTask = {
  id: string;
  title: string;
  frequency: Frequency;
  interval: number;
  nextDue: string;
  completedCount: number;
};

function parseDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function nextDueDate(
  current: string,
  frequency: Frequency,
  interval = 1,
): string {
  const date = parseDate(current);
  if (frequency === "weekly") date.setUTCDate(date.getUTCDate() + 7);
  if (frequency === "days")
    date.setUTCDate(date.getUTCDate() + Math.max(1, interval));
  if (frequency === "monthly") {
    const originalDay = date.getUTCDate();
    date.setUTCDate(1);
    date.setUTCMonth(date.getUTCMonth() + 1);
    const lastDay = new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0),
    ).getUTCDate();
    date.setUTCDate(Math.min(originalDay, lastDay));
  }
  return formatDate(date);
}

export function completeTask(task: RoutineTask): RoutineTask {
  return {
    ...task,
    nextDue: nextDueDate(task.nextDue, task.frequency, task.interval),
    completedCount: task.completedCount + 1,
  };
}

export function dueLabel(
  nextDue: string,
  today: string,
): "期限切れ" | "今日" | "予定" {
  if (nextDue < today) return "期限切れ";
  if (nextDue === today) return "今日";
  return "予定";
}
