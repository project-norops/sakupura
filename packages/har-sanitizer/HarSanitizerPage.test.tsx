/** @jest-environment jsdom */

import "@testing-library/jest-dom";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { HarSanitizerPage } from "./HarSanitizerPage";

beforeEach(() => {
  window.localStorage.clear();
  window.gtag = jest.fn();
  window.requestAnimationFrame = (callback) => {
    callback(0);
    return 1;
  };
  URL.createObjectURL = jest.fn(() => "blob:har");
  URL.revokeObjectURL = jest.fn();
  jest.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
});

test("shows quick steps and downloads the sample HAR", () => {
  render(<HarSanitizerPage />);
  const guide = screen.getByRole("region", { name: "かんたん操作手順" });
  expect(within(guide).getByText("HARを読み込む")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "サンプルHARを保存" }));
  expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
});

test("loads sample, requires a selection, sanitizes, and enables output", () => {
  render(<HarSanitizerPage />);
  fireEvent.click(
    screen.getByRole("button", { name: "操作サンプルを読み込む" }),
  );
  expect(
    screen.getByRole("heading", { name: "5件の機密候補" }),
  ).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "選択解除" }));
  fireEvent.click(screen.getByRole("button", { name: "選択した候補を匿名化" }));
  expect(screen.getByRole("alert")).toHaveTextContent("1件以上");

  fireEvent.click(screen.getByRole("button", { name: "すべて選択" }));
  const runButton = screen.getByRole("button", {
    name: "選択した候補を匿名化",
  });
  expect(runButton).toHaveAttribute("data-analytics-tool-id", "har-sanitizer");
  fireEvent.click(runButton);
  expect(
    screen.getByRole("heading", { name: "5件を匿名化しました" }),
  ).toBeInTheDocument();
  expect(screen.getAllByText("[REDACTED]")).toHaveLength(5);
  expect(screen.getByText("匿名化プロファイル保存")).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "匿名化HARを保存" }));
  expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
});
