import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import apps from "@/data/apps";
import { categories, getCategoryBySlug } from "@/data/categories";
import { ToolDirectory } from "@/components/ToolDirectory";
import { siteUrl } from "@/lib/site";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return categories.map((category) => ({ slug: category.id }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return {};
  const title = `${category.name}の無料Webツール`;
  return {
    title,
    description: category.description,
    alternates: { canonical: `/categories/${category.id}` },
    openGraph: {
      title: `${title} | サクプラ`,
      description: category.description,
      url: `/categories/${category.id}`,
    },
    twitter: {
      card: "summary",
      title: `${title} | サクプラ`,
      description: category.shortDescription,
    },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();
  const categoryTools = apps.filter((tool) => tool.categoryId === category.id);
  if (categoryTools.length < 3) notFound();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category.name}の無料Webツール`,
    description: category.description,
    url: `${siteUrl}/categories/${category.id}`,
    inLanguage: "ja",
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "トップ", item: siteUrl },
        {
          "@type": "ListItem",
          position: 2,
          name: "カテゴリー",
          item: `${siteUrl}/categories`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: category.name,
          item: `${siteUrl}/categories/${category.id}`,
        },
      ],
    },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: categoryTools.map((tool, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: tool.title,
        url: `${siteUrl}${tool.href}`,
      })),
    },
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <nav className="text-sm text-slate-500" aria-label="パンくず">
            <Link href="/" className="hover:text-blue-700">
              トップ
            </Link>
            <span aria-hidden="true" className="mx-2">
              /
            </span>
            <Link href="/categories" className="hover:text-blue-700">
              カテゴリー
            </Link>
            <span aria-hidden="true" className="mx-2">
              /
            </span>
            <span aria-current="page">{category.name}</span>
          </nav>
          <div className="mt-10 flex items-start gap-4">
            <span
              aria-hidden="true"
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-sm font-black ${category.iconClass}`}
            >
              {category.symbol}
            </span>
            <div>
              <p className="text-xs font-black tracking-[0.2em] text-blue-600">
                CATEGORY
              </p>
              <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                {category.name}の無料Webツール
              </h1>
            </div>
          </div>
          <p className="mt-6 max-w-4xl text-base leading-8 text-slate-600">
            {category.description}
          </p>
          <div className="mt-8 grid gap-5 rounded-3xl bg-slate-50 p-6 md:grid-cols-2">
            <div>
              <h2 className="font-black text-slate-950">こんな方におすすめ</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {category.audience}
              </p>
            </div>
            <div>
              <h2 className="font-black text-slate-950">よくある課題</h2>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                {category.painPoints.map((painPoint) => (
                  <li key={painPoint} className="flex gap-2">
                    <span aria-hidden="true" className="text-blue-600">
                      ✓
                    </span>
                    <span>{painPoint}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <ToolDirectory apps={categoryTools} />
      </section>
    </main>
  );
}
