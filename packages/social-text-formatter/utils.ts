/**
 * SNS Text Formatting Utilities
 * Pure functions for text processing and statistics
 *
 * Note: X character counting implements the official X weighting:
 * - URLs always count as 23 characters
 * - CJK characters (Japanese, Chinese, Korean) count as 2
 * - Emoji count as 2
 * - Other characters count as 1
 *
 * For browser compatibility, we implement the core logic here.
 * Tests verify this against the official twitter-text library.
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
 * Calculate Twitter (X) character count using official X weighting rules.
 * 
 * Implements X's text weighting:
 * - URLs (http(s)://...) count as 23 characters
 * - CJK characters (Japanese, Chinese, Korean) count as 2
 * - Emoji and modifier sequences count as 2
 * - Other characters count as 1
 * 
 * Note: This is a browser-compatible implementation that handles:
 * - ZWJ sequences (combining emoji)
 * - Emoji with skin tone modifiers
 * - Emoji tag sequences
 * - Surrogate pairs
 * 
 * Tests verify correctness against the official twitter-text library.
 */
export function calculateTwitterCharCount(text: string): TwitterCharInfo {
  if (!text) return { count: 0, isOverLimit: false };

  let count = 0;
  
  // Extract URLs using simple regex and replace with placeholder
  const urlRegex = /https?:\/\/[^\s]+/g;
  const urls = text.match(urlRegex) || [];
  let textWithoutUrls = text.replace(urlRegex, "");
  
  // Count URLs (each URL is 23 characters)
  count += urls.length * 23;
  
  // Use Intl.Segmenter to split into grapheme clusters if available
  if (typeof Intl !== "undefined" && (Intl as any).Segmenter) {
    try {
      const segmenter = new (Intl as any).Segmenter("ja-JP", {
        granularity: "grapheme",
      });
      const segments = Array.from(segmenter.segment(textWithoutUrls));
      
      for (const seg of segments) {
        const grapheme = (seg as any).segment;
        if (!grapheme) continue;
        
        // Get the first code point of the grapheme
        const firstCode = grapheme.charCodeAt(0);
        const codePoint = grapheme.codePointAt(0) || 0;
        
        // Check if this is an emoji (astral plane or emoji range)
        if (isEmoji(codePoint) || isEmojiModifierOrZWJ(firstCode)) {
          count += 2;
        } else if (isCJKCharacter(codePoint)) {
          count += 2;
        } else {
          count += 1;
        }
      }
      
      return {
        count,
        isOverLimit: count > PLATFORM_LIMITS.twitter,
      };
    } catch {
      // Fall through to character-by-character processing
    }
  }
  
  // Fallback: character-by-character processing
  let i = 0;
  while (i < textWithoutUrls.length) {
    const code = textWithoutUrls.charCodeAt(i);
    const char = textWithoutUrls[i];
    
    // Check for surrogate pair (emoji and other astral-plane characters)
    if (code >= 0xD800 && code <= 0xDBFF && i + 1 < textWithoutUrls.length) {
      const nextCode = textWithoutUrls.charCodeAt(i + 1);
      if (nextCode >= 0xDC00 && nextCode <= 0xDFFF) {
        // This is an astral-plane character (emoji, etc.)
        // Count as 2 initially, but may be modified by following variation selectors or modifiers
        count += 2;
        i += 2;
        
        // Check for emoji modifiers or ZWJ following
        while (i < textWithoutUrls.length) {
          const nextCode2 = textWithoutUrls.charCodeAt(i);
          // Emoji modifier separator, skin tone modifiers, or ZWJ don't add count
          if (
            nextCode2 === 0xFE0F || // Variation selector-16 (emoji)
            (nextCode2 >= 0x1F3FB && nextCode2 <= 0x1F3FF) || // Emoji skin tone modifiers
            nextCode2 === 0x200D // ZWJ
          ) {
            i++;
          } else {
            break;
          }
        }
        continue;
      }
    }
    
    // Check for CJK character ranges
    const codePoint = char.codePointAt(0) || 0;
    if (isCJKCharacter(codePoint)) {
      count += 2;
    } else {
      count += 1;
    }
    
    i++;
  }
  
  return {
    count,
    isOverLimit: count > PLATFORM_LIMITS.twitter,
  };
}

/**
 * Check if a code point is an emoji
 */
