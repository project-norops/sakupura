/** @jest-environment jsdom */

import "@testing-library/jest-dom";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { CsvDuplicateCleanerPage } from "./CsvDuplicateCleanerPage";

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

test("shows quick steps and downloads input examples", () => {
  render(<CsvDuplicateCleanerPage />);
  const guide = screen.getByRole("region", { name: "かんたん操作手順" });
  expect(within(guide).getByText("CSVを読み込む")).toBeInTheDocument();
  expect(
    within(guide).getByText("整理済み・除外行CSVを保存する"),
  ).toBeInTheDocument();

  fireEvent.click(
    screen.getByRole("button", { name: "入力サンプルCSVを保存" }),
  );
  fireEvent.click(
    screen.getByRole("button", { name: "入力テンプレートCSVを保存" }),
  );
  expect(URL.createObjectURL).toHaveBeenCalledTimes(2);
});

test("requires an explicit keep choice before both output downloads", () => {
  render(<CsvDuplicateCleanerPage />);
  fireEvent.click(
    screen.getByRole("button", { name: "操作サンプルを読み込む" }),
  );
  expect(screen.getByRole("combobox")).toHaveValue("氏名");

  fireEvent.click(
    screen.getByRole("button", { name: "重複・表記ゆれ候補を確認" }),
  );
  expect(
    screen.getByRole("heading", { name: "1グループ・3行の候補" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("group", { name: "候補 1・表記ゆれ候補" }),
  ).toBeInTheDocument();
  const cleaned = screen.getByRole("button", { name: "整理済みCSVを保存" });
  const excluded = screen.getByRole("button", { name: "除外行CSVを保存" });
  expect(cleaned).toBeDisabled();
  expect(excluded).toBeDisabled();

  fireEvent.click(screen.getByRole("radio", { name: /元行 2 を残す/ }));
  expect(cleaned).toBeEnabled();
  expect(excluded).toBeEnabled();
  expect(screen.getByText(/整理済み2行、除外2行/)).toBeInTheDocument();
  expect(screen.getAllByText("開発検討中")).toHaveLength(2);

  fireEvent.click(cleaned);
  fireEvent.click(excluded);
  expect(URL.createObjectURL).toHaveBeenCalledTimes(2);
});
