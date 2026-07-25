/**
 * Tests for SNS Text Formatting Utilities
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

describe("Text Formatting Utilities", () => {
  describe("Character counting", () => {
    it("should count regular ASCII characters", () => {
      expect(getDisplayCharCount("hello")).toBe(5);
    });

    it("should count Japanese characters correctly", () => {
      expect(getDisplayCharCount("こんにちは")).toBe(5);
    });

    it("should count emoji as single character", () => {
      const singleEmoji = "😀";
      expect(getDisplayCharCount(singleEmoji)).toBe(1);
    });

    it("should handle emoji with skin tone modifier", () => {
      const emojiWithModifier = "👋🏻"; // Waving hand with skin tone
      expect(getDisplayCharCount(emojiWithModifier)).toBe(1);
    });

    it("should handle mixed text with emoji", () => {
      const mixed = "hello 😀 こんにちは";
      expect(getDisplayCharCount(mixed)).toBe(13); // h e l l o space emoji space こんにちは
    });

    it("should count newlines", () => {
      expect(getDisplayCharCount("hello\nworld")).toBe(11);
    });

    it("should count zero for empty string", () => {
      expect(getDisplayCharCount("")).toBe(0);
    });
  });

  describe("Character count without spaces", () => {
    it("should remove spaces", () => {
      expect(getCharCountWithoutSpaces("hello world")).toBe(10);
    });

    it("should remove full-width spaces", () => {
      expect(getCharCountWithoutSpaces("hello　world")).toBe(10);
    });

    it("should remove newlines", () => {
      expect(getCharCountWithoutSpaces("hello\nworld")).toBe(10);
    });

    it("should handle tabs", () => {
      expect(getCharCountWithoutSpaces("hello\tworld")).toBe(10);
    });
  });

  describe("Word counting", () => {
    it("should count English words", () => {
      expect(getWordCount("hello world test")).toBe(3);
    });

    it("should handle multiple spaces", () => {
      expect(getWordCount("hello  world   test")).toBe(3);
    });

    it("should handle newlines as separators", () => {
      expect(getWordCount("hello\nworld\ntest")).toBe(3);
    });

    it("should return 0 for empty string", () => {
      expect(getWordCount("")).toBe(0);
    });
  });

  describe("Line and paragraph counting", () => {
    it("should count lines correctly", () => {
      expect(getLineCount("line1\nline2\nline3")).toBe(3);
    });

    it("should count single line as 1", () => {
      expect(getLineCount("single line")).toBe(1);
    });

    it("should count paragraphs separated by blank lines", () => {
      const text = "para1\n\npara2\n\npara3";
      expect(getParagraphCount(text)).toBe(3);
    });

    it("should return 0 for empty paragraph", () => {
      expect(getParagraphCount("")).toBe(0);
    });
  });

  describe("Hashtag extraction", () => {
    it("should extract single hashtag", () => {
      const hashtags = extractHashtags("#hello");
      expect(hashtags).toEqual(["#hello"]);
    });

    it("should extract multiple hashtags", () => {
      const hashtags = extractHashtags("text #first #second text");
      expect(hashtags).toEqual(["#first", "#second"]);
    });

    it("should handle hashtags with Japanese", () => {
      const hashtags = extractHashtags("#テスト #日本語");
      expect(hashtags.length).toBeGreaterThanOrEqual(2);
    });

    it("should return empty for no hashtags", () => {
      const hashtags = extractHashtags("no hashtags here");
      expect(hashtags).toEqual([]);
    });
  });

  describe("URL extraction", () => {
    it("should extract single URL", () => {
      const urls = extractUrls("Visit https://example.com for more");
      expect(urls).toContain("https://example.com");
    });

    it("should extract multiple URLs", () => {
      const urls = extractUrls(
        "https://example.com and https://test.org"
      );
      expect(urls.length).toBeGreaterThanOrEqual(2);
    });

    it("should return empty for no URLs", () => {
      const urls = extractUrls("no urls here");
      expect(urls).toEqual([]);
    });
  });

  describe("Mention extraction", () => {
    it("should extract single mention", () => {
      const mentions = extractMentions("Hello @user");
      expect(mentions).toContain("@user");
    });

    it("should extract multiple mentions", () => {
      const mentions = extractMentions("@user1 and @user2");
      expect(mentions.length).toBeGreaterThanOrEqual(2);
    });

    it("should return empty for no mentions", () => {
      const mentions = extractMentions("no mentions here");
      expect(mentions).toEqual([]);
    });
  });

  describe("Twitter character counting", () => {
    it("should count basic text correctly", () => {
      const result = calculateTwitterCharCount("hello");
      expect(result.count).toBe(5);
      expect(result.isOverLimit).toBe(false);
    });

    it("should count URL as 23 characters", () => {
      const result = calculateTwitterCharCount("check https://example.com");
      // "check " = 6 + URL = 23 = 29
      expect(result.count).toBe(29);
    });

    it("should handle multiple URLs", () => {
      const result = calculateTwitterCharCount(
        "see https://example.com and https://test.org"
      );
      // "see " = 4 + URL1 = 23 + " and " = 5 + URL2 = 23 = 55
      expect(result.count).toBeGreaterThanOrEqual(48);
    });

    it("should return isOverLimit true for > 280 chars", () => {
      const longText = "x".repeat(281);
      const result = calculateTwitterCharCount(longText);
      expect(result.isOverLimit).toBe(true);
    });

    it("should handle Japanese text", () => {
      const result = calculateTwitterCharCount("こんにちは");
      expect(result.count).toBe(5);
      expect(result.isOverLimit).toBe(false);
    });

    it("should handle emoji", () => {
      const result = calculateTwitterCharCount("hello 😀");
      expect(result.count).toBeGreaterThanOrEqual(7);
    });
  });

  describe("Text formatting functions", () => {
    it("should remove trailing spaces", () => {
      expect(removeTrailingSpaces("hello  \nworld  ")).toBe("hello\nworld");
    });

    it("should trim text", () => {
      expect(trimText("  hello world  ")).toBe("hello world");
    });

    it("should reduce consecutive blank lines", () => {
      const result = reduceConsecutiveBlankLines("line1\n\n\n\nline2");
      expect(result).toBe("line1\n\nline2");
    });

    it("should normalize line breaks", () => {
      expect(normalizeLineBreaks("line1\r\nline2\rline3")).toBe(
        "line1\nline2\nline3"
      );
    });

    it("should normalize full-width spaces", () => {
      expect(normalizeFullwidthSpaces("hello　　world")).toBe(
        "hello　world"
      );
    });

    it("should add blank line before hashtags", () => {
      const result = addBlankLineBeforeHashtags("text#hashtag");
      expect(result).toContain("\n#hashtag");
    });

    it("should move hashtags to end", () => {
      const result = moveHashtagsToEnd("hello #tag1 world #tag2");
      expect(result).toMatch(/#tag1\s+#tag2\s*$/);
    });
  });

  describe("Apply formatting with options", () => {
    it("should apply multiple formatting options", () => {
      const input = "text  \n\n\n#hashtag";
      const result = applyFormatting(input, {
        removeTrailingSpaces: true,
        reduceBlankLines: true,
        trimEnds: true,
      });
      expect(result).not.toContain("  ");
      expect(result).not.toContain("\n\n\n");
    });

    it("should apply move hashtags option", () => {
      const input = "hello #tag world";
      const result = applyFormatting(input, {
        moveHashtagsToEnd: true,
      });
      expect(result).toMatch(/#tag\s*$/);
    });

    it("should return original text with no options", () => {
      const input = "hello world";
      const result = applyFormatting(input, {});
      expect(result).toBe(input);
    });
  });

  describe("Statistics", () => {
    it("should calculate all stats correctly", () => {
      const text = "hello world #tag\nhttps://example.com @user";
      const stats = calculateStats(text);
      expect(stats.charCount).toBeGreaterThan(0);
      expect(stats.lineCount).toBe(2);
      expect(stats.hashtagCount).toBe(1);
      expect(stats.urlCount).toBe(1);
      expect(stats.mentionCount).toBe(1);
    });

    it("should handle empty text", () => {
      const stats = calculateStats("");
      expect(stats.charCount).toBe(0);
      expect(stats.wordCount).toBe(0);
      expect(stats.lineCount).toBe(1);
    });
  });

  describe("Platform limits", () => {
    it("should have correct platform limits", () => {
      expect(PLATFORM_LIMITS.twitter).toBe(280);
      expect(PLATFORM_LIMITS.instagram).toBe(2200);
      expect(PLATFORM_LIMITS.linkedin).toBe(3000);
    });
  });
});
