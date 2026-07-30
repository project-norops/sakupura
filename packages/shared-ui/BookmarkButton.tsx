"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { trackAnalyticsEvent } from "./AnalyticsEvents";

function bookmarkInstructions() {
  if (typeof navigator === "undefined")
    return "ブラウザのブックマーク機能をご利用ください。";

  const userAgent = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(userAgent)) {
    return "ブラウザの共有ボタンを開き、「ブックマークを追加」または「ホーム画面に追加」を選んでください。";
  }
  if (/android/.test(userAgent)) {
    return "ブラウザ右上のメニューを開き、星印または「ブックマークに追加」を選んでください。";
  }
  if (/macintosh|mac os x/.test(userAgent)) {
    return "⌘ + D キーを押すと、このページをブックマークに追加できます。";
  }
  return "Ctrl + D キーを押すと、このページをブックマークに追加できます。";
}

export function BookmarkButton() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      trackAnalyticsEvent("bookmark_url_copy", {
        method: "clipboard",
        content_type: "web_page",
        item_id: window.location.pathname,
      });
    } catch {
      setCopied(false);
    }
  };

  const dialog =
    open && typeof document !== "undefined"
      ? createPortal(
        <div
          className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-slate-950/70 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="bookmark-title"
        >
          <div className="flex min-h-full items-start justify-center py-2 sm:items-center">
            <div className="max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 text-slate-900 shadow-2xl sm:p-8">
              <h2 id="bookmark-title" className="text-xl font-semibold">
                このページを保存
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                {bookmarkInstructions()}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={copyUrl}
                  className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  {copied ? "URLをコピーしました" : "URLをコピー"}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body,
      )
      : null;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setCopied(false);
          setOpen(true);
          trackAnalyticsEvent("bookmark_prompt_open", {
            method: "site_header",
            content_type: "web_page",
            item_id: window.location.pathname,
          });
        }}
        className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-blue-600 px-3.5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:px-4"
        aria-label="このページをブックマークに追加"
      >
        <span aria-hidden="true">☆</span>
        <span className="sm:hidden">保存</span>
        <span className="hidden sm:inline">このページを保存</span>
      </button>

      {dialog}
    </>
  );
}
