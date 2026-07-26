/** @jest-environment jsdom */
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { RobotsSitemapCheckerPage } from "./RobotsSitemapCheckerPage";

beforeEach(() => {
  Object.assign(navigator, {
    clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
  });
  window.gtag = jest.fn();
});
afterEach(() => {
  delete window.gtag;
});

test("loads the sample, diagnoses it, and copies the report", async () => {
  render(<RobotsSitemapCheckerPage />);
  fireEvent.click(
    screen.getByRole("button", { name: "指摘例入りサンプルを読み込む" }),
  );
  fireEvent.click(screen.getByRole("button", { name: "2ファイルを診断する" }));
  expect(
    screen.getByText("URL 5件・Disallow 1件・指摘 3件"),
  ).toBeInTheDocument();
  expect(screen.getByText(/URLが重複しています/)).toBeInTheDocument();
  expect(
    screen.getByText(/想定ホスト「example.com」と異なるURL/),
  ).toBeInTheDocument();
  expect(
    screen.getByText(/Disallow「\/members\/」に該当する候補/),
  ).toBeInTheDocument();
  expect(screen.getAllByText("開発検討中")).toHaveLength(2);
  fireEvent.click(screen.getByRole("button", { name: "診断レポートをコピー" }));
  expect(
    await screen.findByRole("button", { name: "診断レポートをコピーしました" }),
  ).toBeInTheDocument();
});

test("requires both inputs", () => {
  render(<RobotsSitemapCheckerPage />);
  fireEvent.click(screen.getByRole("button", { name: "2ファイルを診断する" }));
  expect(screen.getByRole("alert")).toHaveTextContent("両方を入力");
});
