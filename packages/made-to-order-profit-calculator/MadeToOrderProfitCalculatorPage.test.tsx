/** @jest-environment jsdom */
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { MadeToOrderProfitCalculatorPage } from "./MadeToOrderProfitCalculatorPage";

beforeEach(() => {
  window.localStorage.clear();
  window.gtag = jest.fn();
  window.requestAnimationFrame = (callback) => {
    callback(0);
    return 1;
  };
});

test("loads the 30 and 50 item sample and compares the results", () => {
  render(<MadeToOrderProfitCalculatorPage />);
  expect(
    screen.getByRole("region", { name: "かんたん操作手順" }),
  ).toBeInTheDocument();
  expect(
    screen.getByText(/需要、完売、最適な製造数は予測・保証しません/),
  ).toBeInTheDocument();
  expect(screen.getByLabelText("比較結果")).toHaveTextContent(
    "ここに比較結果が表示されます",
  );

  fireEvent.click(screen.getByRole("button", { name: "30個・50個のサンプル" }));
  fireEvent.click(
    screen.getByRole("button", { name: "損益分岐と完売時利益を計算する" }),
  );

  expect(screen.getByText("20件")).toBeInTheDocument();
  expect(screen.getByText("27件")).toBeInTheDocument();
  expect(screen.getByText("11,520円")).toBeInTheDocument();
  expect(screen.getByText("27,980円")).toBeInTheDocument();
  expect(screen.getByText("製造条件の保存")).toBeInTheDocument();
  expect(screen.getByText("複数商品のまとめ比較")).toBeInTheDocument();
});

test("shows a clear error for missing and unprofitable conditions", () => {
  render(<MadeToOrderProfitCalculatorPage />);
  fireEvent.click(
    screen.getByRole("button", { name: "損益分岐と完売時利益を計算する" }),
  );
  expect(screen.getByRole("alert")).toHaveTextContent(
    "販売価格は0円より大きい金額",
  );

  fireEvent.click(screen.getByRole("button", { name: "30個・50個のサンプル" }));
  fireEvent.change(screen.getByLabelText(/販売者が負担する送料/), {
    target: { value: "2000" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "損益分岐と完売時利益を計算する" }),
  );
  expect(screen.getByRole("alert")).toHaveTextContent("引いた金額が0円以下");
  expect(screen.queryByText("製造条件の保存")).not.toBeInTheDocument();
});

test("marks a lot that cannot reach break-even before sellout", () => {
  render(<MadeToOrderProfitCalculatorPage />);
  fireEvent.click(screen.getByRole("button", { name: "30個・50個のサンプル" }));
  fireEvent.change(screen.getByLabelText(/固定費/), {
    target: { value: "100000" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "損益分岐と完売時利益を計算する" }),
  );
  expect(screen.getAllByText(/完売しても未達/).length).toBeGreaterThan(0);
  expect(screen.getAllByText("条件の見直しが必要").length).toBeGreaterThan(0);
});

test("keeps analytics values fixed to the tool slug", () => {
  render(<MadeToOrderProfitCalculatorPage />);
  expect(
    screen.getByRole("button", { name: "30個・50個のサンプル" }),
  ).toHaveAttribute(
    "data-analytics-tool-id",
    "made-to-order-profit-calculator",
  );
  expect(
    screen.getByRole("button", { name: "損益分岐と完売時利益を計算する" }),
  ).toHaveAttribute(
    "data-analytics-tool-id",
    "made-to-order-profit-calculator",
  );
});

test("downloads the calculated comparison as a CSV", () => {
  const createObjectUrl = jest.fn(() => "blob:comparison");
  const revokeObjectUrl = jest.fn();
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    value: createObjectUrl,
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    configurable: true,
    value: revokeObjectUrl,
  });
  const click = jest
    .spyOn(HTMLAnchorElement.prototype, "click")
    .mockImplementation(() => undefined);

  render(<MadeToOrderProfitCalculatorPage />);
  fireEvent.click(screen.getByRole("button", { name: "30個・50個のサンプル" }));
  fireEvent.click(
    screen.getByRole("button", { name: "損益分岐と完売時利益を計算する" }),
  );
  fireEvent.click(screen.getByRole("button", { name: "比較結果CSVを保存" }));

  expect(createObjectUrl).toHaveBeenCalledWith(expect.any(Blob));
  expect(click).toHaveBeenCalled();
  expect(revokeObjectUrl).toHaveBeenCalledWith("blob:comparison");
  click.mockRestore();
});
