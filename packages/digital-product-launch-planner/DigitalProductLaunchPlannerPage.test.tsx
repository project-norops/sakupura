/** @jest-environment jsdom */
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { DigitalProductLaunchPlannerPage } from "./DigitalProductLaunchPlannerPage";

beforeEach(() => {
  jest.useFakeTimers().setSystemTime(new Date("2026-07-28T12:00:00+09:00"));
  window.localStorage.clear();
  window.gtag = jest.fn();
  window.requestAnimationFrame = (callback) => {
    callback(0);
    return 1;
  };
  Object.assign(navigator, {
    clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
  });
});

afterEach(() => jest.useRealTimers());

test("creates the two-week digital product sample with dated work", () => {
  render(<DigitalProductLaunchPlannerPage />);
  expect(
    screen.getByRole("region", { name: "かんたん操作手順" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("region", { name: "計画の空状態" }),
  ).toBeInTheDocument();
  fireEvent.click(
    screen.getByRole("button", { name: "2週間後の教材サンプル" }),
  );
  fireEvent.click(
    screen.getByRole("button", { name: "日付付きローンチ計画を作る" }),
  );
  expect(
    screen.getByRole("region", { name: "ローンチ計画" }),
  ).toHaveTextContent("2026-08-11");
  expect(screen.getByText("収録内容と購入者像を確定")).toBeInTheDocument();
  expect(screen.getByText("商品ページの本文と価格を確定")).toBeInTheDocument();
  expect(screen.getByText("ローンチ計画の保存")).toBeInTheDocument();
});

test("switches to a stream-specific workflow", () => {
  render(<DigitalProductLaunchPlannerPage />);
  fireEvent.click(
    screen.getByRole("button", { name: "2週間後の教材サンプル" }),
  );
  fireEvent.click(screen.getByRole("radio", { name: "配信イベント" }));
  fireEvent.click(
    screen.getByRole("button", { name: "日付付きローンチ計画を作る" }),
  );
  expect(screen.getByText("限定公開でテスト配信")).toBeInTheDocument();
  expect(
    screen.queryByText("商品ページの本文と価格を確定"),
  ).not.toBeInTheDocument();
});

test("shows required-field and past-date errors", () => {
  render(<DigitalProductLaunchPlannerPage />);
  fireEvent.click(
    screen.getByRole("button", { name: "日付付きローンチ計画を作る" }),
  );
  expect(screen.getByRole("alert")).toHaveTextContent("商品・企画名を入力");
  fireEvent.change(screen.getByLabelText(/商品・企画名/), {
    target: { value: "過去日テスト" },
  });
  fireEvent.change(screen.getByLabelText(/発売日/), {
    target: { value: "2026-07-27" },
  });
  fireEvent.change(screen.getByLabelText(/販売・受付・配信場所/), {
    target: { value: "販売サイト" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "日付付きローンチ計画を作る" }),
  );
  expect(screen.getByRole("alert")).toHaveTextContent("今日以降");
});

test("copies, downloads ICS, toggles progress, and prints", async () => {
  const createObjectUrl = jest.fn(() => "blob:launch");
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    value: createObjectUrl,
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    configurable: true,
    value: jest.fn(),
  });
  const click = jest
    .spyOn(HTMLAnchorElement.prototype, "click")
    .mockImplementation(() => undefined);
  const print = jest.spyOn(window, "print").mockImplementation(() => undefined);
  render(<DigitalProductLaunchPlannerPage />);
  fireEvent.click(
    screen.getByRole("button", { name: "2週間後の教材サンプル" }),
  );
  fireEvent.click(
    screen.getByRole("button", { name: "日付付きローンチ計画を作る" }),
  );
  const checkbox = screen.getByRole("checkbox", {
    name: /商品ページの本文と価格を確定/,
  });
  fireEvent.click(checkbox);
  expect(checkbox).toBeChecked();
  fireEvent.click(
    screen.getByRole("button", { name: "チェックリストをコピー" }),
  );
  expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
    expect.stringContaining("はじめての動画教材"),
  );
  expect(
    await screen.findByText("チェックリストをコピーしました。"),
  ).toBeInTheDocument();
  fireEvent.click(
    screen.getByRole("button", { name: "カレンダー用ICSを保存" }),
  );
  expect(createObjectUrl).toHaveBeenCalledWith(expect.any(Blob));
  expect(click).toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "印刷・PDF保存" }));
  expect(print).toHaveBeenCalled();
  click.mockRestore();
  print.mockRestore();
});
