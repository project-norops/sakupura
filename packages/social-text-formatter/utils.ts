/**
 * SNS Text Formatting Utilities
 * Pure functions for text processing and statistics
 */

export interface TextStats {
  charCount: number;
  charCountWithoutSpaces: number;
  wordCount: number;
  lineCount: number;
  paragraphCount: number;
  hashtagCount: number;
  urlCount: number;
  mentionCount: number;
}

export interface TwitterCharInfo {
  count: number;
  isOverLimit: boolean;
}

// Platform limits (in weight units)
export const PLATFORM_LIMITS = {
  twitter: 280,
  instagram: 2200, // Instagram caption limit
  linkedin: 3000, // LinkedIn post limit (approximate)
} as const;

/**
 * Calculate display character count considering emoji and combining characters
 * More accurate than simple string.length
 */
export function getDisplayCharCount(text: string): number {
  // Use Array.from to handle emoji and combining characters correctly
  return Array.from(text).length;
}

/**
 * Calculate character count without spaces for various types
 */
export function getCharCountWithoutSpaces(text: string): number {
  // Remove all space types: regular space, tab, newline, full-width space
  const withoutSpaces = text
    .replace(/\s/g, "") // Remove all whitespace including newlines
    .replace(/\u3000/g, ""); // Remove full-width space (U+3000)
  return Array.from(withoutSpaces).length;
}

/**
 * Calculate word count (rough approximation)
 */
export function getWordCount(text: string): number {
  // For Japanese, count by breaking on spaces
  const trimmed = text.trim();
  if (!trimmed) return 0;
  // Split by space, then by newline for more granular counting
  return trimmed
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
}

/**
 * Calculate line count
 */
export function getLineCount(text: string): number {
  if (!text) return 0;
  // Split by \n, \r\n, \r
  return text.split(/\r?\n/).length;
}

/**
 * Calculate paragraph count (separated by blank lines)
 */
export function getParagraphCount(text: string): number {
  if (!text.trim()) return 0;
  // Split by multiple consecutive newlines
  return text
    .split(/\n\s*\n/)
    .filter((p) => p.trim().length > 0).length;
}

/**
 * Extract hashtags
 */
export function extractHashtags(text: string): string[] {
  const hashtagRegex = /#[\w\p{L}\p{N}_]+/gu;
  const matches = text.match(hashtagRegex) || [];
  return matches;
}

/**
 * Extract URLs
 */
