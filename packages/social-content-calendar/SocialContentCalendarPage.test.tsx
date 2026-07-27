/** @jest-environment jsdom */

import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { SocialContentCalendarPage } from "./SocialContentCalendarPage";

beforeEach(() => {
  window.gtag = jest.fn();
});

test("explains the workflow and shows the store sample balance", () => {
  render(<SocialContentCalendarPage />);
  expect(
    screen.getByRole("region", { name: "かんたん操作手順" }),
  ).toBeInTheDocument();
  expect(
    screen.getByText(/CTAは、投稿を見た人に促したい次の行動/),
  ).toBeInTheDocument();
  expect(screen.getByText("3件")).toBeInTheDocument();
  expect(screen.getByText("X 2件／Instagram 1件")).toBeInTheDocument();
  expect(screen.getByText("カレンダーの端末保存")).toBeInTheDocument();
  expect(screen.getByText(/SNSへ自動投稿されません/)).toBeInTheDocument();
});

test("duplicates and reorders without drag-only controls", () => {
  render(<SocialContentCalendarPage />);
  fireEvent.click(screen.getAllByRole("button", { name: "複製" })[0]);
  expect(screen.getByText(/夏限定ドリンクの紹介を複製/)).toBeInTheDocument();
  expect(screen.getByRole("group", { name: "投稿 4" })).toBeInTheDocument();
  expect(screen.getAllByRole("button", { name: "上へ" }).length).toBe(4);
  expect(screen.getAllByRole("button", { name: "下へ" }).length).toBe(4);
});

test("adds an incomplete post and updates the review count", () => {
  render(<SocialContentCalendarPage />);
  fireEvent.click(screen.getByRole("button", { name: "投稿予定を追加" }));
  expect(screen.getByText("4件")).toBeInTheDocument();
  expect(screen.getByRole("group", { name: "投稿 4" })).toBeInTheDocument();
});
