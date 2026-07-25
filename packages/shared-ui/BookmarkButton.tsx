"use client";

import { useState } from "react";

function bookmarkInstructions() {
  if (typeof navigator === "undefined")
    return "ブラウザのブックマーク機能をご利用ください。";

  const userAgent = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(userAgent)) {
    return "Safariの共有ボタンを開き、「ブックマークを追加」または「ホーム画面に追加」を選んでください。";
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
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setCopied(false);
          setOpen(true);
        }}
        className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-5 py-2.5 text-sm font-semibold text-sky-700 shadow-sm transition hover:border-sky-400 hover:bg-sky-50 dark:border-sky-800 dark:bg-slate-900 dark:text-sky-200 dark:hover:bg-slate-800"
      >
        <span aria-hidden="true">★</span>
        ブックマークに追加
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="bookmark-title"
        >
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 text-slate-900 shadow-2xl dark:bg-slate-900 dark:text-slate-50">
            <h2 id="bookmark-title" className="text-xl font-semibold">
              このページを保存
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
              {bookmarkInstructions()}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={copyUrl}
                className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
              >
                {copied ? "URLをコピーしました" : "URLをコピー"}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
