/** @jest-environment jsdom */
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { BookmarkButton } from "./BookmarkButton";

beforeEach(() => {
  window.gtag = jest.fn();
});

test("keeps the bookmark dialog top reachable in a short mobile viewport", () => {
  render(<BookmarkButton />);

  fireEvent.click(
    screen.getByRole("button", {
      name: "このページをブックマークに追加",
    }),
  );

  const dialog = screen.getByRole("dialog", { name: "このページを保存" });
  const layout = dialog.firstElementChild;
  const panel = layout?.firstElementChild;

  expect(dialog).toHaveClass("overflow-y-auto", "overscroll-contain");
  expect(layout).toHaveClass("items-start", "sm:items-center");
  expect(panel).toHaveClass("max-h-[calc(100dvh-2rem)]", "overflow-y-auto");
  expect(screen.getByRole("button", { name: "閉じる" })).toBeVisible();
});
