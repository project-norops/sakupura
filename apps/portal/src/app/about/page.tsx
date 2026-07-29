import type { Metadata } from "next";
import { withSocialMetadata } from "@/lib/metadata";

export const metadata: Metadata = withSocialMetadata({
  title: "運営者情報",
  description:
    "無料Webツールサイト「サクプラ」の運営者、提供目的、制作・検証方針、データの取り扱い、お問い合わせ先をご案内します。",
});

const overview = [
  ["サイト名", "サクプラ"],
  ["運営者", "NOROPS"],
] as const;

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">
          About
        </p>
        <h1 className="mt-3 text-3xl font-semibold">運営者情報</h1>
        <p className="mt-5 leading-8 text-slate-700 dark:text-slate-300">
          サクプラは、日々の面倒な作業を短時間で片づけるための、登録不要の無料Webツールサイトです。
        </p>

        <dl className="mt-8 divide-y divide-slate-200 rounded-2xl border border-slate-200 dark:divide-slate-700 dark:border-slate-700">
          {overview.map(([term, description]) => (
            <div
              className="grid gap-1 p-4 sm:grid-cols-[9rem_1fr] sm:gap-4"
              key={term}
            >
              <dt className="font-semibold text-slate-950 dark:text-slate-50">
                {term}
              </dt>
              <dd className="text-slate-700 dark:text-slate-300">
                {description}
              </dd>
            </div>
          ))}
          <div className="grid gap-1 p-4 sm:grid-cols-[9rem_1fr] sm:gap-4">
            <dt className="font-semibold text-slate-950 dark:text-slate-50">
              サイトURL
            </dt>
            <dd>
              <a
                className="break-all text-sky-700 underline dark:text-sky-300"
                href="https://www.norops.jp"
              >
                https://www.norops.jp
              </a>
            </dd>
          </div>
        </dl>

        <div className="mt-8 space-y-8">
          <section>
            <h2 className="text-xl font-semibold">提供目的</h2>
            <p className="mt-3 leading-8 text-slate-700 dark:text-slate-300">
              小さな事業や日々の仕事で発生する計算、確認、データ整理などを、専用ソフトの導入や会員登録なしですぐに進められる道具として提供します。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">制作・検証方針</h2>
            <p className="mt-3 leading-8 text-slate-700 dark:text-slate-300">
              各ツールは、用途と操作手順が初めての方にも伝わることを重視しています。公開前に自動テスト、画面表示、主要な操作、エラー時の案内を確認し、公開後も必要に応じて改善します。計算結果や診断結果は参考情報であり、重要な判断では公式情報や専門家の確認もあわせてご利用ください。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">データの取り扱い</h2>
            <p className="mt-3 leading-8 text-slate-700 dark:text-slate-300">
              ツールへ入力した文章、数値、ファイルなどは、各ページに別の案内がない限りブラウザ内で処理し、外部へ送信しません。サイトの改善や広告配信のため、Cookie等を利用して個人を直接特定しない利用状況を取得する場合があります。詳しくはプライバシーポリシーをご確認ください。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">お問い合わせ</h2>
            <p className="mt-3 leading-8 text-slate-700 dark:text-slate-300">
              ご意見や不具合のご報告は、サクプラ公式Xアカウント
              <a
                aria-label="サクプラ公式Xアカウント @sakupura_tools（新しいタブで開く）"
                className="mx-1 text-sky-700 underline dark:text-sky-300"
                href="https://x.com/sakupura_tools"
                rel="noopener noreferrer"
                target="_blank"
              >
                @sakupura_tools
              </a>
              からお知らせください。個別の返信や対応を保証する窓口ではありません。公開投稿には個人情報や機密情報を書かないでください。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">サイトポリシー</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700 dark:text-slate-300">
              <li>
                <a
                  className="text-sky-700 underline dark:text-sky-300"
                  href="/privacy"
                >
                  プライバシーポリシー
                </a>
              </li>
              <li>
                <a
                  className="text-sky-700 underline dark:text-sky-300"
                  href="/disclaimer"
                >
                  免責事項
                </a>
              </li>
            </ul>
          </section>
        </div>

        <p className="mt-10 text-sm text-slate-500">制定日：2026年7月28日</p>
      </article>
    </main>
  );
}
