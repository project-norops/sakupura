/** @jest-environment jsdom */

import "@testing-library/jest-dom";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { CsvJoinerPage } from "./CsvJoinerPage";

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

test("shows quick steps and downloads four input examples", () => {
  render(<CsvJoinerPage />);
  const guide = screen.getByRole("region", { name: "かんたん操作手順" });
  expect(
    within(guide).getByText("基準・参照CSVを読み込む"),
  ).toBeInTheDocument();
  for (const name of [
    "基準サンプルを保存",
    "参照サンプルを保存",
    "基準テンプレートを保存",
    "参照テンプレートを保存",
  ]) {
    fireEvent.click(screen.getByRole("button", { name }));
  }
  expect(URL.createObjectURL).toHaveBeenCalledTimes(4);
});

test("shows duplicate expansion and enables both output downloads", () => {
  render(<CsvJoinerPage />);
  fireEvent.click(
    screen.getByRole("button", { name: "操作サンプルを読み込む" }),
  );
  expect(screen.getAllByRole("combobox")).toHaveLength(2);
  expect(screen.getByRole("radio", { name: /left join/ })).toBeChecked();

  const runButton = screen.getByRole("button", { name: "結合結果を確認" });
  expect(runButton).toHaveAttribute("data-analytics-tool-id", "csv-joiner");
  fireEvent.click(runButton);

  expect(
    screen.getByRole("heading", { name: "4行の結合CSV" }),
  ).toBeInTheDocument();
  expect(screen.getByText(/P-002（2行、元行3・4）/)).toBeInTheDocument();
  expect(screen.getAllByText("開発検討中")).toHaveLength(2);

  fireEvent.click(screen.getByRole("button", { name: "結合CSVを保存" }));
  fireEvent.click(screen.getByRole("button", { name: "未一致一覧CSVを保存" }));
  expect(URL.createObjectURL).toHaveBeenCalledTimes(2);
});
