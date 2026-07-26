import Link from "next/link";
import { categories } from "@/data/categories";

export function CategoryNavigation() {
  return (
    <nav className="mt-8" aria-label="目的別カテゴリー">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.id}`}
            data-analytics-event="select_content"
            data-analytics-content-type="category"
            data-analytics-item-id={category.id}
            className={`group rounded-2xl border border-t-4 border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md ${category.accentClass}`}
          >
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-black ${category.iconClass}`}
              >
                {category.symbol}
              </span>
              <span className="font-black text-slate-950">{category.name}</span>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              {category.shortDescription}
            </p>
            <span className="mt-3 inline-flex text-xs font-bold text-blue-700">
              カテゴリーを見る <span aria-hidden="true">→</span>
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
