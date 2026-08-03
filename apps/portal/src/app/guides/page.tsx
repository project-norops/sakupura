import type { Metadata } from "next";
import Link from "next/link";
import { guides } from "@/data/guides";
import { withSocialMetadata } from "@/lib/metadata";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = withSocialMetadata({
  title: "仕事の進め方から選べる実践ガイド",
  description:
    "料金・受注・納品、ECの採算、CSV品質、Web公開前確認を、具体例とツールの選び分けで解説します。",
  alternates: { canonical: "/guides" },
  openGraph: {
    title: "仕事の進め方から選べる実践ガイド | サクプラ",
    description: "単体ツールではなく、仕事の流れから選び方を確認できます。",
    url: "/guides",
  },
});

export default function GuidesPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "サクプラ実践ガイド",
    description: metadata.description,
    url: `${siteUrl}/guides`,
    inLanguage: "ja",
    hasPart: guides.map((guide) => ({
      "@type": "Article",
      headline: guide.title,
      url: `${siteUrl}/guides/${guide.slug}`,
      dateModified: guide.updatedAt,
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
        <span aria-current="page">実践ガイド</span>
      </nav>
      <p className="mt-10 text-xs font-black tracking-[0.2em] text-blue-600">
        PRACTICAL GUIDES
      </p>
      <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
        ツールを選ぶ前に、仕事の進め方を整える
      </h1>
      <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600">
        単体の機能説明ではなく、どの順番で何を確認し、どこから人が判断するかを具体例で解説します。公式情報へ戻れる根拠と、このガイドだけでは決められない範囲も明示しています。
      </p>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {guides.map((guide, index) => (
          <Link
            key={guide.slug}
            href={`/guides/${guide.slug}`}
            data-analytics-event="select_content"
            data-analytics-content-type="guide"
            data-analytics-item-id={guide.slug}
            className="group flex flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg sm:p-8"
          >
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-black tracking-[0.16em] text-blue-600">
                {guide.eyebrow}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                GUIDE {String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <h2 className="mt-6 text-2xl font-black leading-snug text-slate-950 group-hover:text-blue-700">
              {guide.title}
            </h2>
            <p className="mt-4 flex-1 text-sm leading-7 text-slate-600">
              {guide.description}
            </p>
            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5 text-xs font-semibold text-slate-500">
              <span>約{guide.readingMinutes}分</span>
              <span className="text-blue-700">ガイドを読む →</span>
            </div>
          </Link>
        ))}
      </div>

      <section className="mt-14 rounded-[2rem] bg-slate-950 px-6 py-8 text-white sm:px-8">
        <h2 className="text-2xl font-black">ガイドの編集方針</h2>
        <div className="mt-5 grid gap-5 text-sm leading-7 text-slate-300 md:grid-cols-3">
          <p>実際の仕事の流れと具体例から、ツールを使う理由を説明します。</p>
          <p>
            法令・仕様は一次情報へリンクし、確認できない内容を事実として埋めません。
          </p>
          <p>
            計算や診断の限界を明示し、重要な判断では公式情報や専門家の確認へ戻します。
          </p>
        </div>
      </section>
    </main>
  );
}
