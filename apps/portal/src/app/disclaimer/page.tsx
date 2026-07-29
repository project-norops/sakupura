import type { Metadata } from "next";
import { withSocialMetadata } from "@/lib/metadata";

export const metadata: Metadata = withSocialMetadata({
  title: "免責事項 | サクプラ",
  description:
    "サクプラが提供する計算結果や情報をご利用いただく際の免責事項です。",
});

export default function DisclaimerPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">
          Disclaimer
        </p>
        <h1 className="mt-3 text-3xl font-semibold">免責事項</h1>
        <div className="mt-8 space-y-8 text-slate-700 dark:text-slate-300">
          <section>
            <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-50">
              情報と計算結果
            </h2>
            <p className="mt-3 leading-8">
              当サイトの各ツールが表示する計算結果や情報は、入力内容と設定された計算式に基づく参考値です。正確性、完全性、最新性、特定目的への適合性を保証するものではありません。
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-50">
              利用者の判断
            </h2>
            <p className="mt-3 leading-8">
              契約、価格設定、税務、法務、投資その他の重要な判断では、必ず公式情報や資格を有する専門家の確認を受けてください。当サイトの情報だけを根拠に最終判断を行わないでください。
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-50">
              損害等への責任
            </h2>
            <p className="mt-3 leading-8">
              当サイトの利用または利用不能によって生じた損害、データ消失、機会損失、第三者との紛争について、運営者は法令上認められる範囲で責任を負いません。
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-50">
              サービスの変更
            </h2>
            <p className="mt-3 leading-8">
              事前の予告なく機能、計算式、表示内容の変更、提供の停止や終了を行うことがあります。利用者は必要な結果を自身でも保存・確認してください。
            </p>
          </section>
        </div>
        <p className="mt-10 text-sm text-slate-500">制定日：2026年7月25日</p>
      </article>
    </main>
  );
}
