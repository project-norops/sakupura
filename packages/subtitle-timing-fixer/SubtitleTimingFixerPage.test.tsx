/** @jest-environment jsdom */

import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SubtitleTimingFixerPage } from "./SubtitleTimingFixerPage";

test("loads a sample, diagnoses it and shifts every cue", async () => {
  const user = userEvent.setup();
  render(<SubtitleTimingFixerPage />);
  await user.click(screen.getByRole("button", { name: "サンプルで試す" }));
  expect(screen.getByText("3", { selector: "span" })).toBeInTheDocument();
  expect(screen.getByText(/形式上の問題は/)).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "全字幕の時間を調整" }));
  expect(screen.getByRole("status")).toHaveTextContent("-500ミリ秒");
  expect(screen.getByDisplayValue(/00:00:01,500/)).toBeInTheDocument();
});

test("explains local processing and no AI transcription", () => {
  render(<SubtitleTimingFixerPage />);
  expect(screen.getByText(/自動文字起こしやAIは使わず/)).toBeInTheDocument();
  expect(screen.getByText(/サーバーへ送信しません/)).toBeInTheDocument();
});
