/** @jest-environment jsdom */

import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { CsvEncodingFixerPage } from "./CsvEncodingFixerPage";

beforeEach(() => {
  URL.createObjectURL = jest.fn(() => "blob:sample");
  URL.revokeObjectURL = jest.fn();
  jest.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
});

test("describes concrete Excel and system export use cases", () => {
  render(<CsvEncodingFixerPage />);

  expect(screen.getByText(/ExcelでCSVを開いたら日本語/)).toBeInTheDocument();
  expect(
    screen.getByText(/列名や並び順の指定がありません/),
  ).toBeInTheDocument();
});

test("offers a downloadable CSV sample", () => {
  render(<CsvEncodingFixerPage />);
  fireEvent.click(
    screen.getByRole("button", { name: "確認用サンプルCSVを保存" }),
  );

  expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
});
