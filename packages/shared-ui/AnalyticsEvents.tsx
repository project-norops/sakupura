"use client";

import { useEffect } from "react";

type AnalyticsValue = string | number | boolean;
type AnalyticsParameters = Record<string, AnalyticsValue | undefined>;

export const premiumInterestFeatures = {
  "csv-column-mapper": ["mapping_rule_save", "batch_files"],
  "csv-duplicate-cleaner": ["cleaning_rule_save", "batch_files"],
  "calendar-csv-ics-converter": ["conversion_preset_save", "recurring_events"],
  "robots-sitemap-checker": ["project_save", "live_url_check"],
  "ogp-card-preview": ["brand_preset_save", "bulk_page_audit"],
  "csv-rule-validator": ["validation_rule_save", "batch_validation"],
  "csv-joiner": ["join_recipe_save", "multi_file_join"],
  "har-sanitizer": ["redaction_profile_save", "batch_har_sanitize"],
  "pwa-manifest-checker": ["project_manifest_save", "icon_pack_export"],
  "csv-pivot-reshape": ["reshape_recipe_save", "batch_reshape"],
  "reorder-point-calculator": ["inventory_profile_save", "multi_sku_inventory"],
  "free-shipping-threshold-calculator": [
    "shipping_scenario_save",
    "multi_region_shipping",
  ],
  "social-content-calendar": ["content_calendar_save", "multi_brand_calendar"],
  "freelance-capacity-planner": ["capacity_plan_save", "multi_month_capacity"],
  "labor-sales-planner": ["shift_template_save", "multi_store_labor_compare"],
  "commission-brief-builder": ["brief_template_save", "multi_brief_project"],
  "commission-rate-card-maker": [
    "rate_card_preset_save",
    "multi_menu_rate_card",
  ],
  "made-to-order-profit-calculator": [
    "production_scenario_save",
    "multi_product_compare",
  ],
  "digital-product-launch-planner": ["launch_plan_save", "multi_launch_plan"],
  "delivery-file-checker": ["delivery_rule_save", "batch_delivery_check"],
  "popup-event-profit-calculator": [
    "event_scenario_save",
    "multi_event_compare",
  ],
  "return-cost-calculator": [
    "return_scenario_save",
    "multi_product_return_compare",
  ],
} as const;

export type PremiumInterestToolId = keyof typeof premiumInterestFeatures;
export type PremiumInterestFeatureId =
  (typeof premiumInterestFeatures)[PremiumInterestToolId][number];
export type PremiumInterestPlacement = "result_after";

const premiumInterestEvents = new Set([
  "premium_interest_open",
  "premium_interest_confirm",
]);

function isAllowedPremiumInterestEvent(
  eventName: string,
  parameters: AnalyticsParameters,
) {
  if (!premiumInterestEvents.has(eventName)) return true;

  const keys = Object.keys(parameters).filter(
    (key) => parameters[key] !== undefined,
  );
  if (
    keys.length !== 3 ||
    !keys.every((key) =>
      ["tool_id", "feature_id", "placement"].includes(key),
    ) ||
    parameters.placement !== "result_after"
  ) {
    return false;
  }

  const toolId = parameters.tool_id;
  const featureId = parameters.feature_id;
  if (
    typeof toolId !== "string" ||
    typeof featureId !== "string" ||
    !(toolId in premiumInterestFeatures)
  ) {
    return false;
  }

  return (
    premiumInterestFeatures[
      toolId as PremiumInterestToolId
    ] as readonly string[]
  ).includes(featureId);
}

declare global {
  interface Window {
    gtag?: (
      command: "event",
      eventName: string,
      parameters?: Record<string, AnalyticsValue>,
    ) => void;
  }
}

export function trackAnalyticsEvent(
  eventName: string,
  parameters: AnalyticsParameters = {},
) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }

  if (!isAllowedPremiumInterestEvent(eventName, parameters)) return;

  const cleanParameters = Object.fromEntries(
    Object.entries(parameters).filter((entry) => entry[1] !== undefined),
  ) as Record<string, AnalyticsValue>;

  try {
    window.gtag("event", eventName, cleanParameters);
  } catch {
    // Analytics must never block the tool or its dialogs.
  }
}

function parametersFromElement(element: HTMLElement): AnalyticsParameters {
  return {
    method: element.dataset.analyticsMethod,
    content_type: element.dataset.analyticsContentType,
    item_id: element.dataset.analyticsItemId,
    tool_id: element.dataset.analyticsToolId,
    action: element.dataset.analyticsAction,
    platform: element.dataset.analyticsPlatform,
    result_type: element.dataset.analyticsResultType,
  };
}

export function AnalyticsEvents() {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const trackedElement = target.closest<HTMLElement>(
        "[data-analytics-event]",
      );
      if (
        !trackedElement ||
        trackedElement.getAttribute("aria-disabled") === "true"
      ) {
        return;
      }

      const eventName = trackedElement.dataset.analyticsEvent;
      if (!eventName) return;

      trackAnalyticsEvent(eventName, parametersFromElement(trackedElement));
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}
