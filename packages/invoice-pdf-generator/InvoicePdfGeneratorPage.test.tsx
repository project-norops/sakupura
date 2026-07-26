/** @jest-environment jsdom */

import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { InvoicePdfGeneratorPage } from "./InvoicePdfGeneratorPage";

test("marks only the document as printable and defines multi-page table rules", () => {
  const { container } = render(<InvoicePdfGeneratorPage />);
  const printArea = container.querySelector("#invoice-print-area");
  const printCss = Array.from(container.querySelectorAll("style"))
    .map((style) => style.textContent)
    .join("\n");

  expect(printArea).toBeInTheDocument();
  expect(printCss).toContain("body *");
  expect(printCss).toContain("visibility: hidden");
  expect(printCss).toContain("display: table-header-group");
  expect(printCss).toContain("page-break-inside: avoid");
});

test("keeps every added detail row in the printable table", () => {
  render(<InvoicePdfGeneratorPage />);

  for (let index = 0; index < 20; index += 1) {
    fireEvent.click(screen.getByRole("button", { name: "明細を追加" }));
  }

  expect(screen.getAllByLabelText(/明細\d+の内容/)).toHaveLength(21);
  expect(screen.getAllByRole("row")).toHaveLength(22);
});

test("includes addresses and all standard invoice fields", () => {
  render(<InvoicePdfGeneratorPage />);
  fireEvent.click(screen.getByRole("button", { name: "請求書" }));

  expect(screen.getByLabelText("宛先住所")).toBeInTheDocument();
  expect(screen.getByLabelText("発行者住所")).toBeInTheDocument();
  expect(screen.getByLabelText("取引年月日")).toBeInTheDocument();
  expect(screen.getByText("インボイス記載チェック")).toBeInTheDocument();
  expect(screen.getByText("10%対象（税抜）")).toBeInTheDocument();
  expect(screen.getByText("10%消費税")).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: "国税庁「適格請求書等の記載事項」" }),
  ).toHaveAttribute(
    "href",
    "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shohi/6625.htm",
  );
});

test("prevents invoice printing while a required item is invalid", () => {
  render(<InvoicePdfGeneratorPage />);
  fireEvent.click(screen.getByRole("button", { name: "請求書" }));
  fireEvent.change(screen.getByLabelText("登録番号"), {
    target: { value: "123" },
  });

  expect(
    screen.getByRole("button", { name: "印刷画面を開いてPDF保存" }),
  ).toBeDisabled();
  expect(screen.getByText(/要確認： 登録番号/)).toBeInTheDocument();
});
