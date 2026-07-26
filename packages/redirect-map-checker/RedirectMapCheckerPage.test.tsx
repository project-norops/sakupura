/** @jest-environment jsdom */

import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { RedirectMapCheckerPage } from "./RedirectMapCheckerPage";

beforeEach(() => {
  URL.createObjectURL = jest.fn(() => "blob:template");
  URL.revokeObjectURL = jest.fn();
  jest.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
});

test("offers a redirect map template and explains both columns", () => {
  render(<RedirectMapCheckerPage />);
  fireEvent.click(
    screen.getByRole("button", { name: "入力用テンプレートCSVを保存" }),
  );

  expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
  expect(screen.getByText(/old_url列に移転前のURL/)).toBeInTheDocument();
});
