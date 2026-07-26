/** @jest-environment jsdom */

import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ShopifyCsvCheckerPage } from "./ShopifyCsvCheckerPage";

test("diagnoses the bundled sample and switches import mode", async () => {
  const user = userEvent.setup();
  render(<ShopifyCsvCheckerPage />);

  await user.click(
    screen.getByRole("button", { name: "問題入りサンプルで試す" }),
  );
  expect(screen.getByText("2行・8列")).toBeInTheDocument();
  expect(
    screen.getByText("価格は0以上の数値（小数2桁まで）で入力してください。"),
  ).toBeInTheDocument();
  expect(
    screen.getByText("画像URLはhttp://またはhttps://から始めてください。"),
  ).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "既存商品を更新" }));
  expect(
    screen.getByRole("button", { name: "既存商品を更新" }),
  ).toHaveAttribute("aria-pressed", "true");
  expect(screen.getByText(/Option1 nameとOption1 value/)).toBeInTheDocument();
});

test("shows the official specification and non-affiliation notice", () => {
  render(<ShopifyCsvCheckerPage />);
  expect(
    screen.getByRole("link", { name: "Shopify公式：商品CSVの仕様" }),
  ).toHaveAttribute(
    "href",
    "https://help.shopify.com/ja/manual/products/import-export/using-csv",
  );
  expect(
    screen.getByText(/Shopify Inc.の公式ツールではなく/),
  ).toBeInTheDocument();
});
