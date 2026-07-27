/** @jest-environment jsdom */

import "@testing-library/jest-dom";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { CsvPivotReshapePage } from "./CsvPivotReshapePage";

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

test("shows quick steps and downloads samples with headers and examples", () => {
  render(<CsvPivotReshapePage />);
  const guide = screen.getByRole("region", { name: "かんたん操作手順" });
  expect(within(guide).getByText("CSVを読み込む")).toBeInTheDocument();
  fireEvent.click(
    screen.getByRole("button", { name: "集計サンプルCSVを保存" }),
  );
  fireEvent.click(
    screen.getByRole("button", { name: "縦持ちテンプレートを保存" }),
  );
  expect(URL.createObjectURL).toHaveBeenCalledTimes(2);
});

test("pivots the sample, exposes warnings, and downloads output", () => {
  render(<CsvPivotReshapePage />);
  fireEvent.click(
    screen.getByRole("button", { name: "集計サンプルを読み込む" }),
  );
  const run = screen.getByRole("button", { name: "変換結果を確認" });
  expect(run).toHaveAttribute("data-analytics-tool-id", "csv-pivot-reshape");
  fireEvent.click(run);
  expect(
    screen.getByRole("heading", { name: "2行・4列のCSV" }),
  ).toBeInTheDocument();
  expect(screen.getByText(/値列の空欄が1件/)).toBeInTheDocument();
  expect(screen.getByText(/組み合わせが1行分重複/)).toBeInTheDocument();
  expect(screen.getByText("縦横変換レシピ保存")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "変換CSVを保存" }));
  expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
});

test("un-pivots the wide sample", () => {
  render(<CsvPivotReshapePage />);
  fireEvent.click(
    screen.getByRole("button", { name: "縦持ちサンプルを読み込む" }),
  );
  fireEvent.click(screen.getByRole("button", { name: "変換結果を確認" }));
  expect(
    screen.getByRole("heading", { name: "6行・4列のCSV" }),
  ).toBeInTheDocument();
  expect(screen.getByText(/値列の空欄が1件/)).toBeInTheDocument();
});
