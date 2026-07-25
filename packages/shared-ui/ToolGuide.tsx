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
    <section
      className="mx-auto max-w-5xl px-4 pb-12 sm:px-6 lg:px-8"
      aria-labelledby="tool-guide-title"
    >
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <h2
          id="tool-guide-title"
          className="text-2xl font-semibold text-slate-950 dark:text-slate-50"
        >
          {title}について
        </h2>
        <p className="mt-4 leading-8 text-slate-700 dark:text-slate-300">
          {content.summary}
        </p>

        <div className="mt-8">
          <h3 className="text-lg font-semibold">こんな方におすすめ</h3>
          <p className="mt-3 leading-7 text-slate-700 dark:text-slate-300">
            {content.audience}
          </p>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold">主な特徴</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {content.features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-950"
              >
                <h4 className="font-semibold text-sky-700 dark:text-sky-300">
                  {feature.title}
                </h4>
                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="text-lg font-semibold">使い方</h3>
            <ol className="mt-4 space-y-3 text-slate-700 dark:text-slate-300">
              {content.steps.map((step, index) => (
                <li key={step} className="flex gap-3 leading-7">
                  <span className="font-semibold text-sky-600">
                    {index + 1}.
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h3 className="text-lg font-semibold">利用上の注意</h3>
            <ul className="mt-4 list-disc space-y-3 pl-5 text-slate-700 dark:text-slate-300">
              {content.notes.map((note) => (
                <li key={note} className="leading-7">
                  {note}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold">よくある質問</h3>
          <div className="mt-4 space-y-3">
            {content.faq.map((item) => (
              <details
                key={item.question}
                className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700"
              >
                <summary className="cursor-pointer font-semibold">
                  {item.question}
                </summary>
                <p className="mt-3 leading-7 text-slate-700 dark:text-slate-300">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
