/** @jest-environment jsdom */
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { PopupEventProfitCalculatorPage } from "./PopupEventProfitCalculatorPage";

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

test("explains the boundary and calculates the sample event", () => {
  render(<PopupEventProfitCalculatorPage />);
  expect(
    screen.getByText(/マルシェ（対面販売イベント）、フリーマーケット/),
  ).toBeInTheDocument();
  expect(
    screen.getByText(/フリーマーケットは家庭の不用品や中古品/),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("region", { name: "かんたん操作手順" }),
  ).toBeInTheDocument();
  expect(
    screen.getByText(/来場者数や需要、販売数、完売、利益を予測・保証/),
  ).toBeInTheDocument();

  const run = screen.getByRole("button", { name: "出店採算を計算する" });
  expect(run).toHaveAttribute(
    "data-analytics-tool-id",
    "popup-event-profit-calculator",
  );
  fireEvent.click(run);

  expect(screen.getByText("29点")).toBeInTheDocument();
  expect(screen.getByText("68,600円")).toBeInTheDocument();
  expect(screen.getByText("10,330円")).toBeInTheDocument();
  expect(screen.getByText("出店条件の保存")).toBeInTheDocument();
  expect(screen.getByText("複数イベント比較")).toBeInTheDocument();
});

test("stops when a product has no sellable quantity", () => {
  render(<PopupEventProfitCalculatorPage />);
  fireEvent.change(screen.getAllByLabelText(/持込数/)[0], {
    target: { value: "0" },
  });
  fireEvent.click(screen.getByRole("button", { name: "出店採算を計算する" }));
  expect(screen.getByRole("alert")).toHaveTextContent(
    "0点より多い持込数を入力してください。",
  );
  expect(screen.queryByText("出店条件の保存")).not.toBeInTheDocument();
});

test("saves the result as CSV", () => {
  render(<PopupEventProfitCalculatorPage />);
  fireEvent.click(screen.getByRole("button", { name: "出店採算を計算する" }));
  fireEvent.click(screen.getByRole("button", { name: "採算結果CSVを保存" }));
  expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("status")).toHaveTextContent(
    "採算結果CSVを保存しました。",
  );
});
