/** @jest-environment jsdom */

import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { ContrastColorFixerPage } from "./ContrastColorFixerPage";

test("shows text and UI contrast standards with an official reference", () => {
  render(<ContrastColorFixerPage />);

  expect(screen.getByText("UI部品 AA（3以上）")).toBeInTheDocument();
  expect(
    screen.getByText(/大きな文字は目安として24px以上/),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: "W3CのWCAG 2.2クイックリファレンス" }),
  ).toHaveAttribute(
    "href",
    "https://www.w3.org/WAI/WCAG22/quickref/#contrast-minimum",
  );
});
