import twitterText from "twitter-text";

const {
  extractMentions: extractTwitterMentions,
  extractUrls: extractTwitterUrls,
  extractUrlsWithIndices,
  parseTweet,
} = twitterText;

/**
 * SNS Text Formatting Utilities
 * Pure functions for text processing and statistics
 *
 * X character counts and social entities use the official twitter-text parser.
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

interface HashtagEntity {
  hashtag: string;
  indices: [number, number];
}

function getHashtagEntities(text: string): HashtagEntity[] {
  const urlRanges = extractUrlsWithIndices(text, {
    extractUrlsWithoutProtocol: false,
  }).map(({ indices }) => indices);
  const hashtagRegex = /#[\w\p{L}\p{N}_]+/gu;

  return Array.from(text.matchAll(hashtagRegex), (match) => {
    const start = match.index;
    const end = start + match[0].length;
    return {
      hashtag: match[0].slice(1),
      indices: [start, end] as [number, number],
    };
  }).filter(({ indices: [start, end] }) =>
    urlRanges.every(([urlStart, urlEnd]) => end <= urlStart || start > urlEnd),
  );
}

/**
 * Calculate display character count using grapheme clusters (書記素単位)
 * Handles emoji, combining characters, and surrogate pairs correctly
 */
export function getDisplayCharCount(text: string): number {
  if (!text) return 0;

  // Use Intl.Segmenter if available (Node.js 16+, modern browsers)
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    try {
      const segmenter = new Intl.Segmenter("ja-JP", {
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
  return trimmed.split(/\s+/).filter((word) => word.length > 0).length;
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
  return text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;
}

/**
 * Extract hashtags while excluding URL fragments such as
 * `#section` in `https://example.com#section`.
 */
export function extractHashtags(text: string): string[] {
  return getHashtagEntities(text).map(({ hashtag }) => `#${hashtag}`);
}

/**
 * Check for duplicate hashtags (excluding URL fragments)
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
  return extractTwitterUrls(text, { extractUrlsWithoutProtocol: false });
}

/**
 * Extract mentions (@username)
 */
export function extractMentions(text: string): string[] {
  return extractTwitterMentions(text).map((mention) => `@${mention}`);
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
 * Calculate the X weighted character count with the official twitter-text parser.
 */
export function calculateTwitterCharCount(text: string): TwitterCharInfo {
  if (!text) return { count: 0, isOverLimit: false };

  const count = parseTweet(text).weightedLength;

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
  const hashtags = getHashtagEntities(text);
  let result = text;

  for (const { indices } of [...hashtags].reverse()) {
    const start = indices[0];
    if (start > 0 && result[start - 1] !== "\n") {
      result = `${result.slice(0, start)}\n${result.slice(start)}`;
    }
  }

  return result;
}

/**
 * Move hashtags to the end of text, preserving body structure and blank lines
 * Ensures that URLs, mentions, paragraph breaks, and blank lines are not damaged
 */
export function moveHashtagsToEnd(text: string): string {
  const hashtagEntities = getHashtagEntities(text);
  if (hashtagEntities.length === 0) return text;

  const hashtags = hashtagEntities.map(({ hashtag }) => `#${hashtag}`);
  let textWithoutHashtags = text;

  for (const { indices } of [...hashtagEntities].reverse()) {
    const [start, entityEnd] = indices;
    let end = entityEnd;
    while (
      end < textWithoutHashtags.length &&
      /[ \t]/.test(textWithoutHashtags[end])
    ) {
      end += 1;
    }
    textWithoutHashtags =
      textWithoutHashtags.slice(0, start) + textWithoutHashtags.slice(end);
  }

  // Process line by line, removing trailing spaces but preserving blank lines
  const lines = textWithoutHashtags.split("\n");
  const processedLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.replace(/\s+$/, ""); // Remove trailing whitespace

    // If line is empty after trimming trailing spaces, keep it (blank line)
    processedLines.push(trimmedLine);
  }

  // Join lines and reduce consecutive blank lines (3+ → 2)
  let result = processedLines.join("\n");
  result = result.replace(/\n\n\n+/g, "\n\n");

  // Trim the content before adding hashtags
  result = result.trim();

  // Add hashtags at the end
  const hashtagLine = hashtags.join(" ");
  return result + "\n\n" + hashtagLine;
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
  options: FormattingOptions = {},
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
