import apps, { type AppDefinition } from "@/data/apps";

function AppCardContent({ app }: { app: AppDefinition }) {
  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">
            {app.badge}
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-950 dark:text-slate-50">
            {app.title}
          </h2>
        </div>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-200">
          →
        </span>
      </div>
      <p className="mt-4 text-slate-600 dark:text-slate-400">
        {app.description}
      </p>
    </>
  );
}

export default function HomePage() {
  const isDevelopment = process.env.NODE_ENV === "development";

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">
              ポータルアクセス
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 dark:text-slate-50 sm:text-5xl">
              ⚡️ サクプラ by Norops
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
              さまざまな業務用ツールを一か所で管理するポータルサイトです。各ツールは標準ボイラープレートと共通UIで、一貫した構成とデザインを提供します。
            </p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-6 text-sm text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-200">
            <p className="font-semibold">
              {isDevelopment ? "ローカル開発" : "共通基盤"}
            </p>
            {isDevelopment ? (
              <>
                <p className="mt-3">ポータル: http://localhost:3000</p>
                <p>動的プライシング: http://localhost:3001</p>
              </>
            ) : null}
            <p className="mt-4">
              共通レイアウトと分析コンポーネントは{" "}
              <span className="font-medium">@sakupla/shared-ui</span>{" "}
              から提供されます。
            </p>
          </div>
        </div>

        <section className="mt-10 grid gap-6 md:grid-cols-2">
          {apps.map((app) => (
            <a
              key={app.id}
              href={app.href}
              className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-sky-300 hover:bg-sky-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-sky-500 dark:hover:bg-slate-950"
            >
              <AppCardContent app={app} />
            </a>
          ))}
        </section>
      </section>
    </main>
  );
}
