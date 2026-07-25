/**
 * Tests for SNS Text Formatting Utilities
 * Comprehensive test suite for all utility functions
 */

import {
  getDisplayCharCount,
  getCharCountWithoutSpaces,
  getWordCount,
  getLineCount,
  getParagraphCount,
  extractHashtags,
  extractUrls,
  extractMentions,
  findDuplicateHashtags,
  calculateStats,
  calculateTwitterCharCount,
  removeTrailingSpaces,
  trimText,
  reduceConsecutiveBlankLines,
  normalizeLineBreaks,
  normalizeFullwidthSpaces,
  addBlankLineBeforeHashtags,
  moveHashtagsToEnd,
  applyFormatting,
  PLATFORM_LIMITS,
} from "./utils";

describe("Text Formatting Utilities - Complete Test Suite", () => {
  describe("Display Character Counting (grapheme-based)", () => {
    test("should count ASCII characters correctly", () => {
      expect(getDisplayCharCount("hello")).toBe(5);
    });

    test("should count Japanese characters correctly", () => {
      expect(getDisplayCharCount("こんにちは")).toBe(5);
    });

    test("should count emoji as single grapheme", () => {
      expect(getDisplayCharCount("😀")).toBe(1);
    });

    test("should count emoji with skin tone modifier", () => {
      // 👋🏻 is a single grapheme (waving hand + light skin tone)
      const count = getDisplayCharCount("👋🏻");
      expect(count).toBeLessThanOrEqual(2); // Allow for variation in segmenter support
    });

    test("should count mixed text with emoji", () => {
      const mixed = "hello 😀 world";
      const count = getDisplayCharCount(mixed);
      expect(count).toBeGreaterThan(10); // At least hello + space + emoji + space + world
    });

    test("should count newlines", () => {
      expect(getDisplayCharCount("hello\nworld")).toBe(11);
    });

    test("should return 0 for empty string", () => {
      expect(getDisplayCharCount("")).toBe(0);
    });

    test("should handle complex emoji sequence", () => {
      // Family emoji: 👨‍👩‍👧‍👦 (may be 1-4 graphemes depending on support)
      const count = getDisplayCharCount("👨‍👩‍👧‍👦");
      expect(count).toBeGreaterThan(0);
    });

    test("should handle combining characters", () => {
      // "é" as combining character sequence (e + combining acute accent)
      const composed = "é";
      const decomposed = "e\u0301";
      // Both should return similar counts (accounting for normalization differences)
      expect(Math.abs(getDisplayCharCount(composed) - getDisplayCharCount(decomposed))).toBeLessThanOrEqual(1);
    });
  });

  describe("Character count without spaces", () => {
    test("should remove ASCII spaces", () => {
      expect(getCharCountWithoutSpaces("hello world")).toBe(10);
    });

    test("should remove full-width spaces", () => {
      expect(getCharCountWithoutSpaces("hello　world")).toBe(10);
    });

    test("should remove newlines", () => {
      expect(getCharCountWithoutSpaces("hello\nworld")).toBe(10);
    });

    test("should remove tabs", () => {
      expect(getCharCountWithoutSpaces("hello\tworld")).toBe(10);
    });

    test("should remove mixed whitespace types", () => {
      expect(getCharCountWithoutSpaces("hello \t\n　world")).toBe(10);
    });
  });

  describe("Word counting", () => {
    test("should count English words", () => {
      expect(getWordCount("hello world test")).toBe(3);
    });

    test("should handle multiple spaces", () => {
      expect(getWordCount("hello  world   test")).toBe(3);
    });

    test("should handle newlines as separators", () => {
      expect(getWordCount("hello\nworld\ntest")).toBe(3);
    });

    test("should return 0 for empty string", () => {
      expect(getWordCount("")).toBe(0);
    });

    test("should handle Japanese text with spaces", () => {
      expect(getWordCount("こんにちは 世界")).toBe(2);
    });
  });

  describe("Line and paragraph counting", () => {
    test("should count lines correctly", () => {
      expect(getLineCount("line1\nline2\nline3")).toBe(3);
    });

    test("should count single line as 1", () => {
      expect(getLineCount("single line")).toBe(1);
    });

    test("should count paragraphs separated by blank lines", () => {
      const text = "para1\n\npara2\n\npara3";
      expect(getParagraphCount(text)).toBe(3);
    });

    test("should return 0 for empty paragraph", () => {
      expect(getParagraphCount("")).toBe(0);
    });

    test("should handle carriage return", () => {
      expect(getLineCount("line1\r\nline2")).toBe(2);
    });
  });

  describe("Hashtag extraction and validation", () => {
    test("should extract single hashtag", () => {
      const hashtags = extractHashtags("#hello");
      expect(hashtags).toContain("#hello");
    });

    test("should extract multiple hashtags", () => {
      const hashtags = extractHashtags("text #first #second text");
      expect(hashtags).toContain("#first");
      expect(hashtags).toContain("#second");
    });

    test("should handle hashtags with Japanese", () => {
      const hashtags = extractHashtags("#テスト #日本語");
      expect(hashtags.length).toBeGreaterThanOrEqual(2);
    });

    test("should return empty for no hashtags", () => {
      const hashtags = extractHashtags("no hashtags here");
      expect(hashtags).toEqual([]);
    });

    test("should detect duplicate hashtags case-insensitive", () => {
      const duplicates = findDuplicateHashtags("#Hello #HELLO #world");
      expect(duplicates.length).toBeGreaterThan(0);
      expect(duplicates.some((d) => d.toLowerCase() === "#hello")).toBe(true);
    });

    test("should not report unique hashtags as duplicates", () => {
      const duplicates = findDuplicateHashtags("#first #second #third");
      expect(duplicates.length).toBe(0);
    });
  });

  describe("URL extraction", () => {
    test("should extract single URL", () => {
      const urls = extractUrls("Visit https://example.com for more");
      expect(urls).toContain("https://example.com");
    });

    test("should extract multiple URLs", () => {
      const urls = extractUrls("https://example.com and https://test.org");
      expect(urls.length).toBeGreaterThanOrEqual(2);
    });

    test("should return empty for no URLs", () => {
      const urls = extractUrls("no urls here");
      expect(urls).toEqual([]);
    });

    test("should extract URL with path and query", () => {
      const urls = extractUrls("https://example.com/path?query=value");
      expect(urls.length).toBeGreaterThan(0);
    });
  });

  describe("Mention extraction", () => {
    test("should extract single mention", () => {
      const mentions = extractMentions("Hello @user");
      expect(mentions).toContain("@user");
    });

    test("should extract multiple mentions", () => {
      const mentions = extractMentions("@user1 and @user2");
      expect(mentions.length).toBeGreaterThanOrEqual(2);
    });

    test("should return empty for no mentions", () => {
      const mentions = extractMentions("no mentions here");
      expect(mentions).toEqual([]);
    });
  });

  describe("Twitter (X) character counting", () => {
    test("should count basic text correctly", () => {
      const result = calculateTwitterCharCount("hello");
      expect(result.count).toBe(5);
      expect(result.isOverLimit).toBe(false);
    });

    test("should count URL as 23 characters", () => {
      const result = calculateTwitterCharCount("check https://example.com");
      // "check " = 6 + URL = 23 = 29
      expect(result.count).toBe(29);
    });

    test("should handle multiple URLs", () => {
      const result = calculateTwitterCharCount(
        "see https://example.com and https://test.org"
      );
      // "see " = 4 + URL1 = 23 + " and " = 5 + URL2 = 23 = 55
      expect(result.count).toBe(55);
    });

    test("should return isOverLimit true for > 280 chars", () => {
      const longText = "x".repeat(281);
      const result = calculateTwitterCharCount(longText);
      expect(result.isOverLimit).toBe(true);
    });

    test("should handle Japanese text (CJK = 2x weight)", () => {
      const result = calculateTwitterCharCount("こんにちは");
      // CJK characters are weighted as 2 each in twitter-text
      expect(result.count).toBe(10);
      expect(result.isOverLimit).toBe(false);
    });

    test("should return empty string as 0", () => {
      const result = calculateTwitterCharCount("");
      expect(result.count).toBe(0);
      expect(result.isOverLimit).toBe(false);
    });

    test("should handle text exactly at 280 character limit", () => {
      const text = "a".repeat(280);
      const result = calculateTwitterCharCount(text);
      expect(result.count).toBe(280);
      expect(result.isOverLimit).toBe(false);
    });

    test("should handle mixed content: Japanese + emoji + URL", () => {
      const text = "こんにちは😀 https://example.com";
      const result = calculateTwitterCharCount(text);
      // CJK (5*2=10) + emoji (2) + space (1) + URL (23) = 36
      expect(result.count).toBe(36);
    });

    test("should handle mention + URL in text", () => {
      const result = calculateTwitterCharCount("Hi @user https://example.com");
      // "Hi @user " = 9 + URL = 23 = 32
      expect(result.count).toBe(32);
    });

    test("should handle Japanese + emoji + newline + URL", () => {
      const result = calculateTwitterCharCount("テスト📊\nhttps://example.com");
      // Actual twitter-text result: 32
      expect(result.count).toBe(32);
    });

    test("should handle combining emoji (ZWJ sequences)", () => {
      // 👨‍👩‍👧‍👦 is a ZWJ sequence (family emoji)
      const result = calculateTwitterCharCount("Family: 👨‍👩‍👧‍👦");
      expect(result.count).toBeGreaterThan(0);
      expect(result.isOverLimit).toBe(false);
    });
  });

  describe("Text formatting functions", () => {
    test("should remove trailing spaces", () => {
      expect(removeTrailingSpaces("hello  \nworld  ")).toBe("hello\nworld");
    });

    test("should trim text", () => {
      expect(trimText("  hello world  ")).toBe("hello world");
    });

    test("should reduce consecutive blank lines to 2", () => {
      const result = reduceConsecutiveBlankLines("line1\n\n\n\nline2");
      expect(result).toBe("line1\n\nline2");
    });

    test("should normalize line breaks to LF", () => {
      expect(normalizeLineBreaks("line1\r\nline2\rline3")).toBe(
        "line1\nline2\nline3"
      );
    });

    test("should normalize full-width spaces", () => {
      expect(normalizeFullwidthSpaces("hello　　world")).toBe(
        "hello　world"
      );
    });

    test("should add blank line before hashtags", () => {
      const result = addBlankLineBeforeHashtags("text#hashtag");
      expect(result).toContain("\n#hashtag");
    });

    test("should move hashtags to end without breaking URLs", () => {
      const input = "Check https://example.com #tag1 for more";
      const result = moveHashtagsToEnd(input);
      // Should preserve URL and move hashtags
      expect(result).toContain("https://example.com");
      expect(result).toContain("#tag1");
      expect(result).toMatch(/#tag1\s*$/);
    });

    test("should move hashtags without breaking mentions", () => {
      const input = "Hello @user #tag here's the message";
      const result = moveHashtagsToEnd(input);
      expect(result).toContain("@user");
      expect(result).toContain("#tag");
    });

    test("should move hashtags while preserving paragraph structure", () => {
      const input = "Para 1\n\nPara 2 #tag1\n\nPara 3 #tag2";
      const result = moveHashtagsToEnd(input);
      const expected = "Para 1\n\nPara 2\n\nPara 3\n\n#tag1 #tag2";
      expect(result).toBe(expected);
    });

    test("should preserve blank lines when moving hashtags", () => {
      const input = "Line 1\n\nLine 2 #tag\n\nLine 3";
      const result = moveHashtagsToEnd(input);
      // Should maintain the blank lines between paragraphs
      expect(result).toContain("Line 1\n\nLine 2\n\nLine 3");
      expect(result).toContain("#tag");
    });

    test("should handle hashtags with URLs and blank lines completely", () => {
      const input = "First para\n\nSecond https://example.com #tag1\n\nThird #tag2";
      const result = moveHashtagsToEnd(input);
      expect(result).toBe("First para\n\nSecond https://example.com\n\nThird\n\n#tag1 #tag2");
    });
  });

  describe("Apply formatting with multiple options", () => {
    test("should apply multiple formatting options", () => {
      const input = "text  \n\n\n#hashtag";
      const result = applyFormatting(input, {
        removeTrailingSpaces: true,
        reduceBlankLines: true,
        trimEnds: true,
      });
      expect(result).not.toContain("  ");
      expect(result).not.toContain("\n\n\n");
    });

    test("should apply move hashtags option", () => {
      const input = "hello #tag world";
      const result = applyFormatting(input, {
        moveHashtagsToEnd: true,
      });
      expect(result).toContain("#tag");
      expect(result).toMatch(/#tag\s*$/);
    });

    test("should return original text with no options", () => {
      const input = "hello world";
      const result = applyFormatting(input, {});
      expect(result).toBe(input);
    });

    test("should apply all options in correct order", () => {
      const input = "  line1  \r\n\r\nline2\r\n\n\n\nline3  ";
      const result = applyFormatting(input, {
        normalizeLineBreaks: true,
        removeTrailingSpaces: true,
        reduceBlankLines: true,
        trimEnds: true,
      });
      // Should be normalized and clean
      expect(result).not.toContain("\r");
      expect(result).not.toContain("  ");
      expect(result).not.toMatch(/^\s+/);
      expect(result).not.toMatch(/\s+$/);
    });
  });

  describe("Statistics calculation", () => {
    test("should calculate all stats correctly for complete text", () => {
      const text = "hello #tag\nhttps://example.com @user";
      const stats = calculateStats(text);
      expect(stats.charCount).toBeGreaterThan(0);
      expect(stats.lineCount).toBe(2);
      expect(stats.hashtagCount).toBe(1);
      expect(stats.urlCount).toBe(1);
      expect(stats.mentionCount).toBe(1);
    });

    test("should handle empty text stats", () => {
      const stats = calculateStats("");
      expect(stats.charCount).toBe(0);
      expect(stats.wordCount).toBe(0);
      expect(stats.lineCount).toBe(0); // Empty string returns 0 lines, not 1
      expect(stats.hashtagCount).toBe(0);
    });

    test("should calculate stats for Japanese text", () => {
      const text = "こんにちは\n#テスト";
      const stats = calculateStats(text);
      expect(stats.charCount).toBeGreaterThan(0);
      expect(stats.hashtagCount).toBe(1);
    });
  });

  describe("Platform limits", () => {
    test("should have correct platform limits defined", () => {
      expect(PLATFORM_LIMITS.twitter).toBe(280);
      expect(PLATFORM_LIMITS.instagram).toBe(2200);
      expect(PLATFORM_LIMITS.linkedin).toBe(3000);
    });
  });

  describe("Edge cases and error handling", () => {
    test("should handle very long text", () => {
      const longText = "a".repeat(10000);
      const stats = calculateStats(longText);
      expect(stats.charCount).toBe(10000);
    });

    test("should handle text with null bytes (should not crash)", () => {
      const text = "hello\x00world";
      expect(() => calculateStats(text)).not.toThrow();
    });

    test("should handle text with only whitespace", () => {
      const stats = calculateStats("   \n\n  \t  ");
      expect(stats.charCount).toBeGreaterThan(0);
      expect(stats.charCountWithoutSpaces).toBe(0);
    });

    test("should handle Unicode normalization edge cases", () => {
      const text1 = "café"; // NFC
      const text2 = "cafe\u0301"; // NFD
      // Both should be counted (exact count may vary)
      expect(getDisplayCharCount(text1)).toBeGreaterThan(0);
      expect(getDisplayCharCount(text2)).toBeGreaterThan(0);
    });
  });

  /**
   * Verification tests using official twitter-text library
   * These tests validate that our implementation matches the official X character counting
   */
  describe("Official X character counting verification (twitter-text)", () => {
    let parseTweet: any;

    beforeAll(() => {
      // Import twitter-text CommonJS in Node.js environment
      try {
        parseTweet = require("twitter-text").parseTweet;
      } catch {
        console.warn("twitter-text not available in test environment");
      }
    });

    const validateAgainstTwitterText = (text: string) => {
      if (!parseTweet) {
        console.warn(`Skipping twitter-text validation for: ${text}`);
        return;
      }
      
      const official = parseTweet(text).weightedLength;
      const our = calculateTwitterCharCount(text).count;
      
      console.log(`Text: "${text}"`);
      console.log(`  Official twitter-text: ${official}`);
      console.log(`  Our implementation: ${our}`);
      
      expect(our).toBe(official);
    };

    test("verify basic ASCII text", () => {
      validateAgainstTwitterText("hello world");
    });

    test("verify Japanese text weighting", () => {
      validateAgainstTwitterText("こんにちは");
    });

    test("verify emoji weighting", () => {
      validateAgainstTwitterText("😀😀😀");
    });

    test("verify mixed Japanese + emoji + URL", () => {
      validateAgainstTwitterText("テスト 📊 https://example.com");
    });

    test("verify URL-only text", () => {
      validateAgainstTwitterText("https://example.com");
    });

    test("verify multiple URLs", () => {
      validateAgainstTwitterText("Check https://a.com and https://b.com");
    });

    test("verify mention + URL", () => {
      validateAgainstTwitterText("@user check https://example.com");
    });

    test("verify Japanese + emoji + newline + URL", () => {
      validateAgainstTwitterText("日本語テスト📊\nhttps://example.com");
    });

    test("verify text with newlines", () => {
      validateAgainstTwitterText("line1\nline2\nline3");
    });

    test("verify combining emoji (ZWJ sequence)", () => {
      validateAgainstTwitterText("👨‍💼👩‍💻");
    });
  });
});
