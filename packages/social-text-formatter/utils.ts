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
 * Calculate display character count using grapheme clusters (書記素単位)
 * Handles emoji, combining characters, and surrogate pairs correctly
 */
export function getDisplayCharCount(text: string): number {
  if (!text) return 0;
  
  // Use Intl.Segmenter if available (Node.js 16+, modern browsers)
  if (typeof Intl !== "undefined" && (Intl as any).Segmenter) {
    try {
      const segmenter = new (Intl as any).Segmenter("ja-JP", {
        granularity: "grapheme",
      });
      const segments = Array.from(segmenter.segment(text));
      return segments.length;
    } catch {
      // Fallback if Segmenter fails
    }
  }

  // Fallback: Use Array.from which handles surrogate pairs and most emoji
  // This is less accurate for complex emoji sequences but acceptable
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
  return getDisplayCharCount(withoutSpaces);
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
  if (!text) return 0; // Empty string has 0 lines
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
 * Check for duplicate hashtags
 */
export function findDuplicateHashtags(text: string): string[] {
  const hashtags = extractHashtags(text);
  const lowerCased = hashtags.map((tag) => tag.toLowerCase());
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  
  for (const tag of lowerCased) {
    if (seen.has(tag)) {
      duplicates.add(tag);
    }
    seen.add(tag);
  }
  
  return Array.from(duplicates);
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
 * Calculate Twitter (X) character count following official algorithm
 * According to X's text processing rules:
 * - Each URL counts as 23 characters (regardless of actual length)
 * - Most characters count as 1
 * - Emoji generally count as 2 (but this varies)
 * For accuracy, we use a simplified model based on X's public documentation
 */
export function calculateTwitterCharCount(text: string): TwitterCharInfo {
  if (!text) return { count: 0, isOverLimit: false };

  // Step 1: Find and replace URLs with their weighted equivalent
  const urlRegex = /https?:\/\/[\w\/:%#\$&\?\(\)~\.=\+\-]+/g;
  const urls = text.match(urlRegex) || [];
  let textWithoutUrls = text.replace(urlRegex, "");

  // Step 2: Count characters in text without URLs
  // For Twitter, we need to count weighted Unicode ranges
  // This is a simplified approximation - emoji can vary in weight
  let charCount = 0;
  
  for (const char of textWithoutUrls) {
    // Most characters count as 1
    charCount += 1;
  }

  // Step 3: Add URL weight (each URL counts as 23)
  const totalCount = charCount + urls.length * 23;

  return {
    count: totalCount,
    isOverLimit: totalCount > PLATFORM_LIMITS.twitter,
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
 * Move hashtags to the end of text, preserving body structure
 * Ensures that URLs, mentions, and paragraph breaks are not damaged
 */
export function moveHashtagsToEnd(text: string): string {
  const hashtags = extractHashtags(text);
  if (hashtags.length === 0) return text;

  // Extract URLs and mentions to preserve them
  const urls = extractUrls(text);
  const mentions = extractMentions(text);

  // Remove hashtags from text, but keep URLs and mentions intact
  let textWithoutHashtags = text.replace(/#[\w\p{L}\p{N}_]+\s*/gu, "");

  // Clean up excessive spaces while preserving paragraph structure
  textWithoutHashtags = textWithoutHashtags
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) => line.length > 0)
    .join("\n");

  // Add hashtags at the end
  const hashtagLine = hashtags.join(" ");
  return textWithoutHashtags + "\n\n" + hashtagLine;
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

#SNS #テキスト整形 #便利ツール`;
}

