/** @jest-environment jsdom */
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { BookmarkButton } from "./BookmarkButton";

beforeEach(() => {
  window.gtag = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
});

test("keeps the bookmark dialog top reachable in a short mobile viewport", () => {
  render(
    <div data-testid="header-stacking-context">
      <BookmarkButton />
    </div>,
  );

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
  expect(
    screen.getByTestId("header-stacking-context").querySelector('[role="dialog"]'),
  ).toBeNull();
  expect(dialog.parentElement).toBe(document.body);
  expect(screen.getByRole("button", { name: "閉じる" })).toBeVisible();
});

test("uses browser-generic bookmark instructions on iPhone", () => {
  jest
    .spyOn(window.navigator, "userAgent", "get")
    .mockReturnValue("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)");

  render(<BookmarkButton />);

  fireEvent.click(
    screen.getByRole("button", {
      name: "このページをブックマークに追加",
    }),
  );

  expect(
    screen.getByText(
      "ブラウザの共有ボタンを開き、「ブックマークを追加」または「ホーム画面に追加」を選んでください。",
    ),
  ).toBeVisible();
  expect(screen.queryByText(/Safari/)).not.toBeInTheDocument();
});
