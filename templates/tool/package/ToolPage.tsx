export function __COMPONENT_NAME__() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">
          {__BADGE_JSON__}
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50 sm:text-4xl">
          {__TITLE_JSON__}
        </h1>
        <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">
          {__DESCRIPTION_JSON__}
        </p>
        <div className="mt-8 rounded-2xl bg-slate-50 p-6 text-slate-700 dark:bg-slate-950 dark:text-slate-200">
          この領域にツール本体を実装してください。
        </div>
      </section>
    </main>
  );
}
