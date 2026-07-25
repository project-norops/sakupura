export function __COMPONENT_NAME__() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
          {__BADGE_JSON__}
        </p>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          {__TITLE_JSON__}
        </h1>
        <p className="mt-4 leading-7 text-slate-600">{__DESCRIPTION_JSON__}</p>
        <div className="mt-8 rounded-2xl bg-slate-50 p-6 text-slate-700">
          この領域にツール本体を実装してください。
        </div>
      </section>
    </main>
  );
}
