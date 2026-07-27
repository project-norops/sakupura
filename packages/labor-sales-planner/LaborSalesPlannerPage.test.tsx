/** @jest-environment jsdom */

import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { LaborSalesPlannerPage } from "./LaborSalesPlannerPage";

beforeEach(() => {
  window.gtag = jest.fn();
});

test("explains the use case and calculates the restaurant sample", () => {
  render(<LaborSalesPlannerPage />);
  expect(
    screen.getByRole("region", { name: "入力・算出・判断" }),
  ).toBeInTheDocument();
  expect(screen.getByText(/ランチの予想売上6万円/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "シフト採算を計算する" }));
  expect(screen.getAllByText("5,000円").length).toBeGreaterThan(0);
  expect(screen.getByText("27.6%")).toBeInTheDocument();
  expect(screen.getByText("シフト条件の保存")).toBeInTheDocument();
  expect(
    screen.getByText(/この試算だけで人員削減を決めず/),
  ).toBeInTheDocument();
});

test("adds and removes a time slot", () => {
  render(<LaborSalesPlannerPage />);
  fireEvent.click(screen.getByRole("button", { name: "時間帯を追加" }));
  expect(screen.getByRole("group", { name: "時間帯 4" })).toBeInTheDocument();
  const removeButtons = screen.getAllByRole("button", {
    name: "この時間帯を削除",
  });
  fireEvent.click(removeButtons[removeButtons.length - 1]);
  expect(
    screen.queryByRole("group", { name: "時間帯 4" }),
  ).not.toBeInTheDocument();
});

test("shows an actionable validation error", () => {
  render(<LaborSalesPlannerPage />);
  fireEvent.change(screen.getAllByLabelText(/予想売上/)[0], {
    target: { value: "0" },
  });
  fireEvent.click(screen.getByRole("button", { name: "シフト採算を計算する" }));
  expect(screen.getByRole("alert")).toHaveTextContent("0より大きい値");
});
