/** @jest-environment jsdom */

import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { ReorderPointCalculatorPage } from "./ReorderPointCalculatorPage";

beforeEach(() => {
  window.localStorage.clear();
  window.gtag = jest.fn();
  window.requestAnimationFrame = (callback) => {
    callback(0);
    return 1;
  };
});

test("shows the sample use case, three steps, units, and actionable results", () => {
  render(<ReorderPointCalculatorPage />);

  expect(screen.getByText(/毎週10個売れ、納品に5日/)).toBeInTheDocument();
  expect(screen.getByRole("region", { name: "かんたん操作手順" })).toBeInTheDocument();
  expect(screen.getByLabelText(/平均販売数/)).toHaveValue(10);

  const run = screen.getByRole("button", { name: "発注目安を計算する" });
  expect(run).toHaveAttribute("data-analytics-tool-id", "reorder-point-calculator");
  fireEvent.click(run);

  expect(screen.getByText("9個")).toBeInTheDocument();
  expect(screen.getByText("16個")).toBeInTheDocument();
  expect(screen.getByText("18個")).toBeInTheDocument();
  expect(screen.getByText(/発注の要否を検討/)).toBeInTheDocument();
  expect(screen.getByText("商品条件の保存")).toBeInTheDocument();
  expect(screen.getByText("発注前に確認すること")).toBeInTheDocument();
});

test("explains invalid average and maximum values", () => {
  render(<ReorderPointCalculatorPage />);
  fireEvent.change(screen.getByLabelText(/最大販売数/), {
    target: { value: "5" },
  });
  fireEvent.click(screen.getByRole("button", { name: "発注目安を計算する" }));
  expect(screen.getByRole("alert")).toHaveTextContent("最大販売数は平均販売数以上");
});