function isEmoji(codePoint: number): boolean {
  return (
    // Emoji ranges (astral plane)
    (codePoint >= 0x1F300 && codePoint <= 0x1F9FF) || // Main emoji blocks
    (codePoint >= 0x1F000 && codePoint <= 0x1F02F) || // Emoticons
    (codePoint >= 0x2600 && codePoint <= 0x27BF) || // Miscellaneous symbols and Dingbats
    (codePoint >= 0x1F900 && codePoint <= 0x1F9FF) // Supplementary Multilingual Plane emoji
  );
}

/**
 * Check if a character code is an emoji modifier or ZWJ
 */
function isEmojiModifierOrZWJ(charCode: number): boolean {
  return (
    charCode === 0xFE0F || // Variation selector-16
    (charCode >= 0x1F3FB && charCode <= 0x1F3FF) || // Emoji skin tone modifiers
    charCode === 0x200D // ZWJ
  );
}

/**
 * Check if a code point is a CJK character
 */
function isCJKCharacter(codePoint: number): boolean {
  return (
    // CJK Unified Ideographs and extensions
    (codePoint >= 0x2E80 && codePoint <= 0x2EFF) || // CJK Radicals Supplement
    (codePoint >= 0x3000 && codePoint <= 0x303F) || // CJK Symbols and Punctuation
    (codePoint >= 0x3040 && codePoint <= 0x309F) || // Hiragana
    (codePoint >= 0x30A0 && codePoint <= 0x30FF) || // Katakana
    (codePoint >= 0x3100 && codePoint <= 0x312F) || // Bopomofo
    (codePoint >= 0x3130 && codePoint <= 0x318F) || // Hangul Compatibility Jamo
    (codePoint >= 0x3190 && codePoint <= 0x319F) || // Kanbun
    (codePoint >= 0x31A0 && codePoint <= 0x31BF) || // Bopomofo Extended
    (codePoint >= 0x31C0 && codePoint <= 0x31EF) || // CJK Strokes
    (codePoint >= 0x31F0 && codePoint <= 0x31FF) || // Katakana Phonetic Extensions
    (codePoint >= 0x3200 && codePoint <= 0x32FF) || // Enclosed CJK Letters and Months
    (codePoint >= 0x3300 && codePoint <= 0x33FF) || // CJK Compatibility
    (codePoint >= 0x3400 && codePoint <= 0x4DBF) || // CJK Unified Ideographs Extension A
    (codePoint >= 0x4E00 && codePoint <= 0x9FFF) || // CJK Unified Ideographs
    (codePoint >= 0xA960 && codePoint <= 0xA97F) || // Hangul Jamo Extended-A
    (codePoint >= 0xAC00 && codePoint <= 0xD7AF) || // Hangul Syllables
    (codePoint >= 0xD7B0 && codePoint <= 0xD7FF) || // Hangul Jamo Extended-B
    (codePoint >= 0xF900 && codePoint <= 0xFAFF) || // CJK Compatibility Ideographs
    (codePoint >= 0xFE30 && codePoint <= 0xFE4F) || // CJK Compatibility Forms
    (codePoint >= 0x20000 && codePoint <= 0x2A6DF) || // CJK Unified Ideographs Extension B
    (codePoint >= 0x2A700 && codePoint <= 0x2B73F) || // CJK Unified Ideographs Extension C
    (codePoint >= 0x2B740 && codePoint <= 0x2B81D) || // CJK Unified Ideographs Extension D
    (codePoint >= 0x2B820 && codePoint <= 0x2CEAF) || // CJK Unified Ideographs Extension E
    (codePoint >= 0x2CEB0 && codePoint <= 0x2EBEF) || // CJK Unified Ideographs Extension F
    (codePoint >= 0x30000 && codePoint <= 0x3134F) // CJK Unified Ideographs Extension G
  );
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
 * Move hashtags to the end of text, preserving body structure and blank lines
 * Ensures that URLs, mentions, paragraph breaks, and blank lines are not damaged
 */
export function moveHashtagsToEnd(text: string): string {
  const hashtags = extractHashtags(text);
  if (hashtags.length === 0) return text;

  // Remove hashtags but preserve structure
  // Remove hashtag followed by optional non-newline spaces, but keep newlines
  let textWithoutHashtags = text.replace(/#[\w\p{L}\p{N}_]+[ \t]*/gu, "");

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