export function extractUrls(text: string): string[] {
  const urlRegex = /https?:\/\/[\w\/:%#\$&\?\(\)~\.=\+\-]+/g;
  const matches = text.match(urlRegex) || [];
  return matches;
}

/**
 * Extract mentions (@username)
 */
export function extractMentions(text: string): string[] {
  const mentionRegex = /@[\w_]+/g;
  const matches = text.match(mentionRegex) || [];
  return matches;
}

/**
 * Calculate full statistics for text
 */
export function calculateStats(text: string): TextStats {
  return {
    charCount: getDisplayCharCount(text),
    charCountWithoutSpaces: getCharCountWithoutSpaces(text),
    wordCount: getWordCount(text),
    lineCount: getLineCount(text),
    paragraphCount: getParagraphCount(text),
    hashtagCount: extractHashtags(text).length,
    urlCount: extractUrls(text).length,
    mentionCount: extractMentions(text).length,
  };
}

/**
 * Calculate Twitter character count with proper weighting
 * According to Twitter's text processing rules:
 * - Most characters count as 1
 * - URLs count as 23 (regardless of actual length)
 * - Some unicode ranges (CJK) count as 1
 */
export function calculateTwitterCharCount(text: string): TwitterCharInfo {
  let count = 0;
  const urlRegex = /https?:\/\/[\w\/:%#\$&\?\(\)~\.=\+\-]+/g;

  // Get all URLs
  const urls = text.match(urlRegex) || [];
  const textWithoutUrls = text.replace(urlRegex, "");

  // Count characters in text without URLs
  for (const char of textWithoutUrls) {
    count += 1;
  }

  // Add URL weight (each URL counts as 23)
  count += urls.length * 23;

  return {
    count,
    isOverLimit: count > PLATFORM_LIMITS.twitter,
  };
}

/**
 * Remove trailing spaces from each line
 */
export function removeTrailingSpaces(text: string): string {
  return text
    .split("\n")
    .map((line) => line.replace(/\s+$/, ""))
    .join("\n");
}

/**
 * Remove leading and trailing spaces from the entire text
 */
export function trimText(text: string): string {
  return text.trim();
}

/**
 * Reduce multiple consecutive blank lines to 2 lines
 */
export function reduceConsecutiveBlankLines(text: string): string {
  // Replace 3 or more consecutive newlines with exactly 2
  return text.replace(/\n\n\n+/g, "\n\n");
}

/**
 * Normalize line breaks to \n
 */
export function normalizeLineBreaks(text: string): string {
  // Convert \r\n to \n, then \r to \n
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

/**
 * Normalize multiple full-width spaces to single space
 */
export function normalizeFullwidthSpaces(text: string): string {
  // Replace multiple consecutive full-width spaces with single space
  return text.replace(/\u3000+/g, "\u3000");
}

/**
 * Add blank line before hashtags
 */
export function addBlankLineBeforeHashtags(text: string): string {
  // Add newline before hashtag if it's not already preceded by one
  return text.replace(/([^\n])(#[\w\p{L}\p{N}_]+)/gu, "$1\n$2");
}

/**
 * Move hashtags to the end of text
 */
export function moveHashtagsToEnd(text: string): string {
  // Extract all hashtags
  const hashtags = extractHashtags(text);
  if (hashtags.length === 0) return text;

  // Remove hashtags from text
  let textWithoutHashtags = text.replace(/#[\w\p{L}\p{N}_]+\s*/gu, " ");
  // Clean up excessive spaces
  textWithoutHashtags = textWithoutHashtags
    .replace(/\s+/g, " ")
    .trim();

  // Add hashtags at the end
  return textWithoutHashtags + "\n\n" + hashtags.join(" ");
}

/**
 * Apply all formatting options
 */
export interface FormattingOptions {
  removeTrailingSpaces?: boolean;
  trimEnds?: boolean;
  reduceBlankLines?: boolean;
  normalizeLineBreaks?: boolean;
  normalizeFullwidthSpaces?: boolean;
  addBlankBeforeHashtags?: boolean;
  moveHashtagsToEnd?: boolean;
  useInvisibleCharacters?: boolean;
}

export function applyFormatting(
  text: string,
  options: FormattingOptions = {}
): string {
  let result = text;

  if (options.normalizeLineBreaks) {
    result = normalizeLineBreaks(result);
  }

  if (options.removeTrailingSpaces) {
    result = removeTrailingSpaces(result);
  }

  if (options.trimEnds) {
    result = trimText(result);
  }

  if (options.reduceBlankLines) {
    result = reduceConsecutiveBlankLines(result);
  }

  if (options.normalizeFullwidthSpaces) {
    result = normalizeFullwidthSpaces(result);
  }

  if (options.addBlankBeforeHashtags) {
    result = addBlankLineBeforeHashtags(result);
  }

  if (options.moveHashtagsToEnd) {
    result = moveHashtagsToEnd(result);
  }

  return result;
}

/**
 * Get sample text for demonstration
 */
export function getSampleText(): string {
  return `こんにちは！

SNS投稿のための便利なツールです。

このツールを使うと：
- 改行や空白を自動整理
- 文字数を正確に計測
- ハッシュタグを管理
- X、Instagram、LinkedInの規格に対応

さあ、試してみましょう！

#SNS #テキスト整形 #便利ツール
@sakupura`;
}
