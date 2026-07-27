/** @jest-environment jsdom */

import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { FreelanceCapacityPlannerPage } from "./FreelanceCapacityPlannerPage";

beforeEach(() => {
  window.gtag = jest.fn();
});

test("explains the non-technical use case and calculates the sample", () => {
  render(<FreelanceCapacityPlannerPage />);
  expect(
    screen.getByRole("region", { name: "かんたん操作手順" }),
  ).toBeInTheDocument();
  expect(
    screen.getByText(/来月、この新規案件を受けても大丈夫か/),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "来月の余力を計算する" }));
  expect(screen.getAllByText("24時間").length).toBeGreaterThan(0);
  expect(screen.getByText("440,000円")).toBeInTheDocument();
  expect(screen.getByText("月次計画の保存")).toBeInTheDocument();
  expect(
    screen.getByText(/長時間労働を勧めるものではありません/),
  ).toBeInTheDocument();
});

test("adds and removes a project", () => {
  render(<FreelanceCapacityPlannerPage />);
  fireEvent.click(screen.getByRole("button", { name: "案件を追加" }));
  expect(screen.getByRole("group", { name: "案件 3" })).toBeInTheDocument();
  const removes = screen.getAllByRole("button", { name: "この案件を削除" });
  fireEvent.click(removes[removes.length - 1]);
  expect(
    screen.queryByRole("group", { name: "案件 3" }),
  ).not.toBeInTheDocument();
});

test("rejects a plan with no billable capacity", () => {
  render(<FreelanceCapacityPlannerPage />);
  fireEvent.change(screen.getByLabelText(/非請求時間/), {
    target: { value: "200" },
  });
  fireEvent.click(screen.getByRole("button", { name: "来月の余力を計算する" }));
  expect(screen.getByRole("alert")).toHaveTextContent(
    "案件に使える時間が1時間以上",
  );
});
