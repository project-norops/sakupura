/** @jest-environment jsdom */

import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { DeliveryFileCheckerPage } from "./DeliveryFileCheckerPage";

const writeText = jest.fn().mockResolvedValue(undefined);

beforeEach(() => {
  writeText.mockClear();
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  });
  window.gtag = jest.fn();
  window.localStorage.clear();
});

test("shows simple instructions, privacy note, and an empty result", () => {
  render(<DeliveryFileCheckerPage />);
  expect(
    screen.getByRole("region", { name: "かんたん操作手順" }),
  ).toBeInTheDocument();
  expect(
    screen.getByText(/ファイル名、画像、検査結果をサクプラやGA4へ送りません/),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("region", { name: "チェック結果の空状態" }),
  ).toHaveTextContent("ここに");
  expect(screen.queryByText("納品ルールの保存")).not.toBeInTheDocument();
});

test("loads a meaningful sample and shows concrete issues", () => {
  render(<DeliveryFileCheckerPage />);
  fireEvent.click(
    screen.getByRole("button", { name: "指摘例サンプルを読み込む" }),
  );
  expect(
    screen.getByRole("region", { name: "選択したファイル" }),
  ).toHaveTextContent("Preview Final.JPG");
  fireEvent.click(screen.getByRole("button", { name: "納品前チェックを実行" }));

  expect(
    screen.getByRole("heading", { name: "修正が必要な項目があります" }),
  ).toBeInTheDocument();
  expect(screen.getAllByText("autumn_readme.pdf").length).toBeGreaterThan(0);
  expect(screen.getAllByText("画像寸法").length).toBeGreaterThan(0);
  expect(screen.getByText("納品ルールの保存")).toBeInTheDocument();
  expect(window.gtag).toHaveBeenCalledWith("event", "tool_run", {
    tool_id: "delivery-file-checker",
  });
});

test("explains missing requirements and missing files", () => {
  render(<DeliveryFileCheckerPage />);
  fireEvent.click(screen.getByRole("button", { name: "納品前チェックを実行" }));
  expect(screen.getByRole("alert")).toHaveTextContent(
    "必要ファイル名を1件以上",
  );

  fireEvent.change(screen.getByLabelText(/必要ファイル名/), {
    target: { value: "main.png" },
  });
  fireEvent.click(screen.getByRole("button", { name: "納品前チェックを実行" }));
  expect(screen.getByRole("alert")).toHaveTextContent("確認するファイルを選ぶ");
});

test("accepts selected non-image files without uploading them", async () => {
  render(<DeliveryFileCheckerPage />);
  fireEvent.change(screen.getByLabelText(/必要ファイル名/), {
    target: { value: "readme.pdf" },
  });
  const file = new File(["local"], "readme.pdf", { type: "application/pdf" });
  fireEvent.change(screen.getByLabelText(/確認するファイル/), {
    target: { files: [file] },
  });
  await screen.findByText(/1件を端末内で読み取りました/);
  fireEvent.click(screen.getByRole("button", { name: "納品前チェックを実行" }));
  expect(
    screen.getByRole("heading", { name: "設定した要件内で指摘はありません" }),
  ).toBeInTheDocument();
});

test("copies and downloads the local result", async () => {
  const createObjectURL = jest.fn().mockReturnValue("blob:delivery-result");
  const revokeObjectURL = jest.fn();
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    value: createObjectURL,
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    configurable: true,
    value: revokeObjectURL,
  });
  const click = jest
    .spyOn(HTMLAnchorElement.prototype, "click")
    .mockImplementation(() => undefined);

  render(<DeliveryFileCheckerPage />);
  fireEvent.click(
    screen.getByRole("button", { name: "指摘例サンプルを読み込む" }),
  );
  fireEvent.click(screen.getByRole("button", { name: "納品前チェックを実行" }));
  fireEvent.click(screen.getByRole("button", { name: "結果をコピー" }));
  await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
  expect(writeText.mock.calls[0][0]).toContain("納品前チェック結果");

  fireEvent.click(screen.getByRole("button", { name: "結果CSVを保存" }));
  expect(createObjectURL).toHaveBeenCalledTimes(1);
  expect(click).toHaveBeenCalledTimes(1);
  expect(revokeObjectURL).toHaveBeenCalledWith("blob:delivery-result");
  click.mockRestore();
});
