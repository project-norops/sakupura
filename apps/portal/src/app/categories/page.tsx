import type { Metadata } from "next";
import { withSocialMetadata } from "@/lib/metadata";
import Link from "next/link";
import apps from "@/data/apps";
import { categories } from "@/data/categories";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = withSocialMetadata({
  title: "無料Webツールを目的別に探す",
  description:
    "発信・集客、業務効率化、EC・CSV、Web制作・改善の目的別に、登録不要で使える無料Webツールを探せます。",
  alternates: { canonical: "/categories" },
  openGraph: {
    title: "無料Webツールを目的別に探す | サクプラ",
    description: "20件の無料Webツールを4つのカテゴリーから選べます。",
    url: "/categories",
  },
});

export default function CategoriesPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "サクプラの無料Webツールカテゴリー",
    url: `${siteUrl}/categories`,
    inLanguage: "ja",
    hasPart: categories.map((category) => ({
      "@type": "CollectionPage",
      name: category.name,
      url: `${siteUrl}/categories/${category.id}`,
    })),
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <nav className="text-sm text-slate-500" aria-label="パンくず">
        <Link href="/" className="hover:text-blue-700">
          トップ
        </Link>
        <span aria-hidden="true" className="mx-2">
          /
        </span>
        <span aria-current="page">カテゴリー</span>
      </nav>
      <p className="mt-10 text-xs font-black tracking-[0.2em] text-blue-600">
        CATEGORIES
      </p>
      <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
        目的から無料ツールを探す
      </h1>
      <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
        サクプラの無料Webツールを、作業の目的ごとに整理しています。すべて登録不要で、必要なときにブラウザからすぐ利用できます。
      </p>
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {categories.map((category) => {
          const count = apps.filter(
            (tool) => tool.categoryId === category.id,
          ).length;
          return (
            <Link
              key={category.id}
              href={`/categories/${category.id}`}
              data-analytics-event="select_content"
              data-analytics-content-type="category"
              data-analytics-item-id={category.id}
              className={`group rounded-3xl border border-t-4 border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md sm:p-7 ${category.accentClass}`}
            >
              <div className="flex items-center justify-between gap-4">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset ${category.badgeClass}`}
                >
                  {count}ツール
                </span>
                <span aria-hidden="true" className="text-slate-400">
                  →
                </span>
              </div>
              <h2 className="mt-5 text-2xl font-black text-slate-950 group-hover:text-blue-700">
                {category.name}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {category.description}
              </p>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
