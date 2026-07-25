import Link from "next/link";
import apps from "@/data/apps";
import { ToolDirectory } from "@/components/ToolDirectory";
import { siteUrl } from "@/lib/site";

export default function HomePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "サクプラ",
    alternateName: "サクプラ by NOROPS",
    url: siteUrl,
    description: "登録不要で今すぐ使える、仕事と発信に役立つ無料Webツール集。",
    inLanguage: "ja",
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_15%,rgba(59,130,246,0.12),transparent_32%),radial-gradient(circle_at_15%_80%,rgba(14,165,233,0.08),transparent_30%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1fr_0.72fr] lg:items-center lg:px-8 lg:py-28">
          <div>
            <p className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold tracking-wide text-blue-700">
              無料・登録不要・ブラウザですぐ使える
            </p>
            <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.15] tracking-[-0.04em] text-slate-950 sm:text-6xl">
              面倒な作業を、
              <br />
              <span className="text-blue-600">すぐに片づける。</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              サクプラは、仕事・販売・情報発信の小さな手間を減らす実用ツール集です。アカウント登録なしで、必要なときにすぐ使えます。
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="#tools"
                data-analytics-event="select_content"
                data-analytics-content-type="navigation"
                data-analytics-item-id="home_hero_tools"
                className="inline-flex min-h-12 items-center rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
              >
                無料ツールを見る
              </Link>
              <p className="text-sm font-medium text-slate-500">
                インストール不要・スマホ対応
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              ["01", "すぐ使える", "会員登録や複雑な初期設定はありません。"],
              ["02", "端末内で処理", "入力データを必要以上に外へ送りません。"],
              ["03", "実務に特化", "ひとつの面倒を短時間で解決します。"],
            ].map(([number, title, description]) => (
              <div
                key={number}
                className="flex gap-4 rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur sm:block lg:flex"
              >
                <span className="text-xs font-black text-blue-600">
                  {number}
                </span>
                <div>
                  <p className="font-bold text-slate-950">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {description}
                  </p>
                </div>
              </div>
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
              使いたいツールを選ぶ
            </h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-slate-500">
            すべて無料でお試しいただけます。入力内容の扱いは各ツールの説明で確認できます。
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
              サクプラは、計算、文章作成、業務整理など、日々の「少し面倒」を短時間で終わらせるためのWebツールを集めたサービスです。
            </p>
            <p>
              多機能さよりも、迷わず使えることを重視しています。新しいツールも順次追加します。よく使うページは上部の「このページを保存」からブックマークしておくと、次回すぐに開けます。
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
