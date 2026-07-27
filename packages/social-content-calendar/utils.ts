export type CalendarEntry = {
  id: string;
  date: string;
  platform: "X" | "Instagram" | "Facebook" | "その他";
  theme: string;
  purpose: string;
  assetStatus: "未着手" | "準備中" | "準備完了";
  cta: string;
  memo: string;
};

function csvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

export function entriesToCsv(entries: CalendarEntry[]) {
  const header = [
    "投稿日",
    "媒体",
    "テーマ",
    "目的",
    "素材状態",
    "CTA",
    "投稿メモ",
  ];
  const rows = entries.map((entry) =>
    [
      entry.date,
      entry.platform,
      entry.theme,
      entry.purpose,
      entry.assetStatus,
      entry.cta,
      entry.memo,
    ]
      .map(csvCell)
      .join(","),
  );
  return `\uFEFF${[header.map(csvCell).join(","), ...rows].join("\r\n")}`;
}

function icsText(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("\n", "\\n")
    .replaceAll(",", "\\,")
    .replaceAll(";", "\\;");
}

export function entriesToIcs(entries: CalendarEntry[]) {
  const events = entries.flatMap((entry) => {
    const date = entry.date.replaceAll("-", "");
    return [
      "BEGIN:VEVENT",
      `UID:${icsText(entry.id)}@norops.jp`,
      `DTSTART;VALUE=DATE:${date}`,
      `DTEND;VALUE=DATE:${date}`,
      `SUMMARY:${icsText(`[${entry.platform}] ${entry.theme || "SNS投稿"}`)}`,
      `DESCRIPTION:${icsText(`目的: ${entry.purpose}\nCTA: ${entry.cta}\n素材: ${entry.assetStatus}\n${entry.memo}`)}`,
      "END:VEVENT",
    ];
  });
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//norops.jp//Social Content Calendar//JA",
    "CALSCALE:GREGORIAN",
    ...events,
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}

export function moveEntry(
  entries: CalendarEntry[],
  id: string,
  direction: -1 | 1,
) {
  const index = entries.findIndex((entry) => entry.id === id);
  const nextIndex = index + direction;
  if (index < 0 || nextIndex < 0 || nextIndex >= entries.length) return entries;
  const next = [...entries];
  [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
  return next;
}

export function summarizeEntries(entries: CalendarEntry[]) {
  const platformCounts = entries.reduce<Record<string, number>>(
    (counts, entry) => ({
      ...counts,
      [entry.platform]: (counts[entry.platform] ?? 0) + 1,
    }),
    {},
  );
  const incompleteCount = entries.filter(
    (entry) =>
      !entry.date ||
      !entry.theme.trim() ||
      !entry.purpose.trim() ||
      !entry.cta.trim() ||
      entry.assetStatus !== "準備完了",
  ).length;
  return { platformCounts, incompleteCount };
}
