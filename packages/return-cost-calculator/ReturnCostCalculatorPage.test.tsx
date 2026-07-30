/** @jest-environment jsdom */
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { ReturnCostCalculatorPage } from "./ReturnCostCalculatorPage";

beforeEach(() => {
  window.localStorage.clear();
  window.gtag = jest.fn();
  window.requestAnimationFrame = (callback) => {
    callback(0);
    return 1;
  };
  URL.createObjectURL = jest.fn(() => "blob:result");
  URL.revokeObjectURL = jest.fn();
  HTMLAnchorElement.prototype.click = jest.fn();
});

test("explains the scope and compares the sample scenarios", () => {
  render(<ReturnCostCalculatorPage />);
  expect(screen.getByText(/100件販売して返品率が8%/)).toBeInTheDocument();
  expect(
    screen.getByRole("region", { name: "かんたん操作手順" }),
  ).toBeInTheDocument();
  expect(screen.getByText(/返品の可否や返品特約の適法性/)).toBeInTheDocument();

  const run = screen.getByRole("button", { name: "返品後の利益を比較する" });
  expect(run).toHaveAttribute(
    "data-analytics-tool-id",
    "return-cost-calculator",
  );
  fireEvent.click(run);

  expect(screen.getAllByText("186,200円").length).toBeGreaterThan(0);
  expect(screen.getByText("37,600円")).toBeInTheDocument();
  expect(screen.getByText("4,700円")).toBeInTheDocument();
  expect(screen.getByText("返品条件の保存")).toBeInTheDocument();
  expect(screen.getByText("複数商品の返品比較")).toBeInTheDocument();
});

test("stops when the order count is zero", () => {
  render(<ReturnCostCalculatorPage />);
  fireEvent.change(screen.getByLabelText(/注文数/), { target: { value: "0" } });
  fireEvent.click(
    screen.getByRole("button", { name: "返品後の利益を比較する" }),
  );
  expect(screen.getByRole("alert")).toHaveTextContent(
    "注文数は0件より大きい件数を入力してください。",
  );
  expect(screen.queryByText("返品条件の保存")).not.toBeInTheDocument();
});

test("saves the comparison result as CSV", () => {
  render(<ReturnCostCalculatorPage />);
  fireEvent.click(
    screen.getByRole("button", { name: "返品後の利益を比較する" }),
  );
  fireEvent.click(screen.getByRole("button", { name: "比較結果CSVを保存" }));
  expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("status")).toHaveTextContent(
    "比較結果CSVを保存しました。",
  );
});
