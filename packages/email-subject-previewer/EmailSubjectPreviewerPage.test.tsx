/** @jest-environment jsdom */

import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { EmailSubjectPreviewerPage } from "./EmailSubjectPreviewerPage";

test("explains what a preheader is and how it relates to the message body", () => {
  render(<EmailSubjectPreviewerPage />);

  expect(screen.getByText("プリヘッダーとは？")).toBeInTheDocument();
  expect(screen.getByText(/メール本文の書き出し部分/)).toBeInTheDocument();
  expect(
    screen.getByText("プリヘッダー（受信箱に出る補足文）"),
  ).toBeInTheDocument();
});
