/** @jest-environment jsdom */

import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FocusCostTimerPage } from "./FocusCostTimerPage";

beforeEach(() => localStorage.clear());

test("restores a running timer from its saved start time", async () => {
  localStorage.setItem(
    "focus-cost-timer:active",
    JSON.stringify({
      task: "復元する作業",
      hourlyRate: 3600,
      elapsedBeforeStart: 2000,
      startedAt: Date.now() - 3000,
    }),
  );
  render(<FocusCostTimerPage />);

  expect(await screen.findByDisplayValue("復元する作業")).toBeInTheDocument();
  await waitFor(() => expect(screen.getByText("00:00:05")).toBeInTheDocument());
  expect(screen.getByRole("button", { name: "一時停止" })).toBeEnabled();
});

test("asks before discarding recorded time", async () => {
  const user = userEvent.setup();
  const confirm = jest.spyOn(window, "confirm").mockReturnValue(false);
  localStorage.setItem(
    "focus-cost-timer:active",
    JSON.stringify({
      task: "破棄しない作業",
      hourlyRate: 3000,
      elapsedBeforeStart: 2000,
      startedAt: null,
    }),
  );
  render(<FocusCostTimerPage />);
  expect(await screen.findByText("00:00:02")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "記録せずリセット" }));
  expect(confirm).toHaveBeenCalledTimes(1);
  expect(screen.getByText("00:00:02")).toBeInTheDocument();
  confirm.mockRestore();
});
