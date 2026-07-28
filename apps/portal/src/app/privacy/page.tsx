import type { Metadata } from "next";
import { withSocialMetadata } from "@/lib/metadata";

export const metadata: Metadata = withSocialMetadata({
  title: "プライバシーポリシー | サクプラ",
  description:
    "サクプラにおけるアクセス情報、Cookie、Google Analytics、Google AdSense等の取り扱い方針です。",
});

const sections = [
  {
    title: "取得する情報",
    body: "当サイトは、アクセス日時、閲覧ページ、ブラウザや端末に関する情報、参照元などをアクセス解析のために取得する場合があります。各ツールへ入力した計算条件は、明示した場合を除きサーバーへ送信せず、ブラウザのLocalStorageやURL内に保存されることがあります。",
  },
  {
    title: "利用目的",
    body: "取得した情報は、利用状況の把握、機能や表示の改善、不具合の調査、不正利用の防止、広告配信とその効果測定のために利用します。",
  },
  {
    title: "Google Analytics",
    body: "当サイトはGoogle Analytics 4を利用しています。Google AnalyticsはCookie等を用いて利用状況を収集します。収集情報はGoogleのプライバシーポリシーおよび利用規約に基づいて管理されます。",
  },
  {
    title: "Google AdSenseとCookie",
    body: "当サイトではGoogleを含む第三者配信事業者がCookieを使用し、過去の当サイトや他サイトへのアクセス情報に基づいて広告を配信する場合があります。利用者はGoogleの広告設定からパーソナライズ広告を無効にできます。",
  },
  {
    title: "同意管理",
    body: "欧州経済領域、英国、スイスなど同意取得が必要な地域では、Google認定の同意管理プラットフォームを通じてCookieや広告目的のデータ利用について選択肢を表示します。",
  },
  {
    title: "方針の変更",
    body: "法令、サービス内容、利用する外部サービスの変更に応じて本方針を改定することがあります。重要な変更は当ページでお知らせします。",
  },
];

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">
          Policy
        </p>
        <h1 className="mt-3 text-3xl font-semibold">プライバシーポリシー</h1>
        <p className="mt-5 leading-8 text-slate-700 dark:text-slate-300">
          NOROPSが運営する「サクプラ」は、利用者の情報を以下の方針に基づいて取り扱います。
        </p>
        <div className="mt-8 space-y-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-semibold">{section.title}</h2>
              <p className="mt-3 leading-8 text-slate-700 dark:text-slate-300">
                {section.body}
              </p>
            </section>
          ))}
        </div>
        <section className="mt-8">
          <h2 className="text-xl font-semibold">外部サービスの案内</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700 dark:text-slate-300">
            <li>
              <a
                className="text-sky-700 underline dark:text-sky-300"
                href="https://policies.google.com/privacy"
              >
                Googleプライバシーポリシー
              </a>
            </li>
            <li>
              <a
                className="text-sky-700 underline dark:text-sky-300"
                href="https://adssettings.google.com/"
              >
                Google広告設定
              </a>
            </li>
            <li>
              <a
                className="text-sky-700 underline dark:text-sky-300"
                href="https://policies.google.com/technologies/partner-sites"
              >
                Googleサービスを利用するサイトでの情報利用
              </a>
            </li>
          </ul>
        </section>
        <p className="mt-10 text-sm text-slate-500">制定日：2026年7月25日</p>
      </article>
    </main>
  );
}
