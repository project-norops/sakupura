/** @jest-environment jsdom */

import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { CalendarCsvIcsConverterPage } from "./CalendarCsvIcsConverterPage";

beforeEach(() => {
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    value: jest.fn(() => "blob:test"),
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    configurable: true,
    value: jest.fn(),
  });
  HTMLAnchorElement.prototype.click = jest.fn();
  window.gtag = jest.fn();
});

afterEach(() => {
  delete window.gtag;
});

test("loads the sample, validates events, and saves an ICS file", () => {
  render(<CalendarCsvIcsConverterPage />);
  fireEvent.click(
    screen.getByRole("button", { name: "操作サンプルを読み込む" }),
  );
  expect(screen.getByLabelText("件名の列")).toHaveValue("件名");
  fireEvent.click(screen.getByRole("button", { name: "予定を検証する" }));
  expect(screen.getByText("2件中、エラー0件")).toBeInTheDocument();
  const save = screen.getByRole("button", { name: "ICSファイルを保存" });
  expect(save).toBeEnabled();
  fireEvent.click(save);
  expect(URL.createObjectURL).toHaveBeenCalled();
  expect(screen.getAllByText("開発検討中")).toHaveLength(2);
});

test("requires the three core mappings", () => {
  render(<CalendarCsvIcsConverterPage />);
  fireEvent.click(
    screen.getByRole("button", { name: "操作サンプルを読み込む" }),
  );
  fireEvent.change(screen.getByLabelText("件名の列"), {
    target: { value: "" },
  });
  fireEvent.click(screen.getByRole("button", { name: "予定を検証する" }));
  expect(screen.getByRole("alert")).toHaveTextContent(
    "件名・開始・終了の列を割り当ててください",
  );
});
