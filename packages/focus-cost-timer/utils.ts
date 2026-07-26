export type WorkSession = {
  id: string;
  task: string;
  elapsedMs: number;
  hourlyRate: number;
  finishedAt: string;
};

export function calculateCost(elapsedMs: number, hourlyRate: number): number {
  if (!Number.isFinite(elapsedMs) || !Number.isFinite(hourlyRate)) return 0;
  return (Math.max(0, elapsedMs) / 3_600_000) * Math.max(0, hourlyRate);
}

export function formatDuration(elapsedMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

export function sessionCsv(sessions: WorkSession[]): string {
  const escape = (value: string) => `"${value.replaceAll('"', '""')}"`;
  return [
    "タスク,作業時間（秒）,時給,工数コスト,終了日時",
    ...sessions.map((session) =>
      [
        escape(session.task),
        Math.round(session.elapsedMs / 1000),
        session.hourlyRate,
        Math.round(calculateCost(session.elapsedMs, session.hourlyRate)),
        escape(session.finishedAt),
      ].join(","),
    ),
  ].join("\r\n");
}
