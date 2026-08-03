import Link from "next/link";
import apps from "@/data/apps";
import { ToolDirectory } from "@/components/ToolDirectory";
import { CategoryNavigation } from "@/components/CategoryNavigation";
import { guides } from "@/data/guides";
import { siteUrl } from "@/lib/site";

export default function HomePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: "サクプラ",
        alternateName: "サクプラ by NOROPS",
        url: siteUrl,
        description:
          "仕事の進め方を学べる実践ガイドと、登録不要で使える無料Webツールを提供します。",
        inLanguage: "ja",
      },
      {
        "@type": "ItemList",
        name: "サクプラ実践ガイド",
        itemListElement: guides.map((guide, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: guide.title,
          url: `${siteUrl}/guides/${guide.slug}`,
        })),
      },
    ],
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_15%,rgba(59,130,246,0.12),transparent_32%),radial-gradient(circle_at_15%_80%,rgba(14,165,233,0.08),transparent_30%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1fr_0.78fr] lg:items-center lg:px-8 lg:py-28">
          <div>
            <p className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold tracking-wide text-blue-700">
              実践ガイド＋登録不要の無料Webツール
            </p>
            <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.15] tracking-[-0.04em] text-slate-950 sm:text-6xl">
              仕事の進め方がわかる。
              <br />
              <span className="text-blue-600">必要な作業は、その場でできる。</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              サクプラは、フリーランスの受注・請求、ネットショップ運営、CSV受け渡し、Web公開などの進め方を、具体的な手順で解説します。必要な計算や確認には、登録不要の無料ツールを使えます。
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="#by-purpose"
                data-analytics-event="select_content"
                data-analytics-content-type="navigation"
                data-analytics-item-id="home_hero_purpose"
                className="inline-flex min-h-12 items-center rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
              >
                やりたいことから探す
              </Link>
              <Link
                href="/guides"
                data-analytics-event="select_content"
                data-analytics-content-type="navigation"
                data-analytics-item-id="home_hero_guides"
                className="inline-flex min-h-12 items-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-800 transition hover:border-blue-300 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
              >
                実践ガイドを読む
              </Link>
            </div>
          </div>

          <aside
            aria-label="サクプラの使い方"
            className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-200/60 backdrop-blur sm:p-8"
          >
            <p className="text-xs font-black tracking-[0.18em] text-blue-600">
              HOW TO USE
            </p>
            <h2 className="mt-3 text-2xl font-black text-slate-950">
              迷ったら、この順番で
            </h2>
            <ol className="mt-6 space-y-5">
            {[
              ["01", "困りごとを選ぶ", "発信、日々の業務、EC・CSV、Web制作から選びます。"],
              ["02", "手順を確認する", "業務全体を知りたいときは、実践ガイドを読みます。"],
              ["03", "必要な作業だけ進める", "計算や確認が必要な工程で、補助ツールを使います。"],
            ].map(([number, title, description]) => (
              <li
                key={number}
                className="flex gap-4"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-black text-blue-700">
                  {number}
                </span>
                <div>
                  <p className="font-bold text-slate-950">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {description}
                  </p>
                </div>
              </li>
            ))}
            </ol>
            <p className="mt-6 border-t border-slate-200 pt-5 text-xs leading-6 text-slate-500">
              ツールごとのデータ処理方法や注意点は、各ページで確認できます。
            </p>
          </aside>
        </div>
      </section>

      <section
        id="by-purpose"
        className="scroll-mt-24 border-b border-slate-200 bg-slate-50"
      >
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-black tracking-[0.2em] text-blue-600">
              FIND BY PURPOSE
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              やりたいことから探す
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-600">
              ツール名が分からなくても大丈夫です。いま取り組んでいる仕事に近いカテゴリーから、ガイドと無料ツールを探せます。
            </p>
          </div>
          <CategoryNavigation />
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-black tracking-[0.2em] text-blue-300">
                PRACTICAL GUIDES
              </p>
              <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-tight sm:text-4xl">
                仕事の手順を知りたい方へ
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
                ツールを使わない確認・連絡・記録も省かず、仕事を終えるまでの流れを具体例と図で説明します。
              </p>
            </div>
            <Link
              href="/guides"
              className="inline-flex min-h-12 items-center self-start rounded-full border border-white/30 px-5 py-3 text-sm font-bold hover:bg-white hover:text-slate-950 md:self-auto"
            >
              すべての実践ガイドを見る →
            </Link>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {guides.map((guide) => (
              <Link
                key={guide.slug}
                href={`/guides/${guide.slug}`}
                data-analytics-event="select_content"
                data-analytics-content-type="guide"
                data-analytics-item-id={guide.slug}
                className="group rounded-3xl border border-white/15 bg-white/5 p-5 transition hover:border-blue-300/70 hover:bg-white/10 sm:p-6"
              >
                <p className="text-xs font-black tracking-[0.16em] text-blue-300">
                  {guide.eyebrow}
                </p>
                <h3 className="mt-3 text-xl font-black leading-snug group-hover:text-blue-200">
                  {guide.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {guide.description}
                </p>
                <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-xs font-semibold text-slate-400">
                  <span>読了目安 約{guide.readingMinutes}分</span>
                  <span className="text-blue-200">手順を見る →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section
        id="tools"
        className="scroll-mt-24 mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      >
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-black tracking-[0.2em] text-blue-600">
              FREE TOOLS
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              作業をすぐ始めたい方へ
            </h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-slate-500">
            ツール名や「請求書」「文字化け」「画像」などの目的で検索できます。入力内容の扱いは各ツールの説明で確認できます。
          </p>
        </div>

        <ToolDirectory apps={apps} />
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-[0.7fr_1.3fr] lg:px-8">
          <div>
            <p className="text-xs font-black tracking-[0.2em] text-blue-600">
              ABOUT
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
              サクプラについて
            </h2>
          </div>
          <div className="space-y-5 text-base leading-8 text-slate-600">
            <p>
              サクプラは、計算、文章作成、データ確認、Web公開など、日々の仕事を迷わず進めるための実践ガイドと無料Webツールを提供するサービスです。
            </p>
            <p>
              多機能さよりも、迷わず使えることを重視しています。実践ガイドでは複数ツールの選び分け、具体例、確認した一次情報、判断できない範囲まで公開し、利用状況と仕様変更に合わせて内容を見直します。
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
