export type SubtitleFormat = "srt" | "vtt";

export type SubtitleCue = {
  index: number;
  startMs: number;
  endMs: number;
  text: string;
};

export type SubtitleIssue = {
  level: "error" | "warning";
  cue: number | null;
  message: string;
};

export type SubtitleParseResult = {
  format: SubtitleFormat;
  cues: SubtitleCue[];
  issues: SubtitleIssue[];
};

const TIMING_PATTERN = /^(.+?)\s+-->\s+([^\s]+)(?:\s+.*)?$/;

export function parseTimecode(value: string): number | null {
  const normalized = value.trim().replace(",", ".");
  const match = normalized.match(/^(?:(\d{1,3}):)?(\d{2}):(\d{2})\.(\d{3})$/);
  if (!match) return null;
  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2]);
  const seconds = Number(match[3]);
  const milliseconds = Number(match[4]);
  if (minutes > 59 || seconds > 59) return null;
  return ((hours * 60 + minutes) * 60 + seconds) * 1000 + milliseconds;
}

export function formatTimecode(ms: number, format: SubtitleFormat): string {
  const safe = Math.max(0, Math.round(ms));
  const hours = Math.floor(safe / 3_600_000);
  const minutes = Math.floor((safe % 3_600_000) / 60_000);
  const seconds = Math.floor((safe % 60_000) / 1000);
  const milliseconds = safe % 1000;
  const separator = format === "srt" ? "," : ".";
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}${separator}${String(milliseconds).padStart(3, "0")}`;
}

export function parseSubtitle(source: string): SubtitleParseResult {
  const normalized = source
    .replace(/^\uFEFF/, "")
    .replace(/\r\n?/g, "\n")
    .trim();
  const format: SubtitleFormat = normalized.startsWith("WEBVTT")
    ? "vtt"
    : "srt";
  const issues: SubtitleIssue[] = [];
  if (!normalized) {
    return {
      format,
      cues: [],
      issues: [
        { level: "error", cue: null, message: "字幕が入力されていません。" },
      ],
    };
  }

  const blocks = normalized.split(/\n{2,}/).filter(Boolean);
  if (format === "vtt" && blocks[0]?.startsWith("WEBVTT")) blocks.shift();
  const cues: SubtitleCue[] = [];

  blocks.forEach((block, blockIndex) => {
    const lines = block.split("\n");
    if (lines[0]?.startsWith("NOTE")) return;
    const timingIndex = lines.findIndex((line) => line.includes("-->"));
    if (timingIndex < 0) {
      issues.push({
        level: "error",
        cue: blockIndex + 1,
        message: "開始時刻と終了時刻の行が見つかりません。",
      });
      return;
    }
    const timing = lines[timingIndex].match(TIMING_PATTERN);
    const startMs = timing ? parseTimecode(timing[1]) : null;
    const endMs = timing ? parseTimecode(timing[2]) : null;
    if (startMs === null || endMs === null) {
      issues.push({
        level: "error",
        cue: blockIndex + 1,
        message:
          "時刻は 00:00:00,000 または 00:00:00.000 の形式で入力してください。",
      });
      return;
    }
    const rawIndex = Number(lines[0]);
    const index =
      Number.isInteger(rawIndex) && timingIndex > 0
        ? rawIndex
        : cues.length + 1;
    const text = lines
      .slice(timingIndex + 1)
      .join("\n")
      .trim();
    const cueNumber = index || blockIndex + 1;
    if (!text) {
      issues.push({
        level: "warning",
        cue: cueNumber,
        message: "字幕本文が空です。",
      });
    }
    if (endMs <= startMs) {
      issues.push({
        level: "error",
        cue: cueNumber,
        message: "終了時刻は開始時刻より後にしてください。",
      });
    }
    cues.push({ index: cueNumber, startMs, endMs, text });
  });

  cues.forEach((cue, index) => {
    const previous = cues[index - 1];
    if (format === "srt" && cue.index !== index + 1) {
      issues.push({
        level: "warning",
        cue: cue.index,
        message: `連番が${index + 1}になっていません。保存時に振り直します。`,
      });
    }
    if (previous && cue.startMs < previous.startMs) {
      issues.push({
        level: "error",
        cue: cue.index,
        message: "開始時刻が前の字幕より早くなっています。",
      });
    } else if (previous && cue.startMs < previous.endMs) {
      issues.push({
        level: "warning",
        cue: cue.index,
        message: "前の字幕と表示時間が重なっています。",
      });
    }
  });

  if (cues.length === 0 && !issues.some((issue) => issue.level === "error")) {
    issues.push({
      level: "error",
      cue: null,
      message: "有効な字幕を読み取れませんでした。",
    });
  }
  return { format, cues, issues };
}

export function shiftCues(cues: SubtitleCue[], requestedMs: number) {
  const finite = Number.isFinite(requestedMs) ? Math.round(requestedMs) : 0;
  const earliest = Math.min(...cues.map((cue) => cue.startMs));
  const appliedMs = cues.length === 0 ? 0 : Math.max(finite, -earliest);
  return {
    appliedMs,
    cues: cues.map((cue, index) => ({
      ...cue,
      index: index + 1,
      startMs: cue.startMs + appliedMs,
      endMs: cue.endMs + appliedMs,
    })),
  };
}

export function updateCueTiming(
  cues: SubtitleCue[],
  position: number,
  startMs: number,
  endMs: number,
): SubtitleCue[] {
  if (
    position < 0 ||
    position >= cues.length ||
    !Number.isFinite(startMs) ||
    !Number.isFinite(endMs) ||
    startMs < 0 ||
    endMs < 0
  ) {
    return cues;
  }

  return cues.map((cue, index) =>
    index === position
      ? { ...cue, startMs: Math.round(startMs), endMs: Math.round(endMs) }
      : cue,
  );
}

export function formatSubtitle(
  cues: SubtitleCue[],
  format: SubtitleFormat,
): string {
  const body = cues
    .map((cue, index) => {
      const timing = `${formatTimecode(cue.startMs, format)} --> ${formatTimecode(cue.endMs, format)}`;
      return format === "srt"
        ? `${index + 1}\n${timing}\n${cue.text}`
        : `${timing}\n${cue.text}`;
    })
    .join("\n\n");
  return format === "vtt" ? `WEBVTT\n\n${body}\n` : `${body}\n`;
}
