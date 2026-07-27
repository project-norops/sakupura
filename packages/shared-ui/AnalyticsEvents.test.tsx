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

  it("gtagの送信失敗でUI処理を停止しない", () => {
    window.gtag = jest.fn(() => {
      throw new Error("blocked");
    });
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

  it("有料候補イベントは許可済み固定値だけを送信する", () => {
    window.gtag = jest.fn();
    trackAnalyticsEvent("premium_interest_confirm", {
      tool_id: "csv-column-mapper",
      feature_id: "mapping_rule_save",
      placement: "result_after",
    });

    expect(window.gtag).toHaveBeenCalledWith(
      "event",
      "premium_interest_confirm",
      {
        tool_id: "csv-column-mapper",
        feature_id: "mapping_rule_save",
        placement: "result_after",
      },
    );
  });

  it("CSVルール検証の固定feature_idだけを許可する", () => {
    window.gtag = jest.fn();
    trackAnalyticsEvent("premium_interest_open", {
      tool_id: "csv-rule-validator",
      feature_id: "validation_rule_save",
      placement: "result_after",
    });
    trackAnalyticsEvent("premium_interest_confirm", {
      tool_id: "csv-rule-validator",
      feature_id: "batch_validation",
      placement: "result_after",
    });

    expect(window.gtag).toHaveBeenNthCalledWith(
      1,
      "event",
      "premium_interest_open",
      {
        tool_id: "csv-rule-validator",
        feature_id: "validation_rule_save",
        placement: "result_after",
      },
    );
    expect(window.gtag).toHaveBeenNthCalledWith(
      2,
      "event",
      "premium_interest_confirm",
      {
        tool_id: "csv-rule-validator",
        feature_id: "batch_validation",
        placement: "result_after",
      },
    );
  });

  it("CSV結合の固定feature_idだけを許可する", () => {
    window.gtag = jest.fn();
    trackAnalyticsEvent("premium_interest_confirm", {
      tool_id: "csv-joiner",
      feature_id: "join_recipe_save",
      placement: "result_after",
    });

    expect(window.gtag).toHaveBeenCalledWith(
      "event",
      "premium_interest_confirm",
      {
        tool_id: "csv-joiner",
        feature_id: "join_recipe_save",
        placement: "result_after",
      },
    );
  });

  it("HAR匿名化の固定feature_idだけを許可する", () => {
    window.gtag = jest.fn();
    trackAnalyticsEvent("premium_interest_confirm", {
      tool_id: "har-sanitizer",
      feature_id: "redaction_profile_save",
      placement: "result_after",
    });

    expect(window.gtag).toHaveBeenCalledWith(
      "event",
      "premium_interest_confirm",
      {
        tool_id: "har-sanitizer",
        feature_id: "redaction_profile_save",
        placement: "result_after",
      },
    );
  });

  it.each([
    {
      tool_id: "csv-column-mapper",
      feature_id: "unknown_feature",
      placement: "result_after",
    },
    {
      tool_id: "csv-column-mapper",
      feature_id: "mapping_rule_save",
      placement: "before_result",
    },
    {
      tool_id: "csv-column-mapper",
      feature_id: "mapping_rule_save",
      placement: "result_after",
      input_value: "送信禁止",
    },
  ])("有料候補イベントの未許可値や追加値を拒否する", (parameters) => {
    window.gtag = jest.fn();
    trackAnalyticsEvent("premium_interest_open", parameters);
    expect(window.gtag).not.toHaveBeenCalled();
  });
});
