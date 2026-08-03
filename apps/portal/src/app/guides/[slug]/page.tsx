import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getToolBySlug } from "@/data/apps";
import { getGuideBySlug, guides, type GuideSection } from "@/data/guides";
import { withSocialMetadata } from "@/lib/metadata";
import { siteUrl } from "@/lib/site";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return guides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) return {};
  return withSocialMetadata({
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `/guides/${guide.slug}` },
    openGraph: {
      type: "article",
      title: `${guide.title} | サクプラ`,
      description: guide.description,
      url: `/guides/${guide.slug}`,
      modifiedTime: guide.updatedAt,
    },
  });
}

function ToolLinks({ slugs }: { slugs: string[] }) {
  if (slugs.length === 0) return null;
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {slugs.map((slug) => {
        const tool = getToolBySlug(slug);
        return (
          <Link
            key={slug}
            href={tool.href}
            data-analytics-event="select_content"
            data-analytics-content-type="guide_tool"
            data-analytics-item-id={slug}
            className="inline-flex min-h-11 items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-800 hover:border-blue-300 hover:bg-blue-100"
          >
            {tool.title} →
          </Link>
        );
      })}
    </div>
  );
}

function GuideContent({ section }: { section: GuideSection }) {
  if (section.kind === "context" || section.kind === "caution") {
    return (
      <section
        className={
          section.kind === "caution"
            ? "rounded-3xl border border-amber-200 bg-amber-50 p-6 sm:p-8"
            : "border-t border-slate-200 pt-10"
        }
      >
        <h2 className="text-2xl font-black tracking-tight text-slate-950">
          {section.title}
        </h2>
        <div className="mt-5 space-y-4 text-base leading-8 text-slate-700">
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>
    );
  }

  if (section.kind === "workflow") {
    return (
      <section className="border-t border-slate-200 pt-10">
        <h2 className="text-2xl font-black tracking-tight text-slate-950">
          {section.title}
        </h2>
        <p className="mt-4 text-base leading-8 text-slate-600">
          {section.intro}
        </p>
        <ol className="mt-7 space-y-5">
          {section.steps.map((step) => (
            <li
              key={step.title}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h3 className="text-lg font-black text-slate-950">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {step.detail}
              </p>
              <ToolLinks slugs={step.toolSlugs} />
            </li>
          ))}
        </ol>
      </section>
    );
  }

  if (section.kind === "example") {
    return (
      <section className="rounded-[2rem] bg-slate-950 p-6 text-white sm:p-8">
        <p className="text-xs font-black tracking-[0.2em] text-blue-300">
          WORKED EXAMPLE
        </p>
        <h2 className="mt-3 text-2xl font-black tracking-tight">
          {section.title}
        </h2>
        <p className="mt-4 text-sm leading-7 text-slate-300">
          {section.scenario}
        </p>
        <div className="mt-7 grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="font-black">確認する条件</h3>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
              {section.inputs.map((item) => (
                <li key={item}>・{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-black">判断として残すこと</h3>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
              {section.results.map((item) => (
                <li key={item}>・{item}</li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-7 rounded-2xl bg-white/10 p-5 text-sm leading-7 text-slate-100">
          {section.interpretation}
        </p>
      </section>
    );
  }

  if (section.kind === "comparison") {
    return (
      <section className="border-t border-slate-200 pt-10">
        <h2 className="text-2xl font-black tracking-tight text-slate-950">
          {section.title}
        </h2>
        <p className="mt-4 text-base leading-8 text-slate-600">
          {section.intro}
        </p>
        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[680px] border-collapse text-left text-sm">
            <thead className="bg-slate-100 text-slate-950">
              <tr>
                <th className="p-4 font-black">困っていること</th>
                <th className="p-4 font-black">最初に使うもの</th>
                <th className="p-4 font-black">選ぶ理由</th>
              </tr>
            </thead>
            <tbody>
              {section.rows.map((row) => (
                <tr
                  key={`${row.need}-${row.choose}`}
                  className="border-t border-slate-200 align-top"
                >
                  <td className="p-4 font-semibold text-slate-950">
                    {row.need}
                  </td>
                  <td className="p-4 text-blue-800">{row.choose}</td>
                  <td className="p-4 leading-6 text-slate-600">{row.why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  return (
    <section className="border-t border-slate-200 pt-10">
      <h2 className="text-2xl font-black tracking-tight text-slate-950">
        {section.title}
      </h2>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {section.items.map((item) => (
          <li
            key={item}
            className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-700"
          >
            <span aria-hidden="true" className="font-black text-emerald-600">
              ✓
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function GuidePage({ params }: PageProps) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) notFound();
  const tools = guide.toolSlugs.map(getToolBySlug);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    datePublished: guide.updatedAt,
    dateModified: guide.updatedAt,
    inLanguage: "ja",
    mainEntityOfPage: `${siteUrl}/guides/${guide.slug}`,
    author: {
      "@type": "Organization",
      name: "NOROPS",
      url: `${siteUrl}/about`,
    },
    publisher: { "@type": "Organization", name: "サクプラ", url: siteUrl },
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <nav className="text-sm text-slate-500" aria-label="パンくず">
          <Link href="/" className="hover:text-blue-700">
            トップ
          </Link>
          <span aria-hidden="true" className="mx-2">
            /
          </span>
          <Link href="/guides" className="hover:text-blue-700">
            実践ガイド
          </Link>
          <span aria-hidden="true" className="mx-2">
            /
          </span>
          <span aria-current="page">{guide.title}</span>
        </nav>

        <header className="mt-10">
          <p className="text-xs font-black tracking-[0.2em] text-blue-600">
            {guide.eyebrow}
          </p>
          <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl">
            {guide.title}
          </h1>
          <p className="mt-6 text-lg leading-9 text-slate-600">
            {guide.description}
          </p>
          <dl className="mt-8 grid gap-4 rounded-3xl bg-slate-100 p-6 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-black text-slate-950">対象</dt>
              <dd className="mt-2 leading-6 text-slate-600">
                {guide.audience}
              </dd>
            </div>
            <div>
              <dt className="font-black text-slate-950">
                このガイドで決めること
              </dt>
              <dd className="mt-2 leading-6 text-slate-600">
                {guide.decision}
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-slate-500">
            最終更新 {guide.updatedAt} ・ 読了目安 約{guide.readingMinutes}分
          </p>
        </header>

        <div className="mt-12 space-y-12">
          {guide.sections.map((section) => (
            <GuideContent
              key={`${section.kind}-${section.title}`}
              section={section}
            />
          ))}
        </div>

        <section className="mt-12 border-t border-slate-200 pt-10">
          <h2 className="text-2xl font-black text-slate-950">
            この業務のおすすめツール
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {tools.map((tool) => (
              <Link
                key={tool.slug}
                href={tool.href}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-300"
              >
                <h3 className="font-black text-slate-950">{tool.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {tool.description}
                </p>
                <span className="mt-4 inline-flex text-sm font-bold text-blue-700">
                  無料で使う →
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-12 border-t border-slate-200 pt-10">
          <h2 className="text-2xl font-black text-slate-950">
            確認した一次情報・仕様
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            内容は更新時点の公式情報を基準にしています。制度・仕様は変更されるため、重要な判断ではリンク先の最新版を確認してください。
          </p>
          <ul className="mt-6 space-y-4">
            {guide.sources.map((source) => (
              <li
                key={source.url}
                className="rounded-2xl border border-slate-200 bg-white p-5"
              >
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-black text-blue-800 underline-offset-4 hover:underline"
                >
                  {source.title}（{source.publisher}）
                </a>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {source.note}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </article>
    </main>
  );
}
