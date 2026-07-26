/** @jest-environment jsdom */

import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { YoutubeChapterMakerPage } from "./YoutubeChapterMakerPage";

const writeText = jest.fn().mockResolvedValue(undefined);

beforeEach(() => {
  writeText.mockClear();
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  });
});

test("loads a valid five-chapter sample and copies it", async () => {
  const user = userEvent.setup();
  render(<YoutubeChapterMakerPage />);
  await user.click(screen.getByRole("button", { name: "サンプルで試す" }));
  expect(
    screen.getByText("公式の基本条件を満たしています"),
  ).toBeInTheDocument();
  expect(screen.getByDisplayValue(/0:42 準備するもの/)).toBeInTheDocument();
  await user.click(
    screen.getByRole("button", { name: "概要欄用チャプターをコピー" }),
  );
  expect(
    await screen.findByRole("button", { name: "コピーしました" }),
  ).toBeInTheDocument();
});

test("shows official guidance and explains that AI is not used", () => {
  render(<YoutubeChapterMakerPage />);
  expect(screen.getByText(/AIや動画解析は使用しません/)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /YouTube公式/ })).toHaveAttribute(
    "href",
    expect.stringContaining("support.google.com/youtube"),
  );
});
