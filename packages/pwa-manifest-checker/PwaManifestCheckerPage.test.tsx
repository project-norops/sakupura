/** @jest-environment jsdom */

import "@testing-library/jest-dom";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { PwaManifestCheckerPage } from "./PwaManifestCheckerPage";

beforeEach(() => {
  window.localStorage.clear();
  window.gtag = jest.fn();
  window.requestAnimationFrame = (callback) => {
    callback(0);
    return 1;
  };
  URL.createObjectURL = jest.fn(() => "blob:manifest");
  URL.revokeObjectURL = jest.fn();
  Object.assign(navigator, {
    clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
  });
  jest.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
});

test("shows quick steps and downloads the sample manifest", () => {
  render(<PwaManifestCheckerPage />);
  const guide = screen.getByRole("region", { name: "かんたん操作手順" });
  expect(within(guide).getByText("JSONを読み込む")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "サンプルJSONを保存" }));
  expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
});

test("loads a complete sample, checks it, copies output, and shows paid candidates", async () => {
  render(<PwaManifestCheckerPage />);
  fireEvent.click(
    screen.getByRole("button", { name: "操作サンプルを読み込む" }),
  );
  const run = screen.getByRole("button", {
    name: "マニフェストとアイコンを確認",
  });
  expect(run).toHaveAttribute("data-analytics-tool-id", "pwa-manifest-checker");
  fireEvent.click(run);
  expect(
    screen.getByRole("heading", { name: "重大な指摘はありません" }),
  ).toBeInTheDocument();
  expect(screen.getByText("maskable安全領域の目安")).toBeInTheDocument();
  expect(screen.getByText("プロジェクト別設定保存")).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "修正版JSONをコピー" }));
  expect(
    await screen.findByRole("button", { name: "コピーしました" }),
  ).toBeInTheDocument();
  expect(navigator.clipboard.writeText).toHaveBeenCalled();
});

test("reports malformed JSON without showing stale results", () => {
  render(<PwaManifestCheckerPage />);
  fireEvent.change(screen.getByLabelText("JSON内容"), {
    target: { value: "{broken" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "マニフェストとアイコンを確認" }),
  );
  expect(screen.getByRole("alert")).toHaveTextContent("JSONとして");
  expect(screen.queryByText("事前チェック結果")).not.toBeInTheDocument();
});
