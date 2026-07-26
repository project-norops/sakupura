/** @jest-environment jsdom */

import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { CsvDiffCheckerPage } from "./CsvDiffCheckerPage";

beforeEach(() => {
  URL.createObjectURL = jest.fn(() => "blob:template");
  URL.revokeObjectURL = jest.fn();
  jest.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
});

test("explains the comparison key in plain language", () => {
  render(<CsvDiffCheckerPage />);

  expect(screen.getByText(/同じデータを見分ける列/)).toBeInTheDocument();
  expect(screen.getByText(/SKU・商品コード・会員ID/)).toBeInTheDocument();
});

test("offers before and after CSV templates", () => {
  render(<CsvDiffCheckerPage />);

  fireEvent.click(
    screen.getByRole("button", { name: "変更前テンプレートCSVを保存" }),
  );
  fireEvent.click(
    screen.getByRole("button", { name: "変更後テンプレートCSVを保存" }),
  );

  expect(URL.createObjectURL).toHaveBeenCalledTimes(2);
});
