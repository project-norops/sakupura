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
