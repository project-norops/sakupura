/** @jest-environment jsdom */

import "@testing-library/jest-dom";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { CsvColumnMapperPage } from "./CsvColumnMapperPage";

beforeEach(() => {
  URL.createObjectURL = jest.fn(() => "blob:csv");
  URL.revokeObjectURL = jest.fn();
  jest.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
});

test("offers source and target CSV downloads", () => {
  render(<CsvColumnMapperPage />);
  fireEvent.click(
    screen.getByRole("button", { name: "変換元サンプルCSVを保存" }),
  );
  fireEvent.click(
    screen.getByRole("button", { name: "取込先テンプレートCSVを保存" }),
  );
  expect(URL.createObjectURL).toHaveBeenCalledTimes(2);
});

test("requires explicit mappings before preview and shows excluded columns", () => {
  render(<CsvColumnMapperPage />);
  fireEvent.click(
    screen.getByRole("button", { name: "操作サンプルを読み込む" }),
  );

  const previewButton = screen.getByRole("button", {
    name: "変換プレビューを作成",
  });
  expect(previewButton).toBeDisabled();

  const sourceAssignments = [
    ["商品コード", "sku"],
    ["商品名", "title"],
    ["販売価格", "price"],
  ];
  for (const [target, source] of sourceAssignments) {
    fireEvent.change(screen.getByLabelText(`${target}の入れ方`), {
      target: { value: "source" },
    });
    fireEvent.change(screen.getByLabelText(`${target}へ割り当てる変換元列`), {
      target: { value: source },
    });
  }
  fireEvent.change(screen.getByLabelText("公開状態の入れ方"), {
    target: { value: "fixed" },
  });
  fireEvent.change(screen.getByLabelText("公開状態へ入れる固定値"), {
    target: { value: "draft" },
  });

  expect(previewButton).toBeEnabled();
  const excluded = within(
    screen.getByLabelText("出力から除外する変換元列（3）"),
  );
  expect(excluded.getByText("cost")).toBeInTheDocument();
  expect(excluded.getByText("inventory")).toBeInTheDocument();
  expect(excluded.getByText("description")).toBeInTheDocument();

  fireEvent.click(previewButton);
  expect(
    screen.getByRole("heading", { name: "保存前の変換プレビュー" }),
  ).toBeInTheDocument();
  expect(screen.getByText("A-001")).toBeInTheDocument();
  expect(screen.getAllByText("draft")).toHaveLength(2);
  expect(screen.getByRole("button", { name: "変換CSVを保存" })).toBeEnabled();
});
