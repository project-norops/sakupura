import Link from "next/link";

export type ToolGuideContent = {
  summary: string;
  audience: string;
  features: Array<{ title: string; description: string }>;
  steps: string[];
  notes: string[];
  faq: Array<{ question: string; answer: string }>;
};

export type ToolGuideProps = {
  title: string;
  content: ToolGuideContent;
};

export function ToolGuide({ title, content }: ToolGuideProps) {
  return (
    <article
      className="mx-auto max-w-5xl px-4 pb-12 pt-8 sm:px-6 sm:pb-20 lg:px-8"
      aria-labelledby="tool-guide-title"
    >
      <div className="border-t border-slate-200 pt-12 sm:pt-16">
        <p className="text-xs font-black tracking-[0.2em] text-blue-600">
          GUIDE
        </p>
        <h2
          id="tool-guide-title"
          className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl"
        >
          {title}の使い方
        </h2>
        <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600">
          {content.summary}
        </p>
      </div>

      <section className="mt-12" aria-labelledby="features-title">
        <h3 id="features-title" className="text-xl font-bold text-slate-950">
          このツールでできること
        </h3>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {content.features.map((feature, index) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <span className="text-xs font-black text-blue-600">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h4 className="mt-3 font-bold text-slate-950">{feature.title}</h4>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-12 grid gap-10 md:grid-cols-2">
        <section aria-labelledby="steps-title">
          <h3 id="steps-title" className="text-xl font-bold text-slate-950">
            かんたん3ステップ
          </h3>
          <ol className="mt-5 space-y-5">
            {content.steps.map((step, index) => (
              <li
                key={step}
                className="flex gap-4 text-sm leading-7 text-slate-600"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>
        <section aria-labelledby="audience-title">
          <h3 id="audience-title" className="text-xl font-bold text-slate-950">
            こんな方におすすめ
          </h3>
          <p className="mt-5 rounded-2xl bg-blue-50 p-5 text-sm leading-7 text-slate-700">
            {content.audience}
          </p>
          <h3 className="mt-8 text-base font-bold text-slate-950">
            利用上の注意
          </h3>
          <ul className="mt-3 space-y-2 pl-5 text-sm leading-7 text-slate-600">
            {content.notes.map((note) => (
              <li key={note} className="list-disc">
                {note}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-14" aria-labelledby="faq-title">
        <h3 id="faq-title" className="text-2xl font-black text-slate-950">
          よくある質問
        </h3>
        <div className="mt-5 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white px-5 sm:px-6">
          {content.faq.map((item) => (
            <details key={item.question} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-slate-900">
                {item.question}
                <span
                  aria-hidden="true"
                  className="text-xl font-normal text-blue-600 transition group-open:rotate-45"
                >
                  ＋
                </span>
              </summary>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      <aside className="mt-14 flex flex-col items-start justify-between gap-5 rounded-3xl bg-slate-950 p-6 text-white sm:flex-row sm:items-center sm:p-8">
        <div>
          <p className="text-lg font-bold">ほかの無料ツールも見る</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            サクプラでは、仕事や発信の手間を減らすツールを追加しています。
          </p>
        </div>
        <Link
          href="/#tools"
          data-analytics-event="select_content"
          data-analytics-content-type="related_tools"
          data-analytics-item-id="tool_list"
          className="inline-flex shrink-0 rounded-full bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-blue-50"
        >
          ツール一覧へ →
        </Link>
      </aside>
    </article>
  );
}
