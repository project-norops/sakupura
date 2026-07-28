/** @jest-environment jsdom */

import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { CommissionBriefBuilderPage } from "./CommissionBriefBuilderPage";

const writeText = jest.fn().mockResolvedValue(undefined);
const share = jest.fn().mockResolvedValue(undefined);
const canShare = jest.fn().mockReturnValue(true);

beforeEach(() => {
  writeText.mockClear();
  share.mockClear();
  canShare.mockClear();
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  });
  Object.defineProperty(navigator, "share", {
    configurable: true,
    value: share,
  });
  Object.defineProperty(navigator, "canShare", {
    configurable: true,
    value: canShare,
  });
  window.gtag = jest.fn();
  window.print = jest.fn();
  window.localStorage.clear();
});

test("shows simple instructions and an empty result before generation", () => {
  render(<CommissionBriefBuilderPage />);
  expect(
    screen.getByRole("region", { name: "かんたん操作手順" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("region", { name: "確認シートの空状態" }),
  ).toHaveTextContent("ここに確認シート");
  expect(screen.queryByText("ヒアリング項目の保存")).not.toBeInTheDocument();
});

test("loads the concrete sample and generates a confirmation sheet", () => {
  render(<CommissionBriefBuilderPage />);
  fireEvent.click(screen.getByRole("button", { name: "サンプルを読み込む" }));
  expect(screen.getByLabelText(/案件名/)).toHaveValue("SNSアイコン制作");
  fireEvent.click(screen.getByRole("button", { name: "確認シートを作成する" }));

  expect(
    screen.getByRole("heading", { name: "SNSアイコン制作" }),
  ).toBeInTheDocument();
  expect(screen.getByText("2026年8月20日")).toBeInTheDocument();
  expect(screen.getByText(/参考資料の共有方法と共有日/)).toBeInTheDocument();
  expect(screen.getByText("ヒアリング項目の保存")).toBeInTheDocument();
  expect(window.gtag).toHaveBeenCalledWith("event", "tool_run", {
    tool_id: "commission-brief-builder",
  });
});

test("rejects missing required inputs and an invalid revision count", () => {
  render(<CommissionBriefBuilderPage />);
  fireEvent.click(screen.getByRole("button", { name: "確認シートを作成する" }));
  expect(screen.getByRole("alert")).toHaveTextContent("案件名、用途、サイズ");

  fireEvent.click(screen.getByRole("button", { name: "サンプルを読み込む" }));
  fireEvent.change(screen.getByLabelText(/修正回数/), {
    target: { value: "21" },
  });
  fireEvent.click(screen.getByRole("button", { name: "確認シートを作成する" }));
  expect(screen.getByRole("alert")).toHaveTextContent("0〜20の整数");
});

test("copies the plain-text sheet and calls print", async () => {
  render(<CommissionBriefBuilderPage />);
  fireEvent.click(screen.getByRole("button", { name: "サンプルを読み込む" }));
  fireEvent.click(screen.getByRole("button", { name: "確認シートを作成する" }));
  fireEvent.click(screen.getByRole("button", { name: "文章をコピー" }));

  await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
  expect(writeText.mock.calls[0][0]).toContain("【制作依頼 確認シート】");
  expect(writeText.mock.calls[0][0]).toContain("SNSアイコン制作");
  expect(await screen.findByRole("status")).toHaveTextContent("コピーしました");

  fireEvent.click(
    screen.getByRole("button", { name: "印刷・PDF保存（PC向け）" }),
  );
  expect(window.print).toHaveBeenCalledTimes(1);
});

test("opens the mobile share sheet with a local text file", async () => {
  render(<CommissionBriefBuilderPage />);
  fireEvent.click(screen.getByRole("button", { name: "サンプルを読み込む" }));
  fireEvent.click(screen.getByRole("button", { name: "確認シートを作成する" }));
  fireEvent.click(screen.getByRole("button", { name: "スマホで共有・保存" }));

  await waitFor(() => expect(share).toHaveBeenCalledTimes(1));
  const shared = share.mock.calls[0][0];
  expect(shared.title).toContain("SNSアイコン制作");
  expect(shared.files[0]).toBeInstanceOf(File);
  expect(shared.files[0].name).toBe("SNSアイコン制作-確認シート.txt");
  expect(await screen.findByRole("status")).toHaveTextContent(
    "共有メニューを開きました",
  );
});

test("downloads a text file when the share sheet is unavailable", async () => {
  Object.defineProperty(navigator, "share", {
    configurable: true,
    value: undefined,
  });
  Object.defineProperty(navigator, "canShare", {
    configurable: true,
    value: undefined,
  });
  const createObjectURL = jest.fn().mockReturnValue("blob:brief");
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

  render(<CommissionBriefBuilderPage />);
  fireEvent.click(screen.getByRole("button", { name: "サンプルを読み込む" }));
  fireEvent.click(screen.getByRole("button", { name: "確認シートを作成する" }));
  fireEvent.click(screen.getByRole("button", { name: "スマホで共有・保存" }));

  expect(createObjectURL).toHaveBeenCalledTimes(1);
  expect(click).toHaveBeenCalledTimes(1);
  expect(revokeObjectURL).toHaveBeenCalledWith("blob:brief");
  expect(await screen.findByRole("status")).toHaveTextContent(
    "テキストファイルで保存しました",
  );
  click.mockRestore();
});

test("clears the sample and hides a generated result after editing", () => {
  render(<CommissionBriefBuilderPage />);
  fireEvent.click(screen.getByRole("button", { name: "サンプルを読み込む" }));
  fireEvent.click(screen.getByRole("button", { name: "確認シートを作成する" }));
  fireEvent.change(screen.getByLabelText(/用途・使用場所/), {
    target: { value: "別の用途" },
  });
  expect(
    screen.queryByRole("heading", { name: "SNSアイコン制作" }),
  ).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "入力をクリア" }));
  expect(screen.getByLabelText(/案件名/)).toHaveValue("");
});
