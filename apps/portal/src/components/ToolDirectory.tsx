"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { AppDefinition } from "@/data/apps";

function normalize(value: string) {
  return value.normalize("NFKC").toLocaleLowerCase("ja").replaceAll(/\s+/g, "");
}

export function filterTools(apps: AppDefinition[], query: string) {
  const keyword = normalize(query.trim());
  if (!keyword) return apps;

  return apps.filter((app) => {
    const searchableText = [
      app.title,
      app.description,
      app.badge,
      app.content.summary,
      app.content.audience,
      ...app.content.features.flatMap((feature) => [
        feature.title,
        feature.description,
      ]),
    ].join(" ");
    return normalize(searchableText).includes(keyword);
  });
}

function AppCard({ app, index }: { app: AppDefinition; index: number }) {
  return (
    <Link
      href={app.href}
      data-analytics-event="select_content"
      data-analytics-content-type="tool"
      data-analytics-item-id={app.slug}
      className="group relative flex min-h-64 flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_12px_40px_-28px_rgba(15,23,42,0.45)] transition duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-[0_24px_56px_-30px_rgba(37,99,235,0.45)] sm:p-7"
    >
      <div className="flex items-center justify-between gap-4">
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
          {app.badge}
        </span>
        <span className="text-xs font-semibold text-slate-400">
          TOOL {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <h3 className="mt-7 text-2xl font-bold leading-snug tracking-tight text-slate-950">
        {app.title}
      </h3>
      <p className="mt-4 flex-1 text-sm leading-7 text-slate-600">
        {app.description}
      </p>
      <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-blue-700">
        無料で使う
        <span
          aria-hidden="true"
          className="transition-transform group-hover:translate-x-1"
        >
          →
        </span>
      </span>
    </Link>
  );
}

export function ToolDirectory({ apps }: { apps: AppDefinition[] }) {
  const [query, setQuery] = useState("");
  const filteredApps = useMemo(() => filterTools(apps, query), [apps, query]);

  return (
    <div className="mt-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
        <label htmlFor="tool-search" className="sr-only">
          ツールをキーワードで検索
        </label>
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="pl-2 text-xl text-slate-400">
            ⌕
          </span>
          <input
            id="tool-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ツール名や目的で検索（例：SNS、口コミ、請求書）"
            autoComplete="off"
            className="min-h-12 min-w-0 flex-1 bg-transparent px-1 text-base text-slate-950 outline-none placeholder:text-slate-400"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="shrink-0 rounded-full px-3 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            >
              クリア
            </button>
          )}
        </div>
      </div>

      <p className="mt-4 text-sm font-medium text-slate-500" aria-live="polite">
        {query.trim()
          ? `${filteredApps.length}件のツールが見つかりました`
          : `${apps.length}件の無料ツール`}
      </p>

      {filteredApps.length > 0 ? (
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {filteredApps.map((app) => (
            <AppCard
              key={app.id}
              app={app}
              index={apps.findIndex((item) => item.id === app.id)}
            />
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <p className="text-lg font-black text-slate-900">
            該当するツールはありません
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            別のキーワードを試すか、検索をクリアして一覧をご覧ください。
          </p>
          <button
            type="button"
            onClick={() => setQuery("")}
            className="mt-5 rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-blue-600"
          >
            すべてのツールを表示
          </button>
        </div>
      )}
    </div>
  );
}
