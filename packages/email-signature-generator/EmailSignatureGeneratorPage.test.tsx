/** @jest-environment jsdom */

import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EmailSignatureGeneratorPage } from "./EmailSignatureGeneratorPage";

beforeEach(() => {
  localStorage.clear();
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: jest.fn().mockResolvedValue(undefined) },
  });
});

test("explains local processing and keeps copy disabled until a name is entered", () => {
  render(<EmailSignatureGeneratorPage />);

  expect(
    screen.getByText(/AI不使用・入力内容はブラウザ内だけで処理/),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "書式付き署名をコピー" }),
  ).toBeDisabled();
  expect(
    screen.getByText(/氏名を入力すると、ここに署名が表示/),
  ).toBeInTheDocument();
});

test("loads a complete sample and renders the preview", async () => {
  const user = userEvent.setup();
  render(<EmailSignatureGeneratorPage />);

  await user.click(screen.getByRole("button", { name: "サンプルを試す" }));

  expect(screen.getByDisplayValue("山田 太郎")).toBeInTheDocument();
  expect(screen.getByText("山田 太郎")).toBeInTheDocument();
  expect(screen.getByText("taro@example.com")).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "書式付き署名をコピー" }),
  ).toBeEnabled();
});

test("copies the plain-text signature and reports success", async () => {
  const user = userEvent.setup();
  render(<EmailSignatureGeneratorPage />);

  await user.type(screen.getByPlaceholderText("例：山田 太郎"), "佐藤 花子");
  await user.type(
    screen.getByPlaceholderText("name@example.com"),
    "hanako@example.com",
  );
  await user.click(screen.getByRole("button", { name: "テキスト版をコピー" }));

  expect(screen.getByText("テキスト版をコピーしました。")).toBeInTheDocument();
});

test("restores saved input from local storage", async () => {
  localStorage.setItem(
    "email-signature-generator:signature",
    JSON.stringify({ name: "保存 太郎", company: "保存株式会社" }),
  );

  render(<EmailSignatureGeneratorPage />);

  expect(await screen.findByDisplayValue("保存 太郎")).toBeInTheDocument();
  expect(screen.getByDisplayValue("保存株式会社")).toBeInTheDocument();
});

test("clears all fields after confirmation", async () => {
  const user = userEvent.setup();
  jest.spyOn(window, "confirm").mockReturnValue(true);
  render(<EmailSignatureGeneratorPage />);

  await user.click(screen.getByRole("button", { name: "サンプルを試す" }));
  await user.click(screen.getByRole("button", { name: "すべて消去" }));

  expect(screen.getByPlaceholderText("例：山田 太郎")).toHaveValue("");
  expect(
    screen.getByRole("button", { name: "書式付き署名をコピー" }),
  ).toBeDisabled();
  await waitFor(() =>
    expect(
      localStorage.getItem("email-signature-generator:signature"),
    ).not.toContain("山田 太郎"),
  );
});
