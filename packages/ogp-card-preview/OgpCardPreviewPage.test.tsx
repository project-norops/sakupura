/** @jest-environment jsdom */
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { OgpCardPreviewPage } from "./OgpCardPreviewPage";
beforeEach(() => {
  Object.assign(navigator, {
    clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
  });
  window.gtag = jest.fn();
});
afterEach(() => {
  delete window.gtag;
});
test("loads the sample, generates tags, and copies them", async () => {
  render(<OgpCardPreviewPage />);
  fireEvent.click(
    screen.getByRole("button", { name: "操作サンプルを読み込む" }),
  );
  expect(
    screen.getByRole("img", { name: "操作サンプル画像のカードプレビュー" }),
  ).toBeInTheDocument();
  expect(screen.getByText("表示中：操作サンプル画像")).toBeInTheDocument();
  fireEvent.click(
    screen.getByRole("button", { name: "プレビューとタグを作成" }),
  );
  expect(screen.getAllByText(/og:title/)).toHaveLength(2);
  expect(screen.getAllByText("開発検討中")).toHaveLength(2);
  fireEvent.click(screen.getByRole("button", { name: "生成タグをコピー" }));
  expect(
    await screen.findByRole("button", { name: "タグをコピーしました" }),
  ).toBeInTheDocument();
});
test("shows errors before producing tags", () => {
  render(<OgpCardPreviewPage />);
  fireEvent.click(
    screen.getByRole("button", { name: "プレビューとタグを作成" }),
  );
  expect(screen.getByRole("alert")).toHaveTextContent("タイトルを入力");
  expect(screen.queryByText(/<meta property/)).not.toBeInTheDocument();
});
