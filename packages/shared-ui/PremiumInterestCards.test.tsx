/** @jest-environment jsdom */

import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { PremiumInterestCards } from "./PremiumInterestCards";

const candidates = [
  {
    featureId: "mapping_rule_save" as const,
    name: "変換ルール保存",
    description: "同じ列対応を次回も呼び出せる候補です。",
  },
  {
    featureId: "batch_files" as const,
    name: "複数ファイル一括処理",
    description: "同じ設定で複数CSVをまとめて変換する候補です。",
  },
];

beforeEach(() => {
  window.localStorage.clear();
  window.gtag = jest.fn();
  window.requestAnimationFrame = (callback) => {
    callback(0);
    return 1;
  };
});

afterEach(() => {
  delete window.gtag;
});

function renderCards() {
  return render(
    <PremiumInterestCards
      toolId="csv-column-mapper"
      placement="result_after"
      candidates={candidates}
    />,
  );
}

test("opens by explicit action, moves focus, closes with Escape, and restores focus", () => {
  renderCards();
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  const trigger = screen.getAllByRole("button", { name: "詳しく見る" })[0];
  fireEvent.click(trigger);

  expect(screen.getByRole("dialog")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "閉じる" })).toHaveFocus();
  expect(window.gtag).toHaveBeenCalledWith("event", "premium_interest_open", {
    tool_id: "csv-column-mapper",
    feature_id: "mapping_rule_save",
    placement: "result_after",
  });

  fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
});

test("traps keyboard focus inside the dialog", () => {
  renderCards();
  fireEvent.click(screen.getAllByRole("button", { name: "詳しく見る" })[0]);
  const close = screen.getByRole("button", { name: "閉じる" });
  const confirm = screen.getByRole("button", { name: "興味があります" });

  confirm.focus();
  fireEvent.keyDown(screen.getByRole("dialog"), { key: "Tab" });
  expect(close).toHaveFocus();
  fireEvent.keyDown(screen.getByRole("dialog"), {
    key: "Tab",
    shiftKey: true,
  });
  expect(confirm).toHaveFocus();
});

test("records one confirmation per browser and feature", () => {
  const { unmount } = renderCards();
  fireEvent.click(screen.getAllByRole("button", { name: "詳しく見る" })[0]);
  fireEvent.click(screen.getByRole("button", { name: "興味があります" }));

  expect(screen.getByRole("status")).toHaveTextContent("ご意見を記録しました");
  expect(window.gtag).toHaveBeenCalledTimes(2);
  unmount();

  renderCards();
  fireEvent.click(screen.getByRole("button", { name: "記録内容を確認" }));
  expect(screen.queryByRole("button", { name: "興味があります" })).not.toBeInTheDocument();
  expect(screen.getByRole("status")).toHaveTextContent("ご意見を記録しました");
  expect(window.gtag).toHaveBeenCalledTimes(3);
});
