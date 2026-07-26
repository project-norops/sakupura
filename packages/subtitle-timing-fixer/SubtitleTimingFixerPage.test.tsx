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
  expect(
    screen.getAllByText(/前の字幕と表示時間が重なっています/),
  ).toHaveLength(2);
  await user.click(screen.getByRole("button", { name: "全字幕の時間を調整" }));
  expect(screen.getByRole("status")).toHaveTextContent("-500ミリ秒");
  expect(screen.getByRole("textbox", { name: "字幕1の開始時刻" })).toHaveValue(
    "00:00:01,500",
  );
});

test("adjusts one cue, re-diagnoses and can undo", async () => {
  const user = userEvent.setup();
  render(<SubtitleTimingFixerPage />);
  await user.click(screen.getByRole("button", { name: "サンプルで試す" }));

  const start = screen.getByRole("textbox", { name: "字幕2の開始時刻" });
  await user.clear(start);
  await user.type(start, "00:00:05,200");
  await user.click(
    screen.getAllByRole("button", { name: "この字幕の時刻を反映" })[1],
  );

  expect(screen.getByRole("status")).toHaveTextContent("字幕2の時刻を反映");
  expect(
    screen.getByText("形式上の問題は見つかりませんでした。"),
  ).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "1操作戻す" }));
  expect(screen.getByRole("status")).toHaveTextContent("取り消しました");
  expect(
    screen.getAllByText(/前の字幕と表示時間が重なっています/),
  ).toHaveLength(2);
});

test("explains local processing and no AI transcription", () => {
  render(<SubtitleTimingFixerPage />);
  expect(screen.getByText(/自動文字起こしやAIは使わず/)).toBeInTheDocument();
  expect(screen.getByText(/サーバーへ送信しません/)).toBeInTheDocument();
});
