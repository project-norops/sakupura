/** @jest-environment jsdom */

import { fireEvent, render } from "@testing-library/react";
import { AnalyticsEvents, trackAnalyticsEvent } from "./AnalyticsEvents";

describe("AnalyticsEvents", () => {
  afterEach(() => {
    delete window.gtag;
  });

  it("gtagが未読込でも安全に何もしない", () => {
    expect(() =>
      trackAnalyticsEvent("tool_run", { tool_id: "sample" }),
    ).not.toThrow();
  });

  it("宣言されたクリックイベントと許可パラメータを送信する", () => {
    window.gtag = jest.fn();
    const { getByRole } = render(
      <>
        <AnalyticsEvents />
        <button
          data-analytics-event="select_content"
          data-analytics-content-type="tool"
          data-analytics-item-id="sample-tool"
        >
          <span>ツールを開く</span>
        </button>
      </>,
    );

    fireEvent.click(getByRole("button", { name: "ツールを開く" }));

    expect(window.gtag).toHaveBeenCalledWith("event", "select_content", {
      content_type: "tool",
      item_id: "sample-tool",
    });
  });

  it("未定義の値やページ本文をイベントへ混入させない", () => {
    window.gtag = jest.fn();
    trackAnalyticsEvent("tool_run", {
      tool_id: "sample-tool",
      action: undefined,
    });

    expect(window.gtag).toHaveBeenCalledWith("event", "tool_run", {
      tool_id: "sample-tool",
    });
  });
});
