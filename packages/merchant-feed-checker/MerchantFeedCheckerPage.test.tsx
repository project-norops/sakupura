/** @jest-environment jsdom */

import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { MerchantFeedCheckerPage } from "./MerchantFeedCheckerPage";

beforeEach(() => {
  URL.createObjectURL = jest.fn(() => "blob:template");
  URL.revokeObjectURL = jest.fn();
  jest.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
});

test("offers a product feed template", () => {
  render(<MerchantFeedCheckerPage />);
  fireEvent.click(
    screen.getByRole("button", {
      name: "商品フィード用テンプレートCSVを保存",
    }),
  );

  expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
});

test("shows the accepted availability values in the diagnosis", () => {
  render(<MerchantFeedCheckerPage />);
  fireEvent.click(
    screen.getByRole("button", { name: "問題入りサンプルで試す" }),
  );

  expect(screen.getByText(/in_stock（在庫あり）/)).toBeInTheDocument();
  expect(screen.getByText(/backorder（取り寄せ）/)).toBeInTheDocument();
});
