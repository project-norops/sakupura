/** @jest-environment jsdom */

import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { CommissionRateCardMakerPage } from "./CommissionRateCardMakerPage";

const writeText = jest.fn().mockResolvedValue(undefined);
const anchorClick = jest
  .spyOn(HTMLAnchorElement.prototype, "click")
  .mockImplementation(() => undefined);
const fillText = jest.fn();
const context = {
  fillStyle: "",
  font: "",
  textAlign: "left",
  fillRect: jest.fn(),
  fillText,
  measureText: jest.fn((text: string) => ({ width: text.length * 20 })),
  createLinearGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
};

beforeEach(() => {
  jest.clearAllMocks();
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  });
  HTMLCanvasElement.prototype.getContext = jest.fn(() => context) as never;
  HTMLCanvasElement.prototype.toDataURL = jest.fn(
    () => "data:image/png;base64,rate-card",
  );
  window.gtag = jest.fn();
  window.print = jest.fn();
  window.localStorage.clear();
});

afterAll(() => anchorClick.mockRestore());

test("shows the simple instructions and empty result", () => {
  render(<CommissionRateCardMakerPage />);
  expect(
    screen.getByRole("region", { name: "かんたん操作手順" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("region", { name: "料金表の空状態" }),
  ).toHaveTextContent("ここにSNS向け料金表");
  expect(screen.queryByText("料金表プリセットの保存")).not.toBeInTheDocument();
});

test("loads the concrete sample and generates all result information", () => {
  render(<CommissionRateCardMakerPage />);
  fireEvent.click(screen.getByRole("button", { name: "サンプルを読み込む" }));
  expect(screen.getByLabelText(/活動名・屋号/)).toHaveValue(
    "Sakura Illustration",
  );
  fireEvent.click(
    screen.getByRole("button", { name: "プレビューと料金表を作成" }),
  );
  expect(
    screen.getByRole("article", { name: "SNS向け料金表プレビュー" }),
  ).toHaveTextContent("SNSアイコン");
  expect(
    screen.getByRole("article", { name: "SNS向け料金表プレビュー" }),
  ).toHaveTextContent("8,000円〜");
  expect(screen.getByText("料金表プリセットの保存")).toBeInTheDocument();
  expect(window.gtag).toHaveBeenCalledWith("event", "tool_run", {
    tool_id: "commission-rate-card-maker",
  });
});

test("validates required values, menu presence, and integer prices", () => {
  render(<CommissionRateCardMakerPage />);
  fireEvent.click(
    screen.getByRole("button", { name: "プレビューと料金表を作成" }),
  );
  expect(screen.getByRole("alert")).toHaveTextContent("活動名、料金表タイトル");
  fireEvent.click(screen.getByRole("button", { name: "サンプルを読み込む" }));
  fireEvent.change(screen.getByLabelText("メニュー 1の料金（円） 必須"), {
    target: { value: "-1" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "プレビューと料金表を作成" }),
  );
  expect(screen.getByRole("alert")).toHaveTextContent("0〜100,000,000円の整数");
});

test("adds a menu and hides a stale result after editing", () => {
  render(<CommissionRateCardMakerPage />);
  fireEvent.click(screen.getByRole("button", { name: "サンプルを読み込む" }));
  fireEvent.click(screen.getByRole("button", { name: "メニューを追加" }));
  expect(screen.getByLabelText("メニュー 3の名前 必須")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "入力をクリア" }));
  expect(screen.getByLabelText(/活動名・屋号/)).toHaveValue("");
});

test("copies Markdown, downloads PNG, and opens print", async () => {
  render(<CommissionRateCardMakerPage />);
  fireEvent.click(screen.getByRole("button", { name: "サンプルを読み込む" }));
  fireEvent.click(
    screen.getByRole("button", { name: "プレビューと料金表を作成" }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Markdownをコピー" }));
  await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
  expect(writeText.mock.calls[0][0]).toContain("# イラストコミッション");
  expect(writeText.mock.calls[0][0]).toContain("| SNSアイコン | 8,000円〜");
  fireEvent.click(screen.getByRole("button", { name: "SNS画像を保存" }));
  expect(HTMLCanvasElement.prototype.toDataURL).toHaveBeenCalledWith(
    "image/png",
  );
  expect(anchorClick).toHaveBeenCalled();
  expect(await screen.findByRole("status")).toHaveTextContent(
    "画像を保存しました",
  );
  fireEvent.click(screen.getByRole("button", { name: "印刷・PDF保存" }));
  expect(window.print).toHaveBeenCalledTimes(1);
});
