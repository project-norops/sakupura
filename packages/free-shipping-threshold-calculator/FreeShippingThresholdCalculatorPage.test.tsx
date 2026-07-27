/** @jest-environment jsdom */
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { FreeShippingThresholdCalculatorPage } from "./FreeShippingThresholdCalculatorPage";

beforeEach(() => {
  window.localStorage.clear();
  window.gtag = jest.fn();
  window.requestAnimationFrame = (callback) => {
    callback(0);
    return 1;
  };
});

test("explains the inputs, outputs, decision scope, and text-based comparison", () => {
  render(<FreeShippingThresholdCalculatorPage />);
  expect(screen.getByText(/平均注文3,000円、送料700円/)).toBeInTheDocument();
  expect(
    screen.getByRole("region", { name: "かんたん操作手順" }),
  ).toBeInTheDocument();
  expect(screen.getByText("1. 入力するもの")).toBeInTheDocument();
  expect(screen.getByText("2. 算出されるもの")).toBeInTheDocument();
  expect(screen.getByText("3. 判断できること")).toBeInTheDocument();
  expect(
    screen.getByText(/最適な送料無料ラインまでは判定できません/),
  ).toBeInTheDocument();
  const run = screen.getByRole("button", { name: "送料無料ラインを比較する" });
  expect(run).toHaveAttribute(
    "data-analytics-tool-id",
    "free-shipping-threshold-calculator",
  );
  fireEvent.click(run);
  expect(screen.getAllByText("ライン到達")).toHaveLength(3);
  expect(screen.getAllByText("1注文利益を維持・増加")).toHaveLength(2);
  expect(screen.getByText("1注文利益が減少")).toBeInTheDocument();
  expect(screen.queryByText("商品条件の保存")).not.toBeInTheDocument();
  expect(screen.getByText("送料無料条件の保存")).toBeInTheDocument();
  expect(
    screen.getByText(/購入率や注文数の変化は予測していないため/),
  ).toBeInTheDocument();
});

test("explains when a candidate does not reach the threshold", () => {
  render(<FreeShippingThresholdCalculatorPage />);
  const additions = screen.getAllByLabelText(/見込む追加購入額/);
  fireEvent.change(additions[0], { target: { value: "200" } });
  fireEvent.click(
    screen.getByRole("button", { name: "送料無料ラインを比較する" }),
  );
  expect(screen.getByText("あと800円")).toBeInTheDocument();
  expect(screen.getAllByText("未達のため算出対象外")).toHaveLength(2);
  expect(screen.getByText("想定注文額がライン未達")).toBeInTheDocument();
});

test("stops with a clear error when the current order amount is zero", () => {
  render(<FreeShippingThresholdCalculatorPage />);
  fireEvent.change(screen.getByLabelText(/平均注文額/), {
    target: { value: "0" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "送料無料ラインを比較する" }),
  );
  expect(screen.getByRole("alert")).toHaveTextContent(
    "平均注文額は0円より大きい金額を入力してください。",
  );
  expect(screen.queryByText("送料無料条件の保存")).not.toBeInTheDocument();
});
