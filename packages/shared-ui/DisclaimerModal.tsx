"use client";

import { useState } from "react";

export function DisclaimerModal() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
      >
        Disclaimer
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="max-w-xl rounded-3xl bg-white p-6 text-slate-900 shadow-2xl dark:bg-slate-900 dark:text-slate-50">
            <h2 className="text-xl font-semibold">免責事項</h2>
            <p className="mt-4 text-sm leading-7">
              本ツールの算出結果および提供情報によって生じた損害等について、当サイトは一切の責任を負いません。ご利用は自己責任でお願いいたします。
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-6 rounded-full bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
            >
              閉じる
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
