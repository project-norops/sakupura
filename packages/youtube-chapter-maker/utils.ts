export type Chapter = { id: string; time: string; title: string };

export type ChapterIssue = {
  index: number | null;
  message: string;
};

export function parseChapterTime(value: string): number | null {
  const parts = value.trim().split(":");
  if (
    parts.length < 2 ||
    parts.length > 3 ||
    parts.some((part) => !/^\d+$/.test(part))
  )
    return null;
  const numbers = parts.map(Number);
  const seconds = numbers.pop() ?? 0;
  const minutes = numbers.pop() ?? 0;
  const hours = numbers.pop() ?? 0;
  if (seconds > 59 || minutes > 59) return null;
  return hours * 3600 + minutes * 60 + seconds;
}

export function formatChapterTime(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    : `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function validateChapters(chapters: Chapter[]): ChapterIssue[] {
  const issues: ChapterIssue[] = [];
  if (chapters.length < 3) {
    issues.push({
      index: null,
      message: "YouTubeの手動チャプターには3件以上のタイムスタンプが必要です。",
    });
  }
  const seconds = chapters.map((chapter, index) => {
    const parsed = parseChapterTime(chapter.time);
    if (parsed === null)
      issues.push({
        index,
        message: "時刻は 0:00 または 1:02:03 の形式で入力してください。",
      });
    if (!chapter.title.trim())
      issues.push({ index, message: "章タイトルを入力してください。" });
    return parsed;
  });
  if (seconds[0] !== null && seconds[0] !== 0) {
    issues.push({
      index: 0,
      message: "最初のチャプターは0:00から開始してください。",
    });
  }
  seconds.forEach((current, index) => {
    if (index === 0 || current === null) return;
    const previous = seconds[index - 1];
    if (previous === null) return;
    if (current <= previous) {
      issues.push({
        index,
        message: "前のチャプターより後の時刻を入力してください。",
      });
    } else if (current - previous < 10) {
      issues.push({
        index,
        message: "前のチャプターから10秒以上空けてください。",
      });
    }
  });
  return issues;
}

export function buildChapterText(chapters: Chapter[]): string {
  return chapters
    .map((chapter) => {
      const seconds = parseChapterTime(chapter.time);
      return `${seconds === null ? chapter.time.trim() : formatChapterTime(seconds)} ${chapter.title.trim()}`;
    })
    .join("\n");
}

export function buildChapterUrl(
  videoUrl: string,
  seconds: number,
): string | null {
  try {
    const url = new URL(videoUrl.trim());
    if (!/^https?:$/.test(url.protocol)) return null;
    url.searchParams.set("t", `${Math.max(0, Math.floor(seconds))}s`);
    return url.toString();
  } catch {
    return null;
  }
}
