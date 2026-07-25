"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  calculateStats,
  calculateTwitterCharCount,
  applyFormatting,
  FormattingOptions,
  extractHashtags,
  getSampleText,
  PLATFORM_LIMITS,
} from "./utils";

type Platform = "twitter" | "instagram" | "linkedin";

interface HashtagGroup {
  id: string;
  name: string;
  hashtags: string[];
}

const STORAGE_KEYS = {
  draft: "social-text-formatter:draft",
  formatting: "social-text-formatter:formatting-options",
  groups: "social-text-formatter:hashtag-groups",
} as const;

function getLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocalStorage<T>(key: string, value: T): boolean {
  if (typeof window === "undefined") return false;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function getPlatformLimit(platform: Platform): number {
  switch (platform) {
    case "twitter":
      return PLATFORM_LIMITS.twitter;
    case "instagram":
      return PLATFORM_LIMITS.instagram;
    case "linkedin":
      return PLATFORM_LIMITS.linkedin;
    default:
      return PLATFORM_LIMITS.twitter;
  }
}

export function SocialTextFormatterPage() {
  const [text, setText] = useState("");
  const [platform, setPlatform] = useState<Platform>("twitter");
  const [formatting, setFormatting] = useState<FormattingOptions>({
    removeTrailingSpaces: true,
    trimEnds: true,
    reduceBlankLines: true,
    normalizeLineBreaks: true,
  });
  const [hashtagGroups, setHashtagGroups] = useState<HashtagGroup[]>([]);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [showNewGroupForm, setShowNewGroupForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupTags, setNewGroupTags] = useState("");

  // Load from LocalStorage on mount
  useEffect(() => {
    const savedText = getLocalStorage(STORAGE_KEYS.draft, "");
    const savedFormatting = getLocalStorage<FormattingOptions>(
      STORAGE_KEYS.formatting,
      formatting
    );
    const savedGroups = getLocalStorage<HashtagGroup[]>(
      STORAGE_KEYS.groups,
      []
    );

    if (savedText) setText(savedText);
    if (Object.keys(savedFormatting).length > 0) setFormatting(savedFormatting);
    if (savedGroups.length > 0) setHashtagGroups(savedGroups);
  }, []);

  // Auto-save text
  useEffect(() => {
    const timer = setTimeout(() => {
      setLocalStorage(STORAGE_KEYS.draft, text);
    }, 500);
    return () => clearTimeout(timer);
  }, [text]);

  // Auto-save formatting options
  useEffect(() => {
    setLocalStorage(STORAGE_KEYS.formatting, formatting);
  }, [formatting]);

  // Auto-save hashtag groups
  useEffect(() => {
    setLocalStorage(STORAGE_KEYS.groups, hashtagGroups);
  }, [hashtagGroups]);

  const stats = useMemo(() => calculateStats(text), [text]);
  const twitterInfo = useMemo(() => calculateTwitterCharCount(text), [text]);
  const formattedText = useMemo(
    () => applyFormatting(text, formatting),
    [text, formatting]
  );

  const platformLimit = getPlatformLimit(platform);
  const displayCharCount =
    platform === "twitter" ? twitterInfo.count : stats.charCount;
  const isOverLimit =
    platform === "twitter"
      ? twitterInfo.isOverLimit
      : displayCharCount > platformLimit;

  const handleCopy = useCallback(
    async (textToCopy: string, type: string) => {
      try {
        await navigator.clipboard.writeText(textToCopy);
        setCopiedType(type);
        setTimeout(() => setCopiedType(null), 2000);
      } catch {
        // Fallback for environments where clipboard API is not available
        alert("クリップボードへのアクセスが失敗しました。手動で選択・コピーしてください。");
      }
    },
    []
  );

  const handleInsertSample = useCallback(() => {
    setText(getSampleText());
  }, []);

  const handleClear = useCallback(() => {
    if (window.confirm("すべてのテキストを消去します。よろしいですか？")) {
      setText("");
    }
  }, []);

  const handleRevertToOriginal = useCallback(() => {
    // No-op: user can see original in preview
  }, []);

  const handleAddHashtagGroup = useCallback(() => {
    if (!newGroupName.trim() || !newGroupTags.trim()) return;

    const tags = newGroupTags
      .split("\n")
      .map((tag) => {
        const trimmed = tag.trim();
        return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
      })
      .filter((tag) => tag !== "#");

    if (tags.length === 0) return;

    const newGroup: HashtagGroup = {
      id: Date.now().toString(),
      name: newGroupName,
      hashtags: tags,
    };

    setHashtagGroups([...hashtagGroups, newGroup]);
    setNewGroupName("");
    setNewGroupTags("");
    setShowNewGroupForm(false);
  }, [newGroupName, newGroupTags, hashtagGroups]);

  const handleInsertGroup = useCallback(
    (group: HashtagGroup) => {
      const textToAdd = group.hashtags.join(" ");
      setText((prev) => `${prev}\n${textToAdd}`);
    },
    []
  );

  const handleDeleteGroup = useCallback((id: string) => {
    setHashtagGroups((prev) => prev.filter((g) => g.id !== id));
  }, []);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">
          {"SNS運用"}
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50 sm:text-4xl">
          {"SNS文章整形・文字数チェッカー"}
        </h1>
        <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">
          {"X、Instagram、LinkedIn向けの文章を、改行・空白・文字数・ハッシュタグを確認しながらブラウザ上で整形できます。"}
        </p>

        {/* Platform Tabs */}
        <div className="mt-8 flex gap-2 border-b border-slate-200 dark:border-slate-700">
          {(["twitter", "instagram", "linkedin"] as Platform[]).map((p) => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className={`px-4 py-3 font-medium transition-colors ${
                platform === p
                  ? "border-b-2 border-sky-600 text-sky-600"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              {p === "twitter"
                ? "X"
                : p === "instagram"
                  ? "Instagram"
                  : "LinkedIn"}
            </button>
          ))}
        </div>

        {/* Input Area */}
        <div className="mt-8 space-y-4">
          <div className="flex gap-2">
            <button
              onClick={handleInsertSample}
              className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
            >
              サンプル挿入
            </button>
            <button
              onClick={handleClear}
              className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
            >
              全消去
            </button>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="SNS投稿用のテキストを入力してください..."
            className="w-full min-h-64 rounded-lg border border-slate-300 bg-white p-4 font-mono text-sm dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
          />
        </div>

        {/* Statistics */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <StatBox label="文字数" value={displayCharCount} limit={platformLimit} isOver={isOverLimit} />
          <StatBox label="文字数（空白除）" value={stats.charCountWithoutSpaces} />
          <StatBox label="単語数" value={stats.wordCount} />
          <StatBox label="行数" value={stats.lineCount} />
          <StatBox label="段落数" value={stats.paragraphCount} />
          <StatBox label="ハッシュタグ" value={stats.hashtagCount} />
          <StatBox label="URL" value={stats.urlCount} />
          <StatBox label="@メンション" value={stats.mentionCount} />
        </div>

        {/* Formatting Options */}
        <div className="mt-8 space-y-4">
          <h3 className="font-semibold text-slate-950 dark:text-slate-50">
            整形オプション
          </h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formatting.removeTrailingSpaces ?? false}
                onChange={(e) =>
                  setFormatting({ ...formatting, removeTrailingSpaces: e.target.checked })
                }
                className="rounded"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                行末の空白を削除
              </span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formatting.trimEnds ?? false}
                onChange={(e) =>
                  setFormatting({ ...formatting, trimEnds: e.target.checked })
                }
                className="rounded"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                文頭・文末の空白を削除
              </span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formatting.reduceBlankLines ?? false}
                onChange={(e) =>
                  setFormatting({ ...formatting, reduceBlankLines: e.target.checked })
                }
                className="rounded"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                連続空行を整理（3行以上→2行）
              </span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formatting.normalizeLineBreaks ?? false}
                onChange={(e) =>
                  setFormatting({ ...formatting, normalizeLineBreaks: e.target.checked })
                }
                className="rounded"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                改行コードを統一
              </span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formatting.normalizeFullwidthSpaces ?? false}
                onChange={(e) =>
                  setFormatting({ ...formatting, normalizeFullwidthSpaces: e.target.checked })
                }
                className="rounded"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                連続全角スペースを整理
              </span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formatting.addBlankBeforeHashtags ?? false}
                onChange={(e) =>
                  setFormatting({ ...formatting, addBlankBeforeHashtags: e.target.checked })
                }
                className="rounded"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                ハッシュタグの前に空行を追加
              </span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formatting.moveHashtagsToEnd ?? false}
                onChange={(e) =>
                  setFormatting({ ...formatting, moveHashtagsToEnd: e.target.checked })
                }
                className="rounded"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                ハッシュタグを文末にまとめる
              </span>
            </label>
          </div>
        </div>

        {/* Preview */}
        <div className="mt-8 space-y-4">
          <h3 className="font-semibold text-slate-950 dark:text-slate-50">
            プレビュー
          </h3>
          <div className="grid gap-4 lg:grid-cols-2">
            <PreviewBox
              title="原文"
              content={text}
              onCopy={() => handleCopy(text, "original")}
              copied={copiedType === "original"}
            />
            <PreviewBox
              title="整形後"
              content={formattedText}
              onCopy={() => handleCopy(formattedText, "formatted")}
              copied={copiedType === "formatted"}
            />
          </div>
        </div>

        {/* Hashtag Groups */}
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-950 dark:text-slate-50">
              ハッシュタググループ
            </h3>
            <button
              onClick={() => setShowNewGroupForm(!showNewGroupForm)}
              className="rounded-lg bg-sky-600 px-3 py-1 text-sm font-medium text-white hover:bg-sky-700"
            >
              {showNewGroupForm ? "キャンセル" : "+ 新規"}
            </button>
          </div>

          {showNewGroupForm && (
            <div className="space-y-3 rounded-lg border border-slate-300 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-950">
              <input
                type="text"
                placeholder="グループ名"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              />
              <textarea
                placeholder="ハッシュタグを1行1つ入力（#は自動補完）"
                value={newGroupTags}
                onChange={(e) => setNewGroupTags(e.target.value)}
                className="w-full min-h-24 rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              />
              <button
                onClick={handleAddHashtagGroup}
                className="w-full rounded-lg bg-sky-600 px-4 py-2 font-medium text-white hover:bg-sky-700"
              >
                保存
              </button>
            </div>
          )}

          {hashtagGroups.length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              ハッシュタググループはまだ登録されていません
            </p>
          ) : (
            <div className="space-y-2">
              {hashtagGroups.map((group) => (
                <div
                  key={group.id}
                  className="flex items-center justify-between rounded-lg border border-slate-300 bg-slate-50 p-3 dark:border-slate-600 dark:bg-slate-950"
                >
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {group.name}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {group.hashtags.slice(0, 3).join(" ")}
                      {group.hashtags.length > 3
                        ? `... +${group.hashtags.length - 3}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleInsertGroup(group)}
                      className="rounded px-3 py-1 text-sm font-medium text-sky-600 hover:bg-sky-100 dark:hover:bg-sky-950"
                    >
                      挿入
                    </button>
                    <button
                      onClick={() => handleDeleteGroup(group.id)}
                      className="rounded px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-100 dark:hover:bg-red-950"
                    >
                      削除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function StatBox({
  label,
  value,
  limit,
  isOver,
}: {
  label: string;
  value: number;
  limit?: number;
  isOver?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        isOver
          ? "border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950"
          : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950"
      }`}
    >
      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
        {label}
      </p>
      <p
        className={`mt-1 text-xl font-semibold ${
          isOver
            ? "text-red-600 dark:text-red-400"
            : "text-slate-900 dark:text-slate-100"
        }`}
      >
        {value}
        {limit && <span className="text-sm font-normal text-slate-600 dark:text-slate-400"> / {limit}</span>}
      </p>
    </div>
  );
}

function PreviewBox({
  title,
  content,
  onCopy,
  copied,
}: {
  title: string;
  content: string;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div className="rounded-lg border border-slate-300 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-950">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="font-medium text-slate-900 dark:text-slate-100">{title}</h4>
        <button
          onClick={onCopy}
          className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
            copied
              ? "bg-green-600 text-white"
              : "bg-sky-600 text-white hover:bg-sky-700"
          }`}
        >
          {copied ? "✓ コピー完了" : "コピー"}
        </button>
      </div>
      <div className="whitespace-pre-wrap rounded bg-white p-3 font-mono text-sm text-slate-900 dark:bg-slate-900 dark:text-slate-100">
        {content || <span className="text-slate-400">（表示内容なし）</span>}
      </div>
    </div>
  );
}
