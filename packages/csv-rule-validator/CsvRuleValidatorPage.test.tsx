/** @jest-environment jsdom */

import "@testing-library/jest-dom";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { CsvRuleValidatorPage } from "./CsvRuleValidatorPage";

beforeEach(() => {
  window.localStorage.clear();
  window.gtag = jest.fn();
  window.requestAnimationFrame = (callback) => {
    callback(0);
    return 1;
  };
  URL.createObjectURL = jest.fn(() => "blob:csv");
  URL.revokeObjectURL = jest.fn();
  jest.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
});

test("shows quick steps and downloads examples", () => {
  render(<CsvRuleValidatorPage />);
  const guide = screen.getByRole("region", { name: "かんたん操作手順" });
  expect(within(guide).getByText("CSVを読み込む")).toBeInTheDocument();
  expect(
    within(guide).getByText("結果CSV・エラー一覧を保存する"),
  ).toBeInTheDocument();

  fireEvent.click(
    screen.getByRole("button", { name: "入力サンプルCSVを保存" }),
  );
  fireEvent.click(
    screen.getByRole("button", { name: "入力テンプレートCSVを保存" }),
  );
  expect(URL.createObjectURL).toHaveBeenCalledTimes(2);
});

test("loads the configured sample, validates it, and enables both outputs", () => {
  render(<CsvRuleValidatorPage />);
  expect(screen.queryByText("開発検討中")).not.toBeInTheDocument();

  fireEvent.click(
    screen.getByRole("button", { name: "指摘例入りサンプルを読み込む" }),
  );
  expect(screen.getByLabelText("価格のデータの種類")).toHaveValue("number");
  expect(screen.getByLabelText("販売開始日のデータの種類")).toHaveValue("date");
  expect(screen.getByLabelText("商品コードの最大文字数")).toHaveValue("10");

  const validateButton = screen.getByRole("button", {
    name: "このルールでCSVを検証",
  });
  expect(validateButton).toHaveAttribute("data-analytics-event", "tool_run");
  expect(validateButton).toHaveAttribute(
    "data-analytics-tool-id",
    "csv-rule-validator",
  );
  expect(validateButton).toHaveAttribute("data-analytics-platform", "browser");
  fireEvent.click(validateButton);
  expect(screen.getByRole("heading", { name: /件の指摘/ })).toBeInTheDocument();
  expect(screen.getByText("数値として読み取れません。")).toBeInTheDocument();
  expect(
    screen.getByText("YYYY-MM-DD形式の実在する日付ではありません。"),
  ).toBeInTheDocument();
  expect(screen.getAllByText("開発検討中")).toHaveLength(2);

  const resultButton = screen.getByRole("button", {
    name: "検証結果CSVを保存",
  });
  const errorButton = screen.getByRole("button", {
    name: "エラー一覧CSVを保存",
  });
  expect(resultButton).toBeEnabled();
  expect(errorButton).toBeEnabled();
  fireEvent.click(resultButton);
  fireEvent.click(errorButton);
  expect(URL.createObjectURL).toHaveBeenCalledTimes(2);
});
