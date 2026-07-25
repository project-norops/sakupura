/** @jest-environment jsdom */

import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SocialTextFormatterPage } from "./SocialTextFormatterPage";

const originalClipboard = Object.getOwnPropertyDescriptor(
  navigator,
  "clipboard",
);

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  if (originalClipboard) {
    Object.defineProperty(navigator, "clipboard", originalClipboard);
  } else {
    Reflect.deleteProperty(navigator, "clipboard");
  }
});

function getEditor(): HTMLTextAreaElement {
  return screen.getByRole("textbox", { name: "入力テキスト" });
}

describe("SocialTextFormatterPage", () => {
  test("explains that text processing does not use AI or send text externally", () => {
    render(<SocialTextFormatterPage />);

    expect(
      screen.getByText("AI不使用・文章は端末内で処理"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /入力した文章は、本ツールの処理としてサーバーや外部AIへ送信されません。/,
      ),
    ).toBeInTheDocument();
  });

  test("switches platform limits and uses the official X count", async () => {
    const user = userEvent.setup();
    render(<SocialTextFormatterPage />);

    await user.type(getEditor(), "こんにちは");
    expect(
      screen.getByText((_, element) => element?.textContent === "10 / 280"),
    ).toBeInTheDocument();
    expect(screen.getByText("日本語なら約135文字")).toBeInTheDocument();
    expect(
      screen.getByText(/日本語だけの場合は最大約140文字です。/),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Instagram" }));
    expect(
      screen.getByText((_, element) => element?.textContent === "5 / 2200"),
    ).toBeInTheDocument();
    expect(screen.getByText("入力文字数（目安）")).toBeInTheDocument();
    expect(
      screen.getByText(/絵文字や結合文字の扱いは投稿環境により異なる/),
    ).toBeInTheDocument();
  });

  test("formats only after the primary action and keeps the original unchanged", async () => {
    const user = userEvent.setup();
    render(<SocialTextFormatterPage />);

    const original = "本文  \n\n\n#タグ";
    await user.type(getEditor(), original);
    expect(
      screen.queryByRole("heading", { name: "3. 整形結果を確認" }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "文章を整形する" }));
    expect(getEditor()).toHaveValue(original);
    expect(
      screen.getByRole("heading", { name: "3. 整形結果を確認" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/種類・合計.*箇所を整形しました/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        (_, element) => element?.textContent === "本文\n\n#タグ",
      ),
    ).toBeInTheDocument();
  });

  test("loads a deliberately messy demo with visible formatting options", async () => {
    const user = userEvent.setup();
    render(<SocialTextFormatterPage />);

    await user.click(screen.getByRole("button", { name: "整形デモを試す" }));
    expect(getEditor().value.length).toBeGreaterThan(300);
    expect(
      screen.getByRole("checkbox", { name: "連続全角スペースを整理" }),
    ).toBeChecked();
    expect(
      screen.getByRole("checkbox", { name: "ハッシュタグを文末にまとめる" }),
    ).toBeChecked();
    expect(
      screen.getByRole("checkbox", { name: "重複ハッシュタグを削除" }),
    ).toBeChecked();

    await user.click(screen.getByRole("button", { name: "文章を整形する" }));
    expect(
      screen.getByText(/種類・合計.*箇所を整形しました/),
    ).toBeInTheDocument();
    expect(screen.getByText(/重複ハッシュタグの削除/)).toBeInTheDocument();
  });

  test("creates, edits, inserts, and deletes a hashtag group", async () => {
    const user = userEvent.setup();
    render(<SocialTextFormatterPage />);

    await user.click(screen.getByRole("button", { name: "+ 新規" }));
    await user.type(
      screen.getByRole("textbox", { name: "グループ名" }),
      "告知",
    );
    await user.type(
      screen.getByRole("textbox", { name: "ハッシュタグ" }),
      "新作{enter}サクプラ",
    );
    await user.click(screen.getByRole("button", { name: "保存" }));

    await user.click(screen.getByRole("button", { name: "告知を編集" }));
    const editName = screen.getByRole("textbox", { name: "編集グループ名" });
    await user.clear(editName);
    await user.type(editName, "公開告知");
    await user.click(screen.getByRole("button", { name: "保存" }));

    await user.click(screen.getByRole("button", { name: "公開告知を挿入" }));
    expect(getEditor()).toHaveValue("\n#新作 #サクプラ");

    await user.click(screen.getByRole("button", { name: "公開告知を削除" }));
    expect(screen.queryByText("公開告知")).not.toBeInTheDocument();
  });

  test("restores drafts and hashtag groups from local storage", async () => {
    localStorage.setItem(
      "social-text-formatter:draft",
      JSON.stringify("保存済み"),
    );
    localStorage.setItem(
      "social-text-formatter:hashtag-groups",
      JSON.stringify([{ id: "1", name: "保存グループ", hashtags: ["#保存"] }]),
    );

    render(<SocialTextFormatterPage />);

    expect(await screen.findByDisplayValue("保存済み")).toBeInTheDocument();
    expect(await screen.findByText("保存グループ")).toBeInTheDocument();
  });

  test("shows a manual-copy fallback when clipboard access fails", async () => {
    const user = userEvent.setup();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: jest.fn().mockRejectedValue(new Error("denied")) },
    });
    render(<SocialTextFormatterPage />);

    await user.type(getEditor(), "コピー対象");
    await user.click(screen.getByRole("button", { name: "文章を整形する" }));
    await user.click(screen.getByRole("button", { name: "整形前をコピー" }));

    const fallback = await screen.findByRole("textbox", {
      name: "コピー用テキスト",
    });
    await waitFor(() => expect(fallback).toHaveValue("コピー対象"));
  });

  test("preserves URL fragments through the formatting UI", async () => {
    const user = userEvent.setup();
    render(<SocialTextFormatterPage />);

    const input = "https://example.com#section #tag";
    await user.type(getEditor(), input);
    await user.click(
      screen.getByRole("checkbox", { name: "ハッシュタグを文末にまとめる" }),
    );
    await user.click(screen.getByRole("button", { name: "文章を整形する" }));

    expect(getEditor()).toHaveValue(input);
    expect(
      screen.getByText(
        (_, element) =>
          element?.textContent === "https://example.com#section\n\n#tag",
      ),
    ).toBeInTheDocument();
  });

  test("opens the official X intent with the formatted text", async () => {
    const user = userEvent.setup();
    const openSpy = jest.spyOn(window, "open").mockImplementation(() => null);
    render(<SocialTextFormatterPage />);

    await user.type(getEditor(), "こんにちは");
    await user.click(screen.getByRole("button", { name: "文章を整形する" }));
    await user.click(screen.getByRole("button", { name: "Xで投稿画面を開く" }));

    expect(openSpy).toHaveBeenCalledWith(
      `https://x.com/intent/tweet?text=${encodeURIComponent("こんにちは")}`,
      "_blank",
      "noopener,noreferrer",
    );
    openSpy.mockRestore();
  });

  test("disables posting when the formatted text exceeds the selected limit", async () => {
    const user = userEvent.setup();
    render(<SocialTextFormatterPage />);

    await user.type(getEditor(), "あ".repeat(141));
    await user.click(screen.getByRole("button", { name: "文章を整形する" }));

    expect(
      screen.getByRole("button", { name: "Xで投稿画面を開く" }),
    ).toBeDisabled();
    expect(screen.getByText(/上限を2超えています/)).toBeInTheDocument();
  });

  test("copies formatted text and opens Instagram", async () => {
    const user = userEvent.setup();
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    const openSpy = jest.spyOn(window, "open").mockImplementation(() => null);
    render(<SocialTextFormatterPage />);

    await user.click(screen.getByRole("tab", { name: "Instagram" }));
    await user.type(getEditor(), "投稿文");
    await user.click(screen.getByRole("button", { name: "文章を整形する" }));
    await user.click(
      screen.getByRole("button", { name: "Instagram用にコピーして開く" }),
    );

    expect(openSpy).toHaveBeenCalledWith(
      "https://www.instagram.com/",
      "_blank",
      "noopener,noreferrer",
    );
    expect(writeText).toHaveBeenCalledWith("投稿文");
    openSpy.mockRestore();
  });
});
