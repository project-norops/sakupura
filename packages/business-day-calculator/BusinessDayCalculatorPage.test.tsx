/** @jest-environment jsdom */

import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BusinessDayCalculatorPage } from "./BusinessDayCalculatorPage";

beforeEach(() => {
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: jest.fn().mockResolvedValue(undefined) },
  });
});

test("calculates five business days after a fixed date and shows excluded weekend", async () => {
  const user = userEvent.setup();
  render(<BusinessDayCalculatorPage />);
  const date = screen.getByLabelText("基準日");
  await user.clear(date);
  await user.type(date, "2026-07-27");
  await user.click(screen.getByRole("button", { name: "期限を計算する" }));
  expect(screen.getAllByText(/2026年8月3日月曜日/)).toHaveLength(2);
  expect(screen.getAllByText("除外").length).toBeGreaterThanOrEqual(2);
});

test("links to Cabinet Office holiday data and explains limitations", () => {
  render(<BusinessDayCalculatorPage />);
  expect(screen.getByText(/祝日データ：2025年〜2027年/)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /内閣府/ })).toHaveAttribute(
    "href",
    expect.stringContaining("cao.go.jp"),
  );
  expect(screen.getByText(/重要な期限は関係先へ確認/)).toBeInTheDocument();
});
