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
  test("switches platform limits and uses the official X count", async () => {
    const user = userEvent.setup();
    render(<SocialTextFormatterPage />);

    await user.type(getEditor(), "こんにちは");
    expect(
      screen.getByText((_, element) => element?.textContent === "10 / 280"),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Instagram" }));
    expect(
      screen.getByText((_, element) => element?.textContent === "5 / 2200"),
    ).toBeInTheDocument();
  });

  test("applies formatting and restores the exact original text", async () => {
    const user = userEvent.setup();
    render(<SocialTextFormatterPage />);

    const original = "本文  \n\n\n#タグ";
    await user.type(getEditor(), original);
    await user.click(
      screen.getByRole("button", { name: "整形結果を入力欄へ反映" }),
    );
    expect(getEditor()).toHaveValue("本文\n\n#タグ");

    await user.click(screen.getByRole("button", { name: "原文へ戻す" }));
    expect(getEditor()).toHaveValue(original);
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
    await user.click(screen.getByRole("button", { name: "原文をコピー" }));

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
    await user.click(
      screen.getByRole("button", { name: "整形結果を入力欄へ反映" }),
    );

    expect(getEditor()).toHaveValue("https://example.com#section\n\n#tag");
  });
});
