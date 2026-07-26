/** @jest-environment jsdom */

import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ImageResizerPage } from "./ImageResizerPage";

test("explains resizing and switches crop controls", async () => {
  const user = userEvent.setup();
  render(<ImageResizerPage />);

  expect(screen.getAllByText(/縦横比を保って拡大・縮小し/)).toHaveLength(2);
  const right = screen.getByRole("button", { name: "右" });
  await user.click(right);
  expect(right).toHaveAttribute("aria-pressed", "true");

  await user.click(
    screen.getByRole("button", {
      name: /余白を付けて全体表示/,
    }),
  );
  expect(screen.getByText("余白の色")).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "右" })).not.toBeInTheDocument();
});
