"use client";

import { useEffect } from "react";

type AnalyticsValue = string | number | boolean;
type AnalyticsParameters = Record<string, AnalyticsValue | undefined>;

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

  const cleanParameters = Object.fromEntries(
    Object.entries(parameters).filter((entry) => entry[1] !== undefined),
  ) as Record<string, AnalyticsValue>;

  window.gtag("event", eventName, cleanParameters);
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
