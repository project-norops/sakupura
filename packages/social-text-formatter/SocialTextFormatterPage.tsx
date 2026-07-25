"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  calculateStats,
  calculateTwitterCharCount,
  applyFormattingWithReport,
  FormattingOptions,
  FormattingResult,
  findDuplicateHashtags,
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

const DEFAULT_FORMATTING: FormattingOptions = {
  removeTrailingSpaces: true,
  trimEnds: true,
  reduceBlankLines: true,
  normalizeLineBreaks: true,
};

const DEMO_FORMATTING: FormattingOptions = {
  ...DEFAULT_FORMATTING,
  normalizeFullwidthSpaces: true,
  moveHashtagsToEnd: true,
  removeDuplicateHashtags: true,
};

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
  const [formattingResult, setFormattingResult] =
    useState<FormattingResult | null>(null);
  const [platform, setPlatform] = useState<Platform>("twitter");
  const [formatting, setFormatting] =
    useState<FormattingOptions>(DEFAULT_FORMATTING);
  const [hashtagGroups, setHashtagGroups] = useState<HashtagGroup[]>([]);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [showNewGroupForm, setShowNewGroupForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupTags, setNewGroupTags] = useState("");
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editGroupName, setEditGroupName] = useState("");
  const [editGroupTags, setEditGroupTags] = useState("");
  const [showClipboardFallback, setShowClipboardFallback] = useState(false);
  const [fallbackText, setFallbackText] = useState("");
  const fallbackRef = useRef<HTMLTextAreaElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Load from LocalStorage on mount
  useEffect(() => {
    const savedText = getLocalStorage(STORAGE_KEYS.draft, "");
    const savedFormatting = getLocalStorage<FormattingOptions>(
      STORAGE_KEYS.formatting,
      DEFAULT_FORMATTING,
    );
    const savedGroups = getLocalStorage<HashtagGroup[]>(
      STORAGE_KEYS.groups,
      [],
    );

    const timer = setTimeout(() => {
      if (savedText) setText(savedText);
      if (Object.keys(savedFormatting).length > 0)
        setFormatting(savedFormatting);
      if (savedGroups.length > 0) setHashtagGroups(savedGroups);
    }, 0);

    return () => clearTimeout(timer);
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
  const duplicateHashtags = useMemo(() => findDuplicateHashtags(text), [text]);

  const platformLimit = getPlatformLimit(platform);
  const displayCharCount =
    platform === "twitter" ? twitterInfo.count : stats.charCount;
  const isOverLimit =
    platform === "twitter"
      ? twitterInfo.isOverLimit
      : displayCharCount > platformLimit;
  const remainingCount = platformLimit - displayCharCount;
  const resultPlatformCount = formattingResult
    ? platform === "twitter"
      ? calculateTwitterCharCount(formattingResult.text).count
      : calculateStats(formattingResult.text).charCount
    : 0;
  const isResultOverLimit = formattingResult
    ? resultPlatformCount > platformLimit
    : false;

  const handleCopy = useCallback(async (textToCopy: string, type: string) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    } catch {
      // Fallback: show textarea for manual selection
      setFallbackText(textToCopy);
      setShowClipboardFallback(true);
      setTimeout(() => {
        if (fallbackRef.current) {
          fallbackRef.current.select();
        }
      }, 0);
    }
  }, []);

  const handleInsertSample = useCallback(() => {
    setText(getSampleText());
    setFormatting(DEMO_FORMATTING);
    setFormattingResult(null);
  }, []);

  const handleClear = useCallback(() => {
    if (window.confirm("すべてのテキストを消去します。よろしいですか？")) {
      setText("");
      setFormattingResult(null);
    }
  }, []);

  const handleFormat = useCallback(() => {
    if (!text) return;
    setFormattingResult(applyFormattingWithReport(text, formatting));
    setTimeout(
      () => resultRef.current?.scrollIntoView?.({ behavior: "smooth" }),
      0,
    );
  }, [formatting, text]);

  const handleTextChange = useCallback((value: string) => {
    setText(value);
    setFormattingResult(null);
  }, []);

  const updateFormatting = useCallback(
    (key: keyof FormattingOptions, checked: boolean) => {
      setFormatting((current) => ({ ...current, [key]: checked }));
      setFormattingResult(null);
    },
    [],
  );

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

  const handleInsertGroup = useCallback((group: HashtagGroup) => {
    const textToAdd = group.hashtags.join(" ");
    setText((prev) => `${prev}\n${textToAdd}`);
    setFormattingResult(null);
  }, []);

  const handleDeleteGroup = useCallback((id: string) => {
    setHashtagGroups((prev) => prev.filter((g) => g.id !== id));
  }, []);

  const handleEditGroup = useCallback((group: HashtagGroup) => {
    setEditingGroupId(group.id);
    setEditGroupName(group.name);
    setEditGroupTags(group.hashtags.join("\n"));
  }, []);

  const handleSaveEditGroup = useCallback(() => {
    if (!editingGroupId || !editGroupName.trim() || !editGroupTags.trim())
      return;

    const tags = editGroupTags
      .split("\n")
      .map((tag) => {
        const trimmed = tag.trim();
        return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
      })
      .filter((tag) => tag !== "#");

    if (tags.length === 0) return;

    setHashtagGroups((prev) =>
      prev.map((g) =>
        g.id === editingGroupId
          ? { ...g, name: editGroupName, hashtags: tags }
          : g,
      ),
    );
    setEditingGroupId(null);
    setEditGroupName("");
    setEditGroupTags("");
  }, [editingGroupId, editGroupName, editGroupTags]);

  const handleCancelEditGroup = useCallback(() => {
    setEditingGroupId(null);
    setEditGroupName("");
    setEditGroupTags("");
  }, []);

  const handleCloseFallback = useCallback(() => {
    setShowClipboardFallback(false);
  }, []);

  const handleOpenPost = useCallback(async () => {
    if (!formattingResult) return;

    if (platform === "twitter") {
      const intentUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(
        formattingResult.text,
      )}`;
      window.open(intentUrl, "_blank", "noopener,noreferrer");
      return;
    }

    const destination =
      platform === "instagram"
        ? "https://www.instagram.com/"
        : "https://www.linkedin.com/feed/?shareActive=true";
    window.open(destination, "_blank", "noopener,noreferrer");
    await handleCopy(formattingResult.text, "post");
  }, [formattingResult, handleCopy, platform]);

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
          {
            "X、Instagram、LinkedIn向けの文章を、改行・空白・文字数・ハッシュタグを確認しながらブラウザ上で整形できます。"
          }
        </p>

        <aside
          className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
          aria-label="プライバシーに関するご案内"
        >
          <p className="font-semibold">AI不使用・文章は端末内で処理</p>
          <p className="mt-1 leading-6">
            入力した文章は、本ツールの処理としてサーバーや外部AIへ送信されません。
            文字数計算と整形はブラウザ内で行います。
          </p>
        </aside>

        {/* Platform Tabs */}
        <div
          className="mt-8 flex gap-2 border-b border-slate-200 dark:border-slate-700"
          role="tablist"
        >
          {(["twitter", "instagram", "linkedin"] as Platform[]).map((p) => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              role="tab"
              aria-selected={platform === p}
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-50">
              1. 原文を入力
            </h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleInsertSample}
                className="rounded-lg bg-sky-100 px-4 py-2 text-sm font-medium text-sky-900 hover:bg-sky-200 dark:bg-sky-950 dark:text-sky-100 dark:hover:bg-sky-900"
              >
                整形デモを試す
              </button>
              <button
                onClick={handleClear}
                className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
              >
                入力内容を消去
              </button>
            </div>
          </div>

          <textarea
            value={text}
            onChange={(event) => handleTextChange(event.target.value)}
            placeholder="SNS投稿用の文章を入力、または貼り付けてください..."
            className="min-h-64 w-full rounded-lg border border-slate-300 bg-white p-4 font-mono text-sm dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
            aria-label="入力テキスト"
          />
        </div>

        {/* Statistics */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <StatBox
            label={platform === "twitter" ? "X換算" : "入力文字数（目安）"}
            value={displayCharCount}
            limit={platformLimit}
            isOver={isOverLimit}
            helper={
              platform === "twitter"
                ? "日本語・絵文字は基本2、URLは原則23"
                : "日本語・全角文字も1文字として表示"
            }
          />
          <StatBox
            label="実際の文字数"
            value={stats.charCount}
            helper="見た目上の文字単位"
          />
          <StatBox
            label={platform === "twitter" ? "残り" : "残り（目安）"}
            value={remainingCount}
            isOver={remainingCount < 0}
            helper={
              platform === "twitter" && remainingCount >= 0
                ? `日本語なら約${Math.floor(remainingCount / 2)}文字`
                : undefined
            }
          />
          <StatBox
            label="文字数（空白除）"
            value={stats.charCountWithoutSpaces}
          />
          <StatBox label="単語数" value={stats.wordCount} />
          <StatBox label="行数" value={stats.lineCount} />
          <StatBox label="段落数" value={stats.paragraphCount} />
          <StatBox label="ハッシュタグ" value={stats.hashtagCount} />
          <StatBox label="URL" value={stats.urlCount} />
          <StatBox label="@メンション" value={stats.mentionCount} />
        </div>

        <p className="mt-3 text-xs leading-5 text-slate-600 dark:text-slate-400">
          {platform === "twitter"
            ? "X公式の重み付き文字数で計算しています。日本語だけの場合は最大約140文字です。"
            : "絵文字や結合文字の扱いは投稿環境により異なる場合があります。投稿前に実際のSNS画面でもご確認ください。"}
        </p>

        {duplicateHashtags.length > 0 && (
          <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
              ⚠️ 重複するハッシュタグが検出されました:{" "}
              {duplicateHashtags.join(", ")}
            </p>
          </div>
        )}

        {/* Formatting Options */}
        <div className="mt-8 space-y-4">
          <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-50">
            2. 整形内容を選択
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                ["removeTrailingSpaces", "行末の空白を削除"],
                ["trimEnds", "文頭・文末の空白を削除"],
                ["reduceBlankLines", "連続空行を整理（3行以上→2行）"],
                ["normalizeLineBreaks", "改行コードを統一"],
                ["normalizeFullwidthSpaces", "連続全角スペースを整理"],
                ["addBlankBeforeHashtags", "ハッシュタグの前に改行を追加"],
                ["moveHashtagsToEnd", "ハッシュタグを文末にまとめる"],
                ["removeDuplicateHashtags", "重複ハッシュタグを削除"],
              ] as Array<[keyof FormattingOptions, string]>
            ).map(([key, label]) => (
              <label
                key={key}
                className="flex items-center gap-2 rounded-lg border border-slate-200 p-3 dark:border-slate-700"
              >
                <input
                  type="checkbox"
                  checked={formatting[key] ?? false}
                  onChange={(event) =>
                    updateFormatting(key, event.target.checked)
                  }
                  className="rounded"
                  aria-label={label}
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={handleFormat}
          disabled={!text}
          className="mt-8 w-full rounded-xl bg-sky-600 px-6 py-4 text-lg font-semibold text-white shadow-sm transition-colors hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
        >
          文章を整形する
        </button>

        {/* Result */}
        <div ref={resultRef} className="mt-8 scroll-mt-6" aria-live="polite">
          {formattingResult ? (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-50">
                3. 整形結果を確認
              </h2>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/40">
                {formattingResult.changes.length > 0 ? (
                  <>
                    <p className="font-semibold text-emerald-950 dark:text-emerald-100">
                      {formattingResult.changes.length}種類・合計
                      {formattingResult.totalChanges}箇所を整形しました
                    </p>
                    <ul className="mt-2 list-disc pl-5 text-sm text-emerald-900 dark:text-emerald-200">
                      {formattingResult.changes.map((change) => (
                        <li key={change.key}>
                          {change.label}：{change.count}箇所
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p className="font-semibold text-emerald-950 dark:text-emerald-100">
                    整形が必要な箇所は見つかりませんでした
                  </p>
                )}
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400">
                原文は変更していません。投稿前に整形後の文章を確認してください。
              </p>
              <div className="grid gap-4 lg:grid-cols-2">
                <PreviewBox
                  title="整形前"
                  content={text}
                  onCopy={() => handleCopy(text, "original")}
                  copied={copiedType === "original"}
                />
                <PreviewBox
                  title="整形後"
                  content={formattingResult.text}
                  onCopy={() => handleCopy(formattingResult.text, "formatted")}
                  copied={copiedType === "formatted"}
                />
              </div>

              <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-900 dark:bg-sky-950/40">
                <button
                  onClick={handleOpenPost}
                  disabled={isResultOverLimit}
                  className="w-full rounded-lg bg-sky-600 px-5 py-3 font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
                >
                  {platform === "twitter"
                    ? "Xで投稿画面を開く"
                    : platform === "instagram"
                      ? "Instagram用にコピーして開く"
                      : "LinkedIn用にコピーして開く"}
                </button>
                <p className="mt-2 text-xs leading-5 text-sky-900 dark:text-sky-200">
                  {isResultOverLimit
                    ? `整形後の文章が上限を${resultPlatformCount - platformLimit}超えています。文字数を調整してから投稿してください。`
                    : platform === "twitter"
                      ? "整形後の文章を入れたXの投稿画面を開きます。内容を確認してから投稿してください。"
                      : "整形後の文章をクリップボードへコピーして投稿画面を開きます。投稿画面に貼り付けて、内容を確認してから投稿してください。"}
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              「文章を整形する」を押すと、ここに整形前後と変更内容を表示します。
            </div>
          )}
        </div>

        {/* Clipboard Fallback */}
        {showClipboardFallback && (
          <div className="mt-8 rounded-lg border border-blue-300 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="font-medium text-blue-900 dark:text-blue-100">
                クリップボード機能が利用できません。以下のテキストを選択・コピーしてください。
              </h4>
              <button
                onClick={handleCloseFallback}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
              >
                ✕
              </button>
            </div>
            <textarea
              ref={fallbackRef}
              readOnly
              value={fallbackText}
              className="w-full min-h-32 rounded bg-white p-3 font-mono text-sm dark:bg-slate-900 dark:text-slate-100"
              aria-label="コピー用テキスト"
            />
          </div>
        )}

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
                aria-label="グループ名"
              />
              <textarea
                placeholder="ハッシュタグを1行1つ入力（#は自動補完）"
                value={newGroupTags}
                onChange={(e) => setNewGroupTags(e.target.value)}
                className="w-full min-h-24 rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                aria-label="ハッシュタグ"
              />
              <button
                onClick={handleAddHashtagGroup}
                className="w-full rounded-lg bg-sky-600 px-4 py-2 font-medium text-white hover:bg-sky-700"
              >
                保存
              </button>
            </div>
          )}

          {editingGroupId && (
            <div className="space-y-3 rounded-lg border border-blue-300 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
              <h4 className="font-medium text-blue-900 dark:text-blue-100">
                グループを編集
              </h4>
              <input
                type="text"
                placeholder="グループ名"
                value={editGroupName}
                onChange={(e) => setEditGroupName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                aria-label="編集グループ名"
              />
              <textarea
                placeholder="ハッシュタグを1行1つ入力（#は自動補完）"
                value={editGroupTags}
                onChange={(e) => setEditGroupTags(e.target.value)}
                className="w-full min-h-24 rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                aria-label="編集ハッシュタグ"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEditGroup}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
                >
                  保存
                </button>
                <button
                  onClick={handleCancelEditGroup}
                  className="flex-1 rounded-lg bg-slate-300 px-4 py-2 font-medium text-slate-900 hover:bg-slate-400 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
                >
                  キャンセル
                </button>
              </div>
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
                      aria-label={`${group.name}を挿入`}
                    >
                      挿入
                    </button>
                    <button
                      onClick={() => handleEditGroup(group)}
                      className="rounded px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-950"
                      aria-label={`${group.name}を編集`}
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDeleteGroup(group.id)}
                      className="rounded px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-100 dark:hover:bg-red-950"
                      aria-label={`${group.name}を削除`}
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
  helper,
}: {
  label: string;
  value: number;
  limit?: number;
  isOver?: boolean;
  helper?: string;
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
        {limit && (
          <span className="text-sm font-normal text-slate-600 dark:text-slate-400">
            {" "}
            / {limit}
          </span>
        )}
      </p>
      {helper && (
        <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
          {helper}
        </p>
      )}
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
        <h4 className="font-medium text-slate-900 dark:text-slate-100">
          {title}
        </h4>
        <button
          onClick={onCopy}
          className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
            copied
              ? "bg-green-600 text-white"
              : "bg-sky-600 text-white hover:bg-sky-700"
          }`}
          aria-label={`${title}をコピー`}
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
