export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="space-y-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">
              収益シミュレーター
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 dark:text-slate-50 sm:text-5xl">
              動的プライシング・収益シミュレーター
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
              目標手取り額、原価、決済手数料、販売数を入力して最適な販売単価を計算します。まずは基本的なダッシュボードで収益イメージを確認できます。
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">ステータス</p>
              <p className="mt-3 text-slate-700 dark:text-slate-200">開発中の初期バージョンです。データ入力フォームと計算ロジックを次のリリースで追加します。</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">動作確認</p>
              <p className="mt-3 text-slate-700 dark:text-slate-200">このアプリはポータルと同じ共有レイアウトを使用し、`@sakupla/shared-ui` の共通ヘッダー・フッター・分析コンポーネントを読み込みます。</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
