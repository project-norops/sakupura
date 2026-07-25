"use client";

import { trackAnalyticsEvent } from "./AnalyticsEvents";

export function ShareButton() {
  const shareOnX = () => {
    const url = new URL("https://x.com/intent/post");
    url.searchParams.set("url", window.location.href);
    url.searchParams.set("text", document.title);
    trackAnalyticsEvent("share", {
      method: "X",
      content_type: "web_page",
      item_id: window.location.pathname,
    });
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      type="button"
      onClick={shareOnX}
      className="hidden min-h-10 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 sm:inline-flex"
      aria-label="このページをXでシェア"
    >
      <span aria-hidden="true">𝕏</span>
      シェア
    </button>
  );
}
