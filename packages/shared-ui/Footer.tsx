export function Footer() {
  return (
    <footer className="mt-12 border-t border-slate-200 bg-white py-10 text-sm text-slate-500">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 md:grid-cols-[1fr_auto] lg:px-8">
        <div>
          <p className="font-bold text-slate-950">サクプラ</p>
          <p className="mt-2 max-w-xl leading-6">
            面倒な作業を、すぐに片づける。登録不要で使える実用ツールを提供しています。
          </p>
          <p className="mt-4 text-xs leading-5">
            算出結果および提供情報は参考値です。重要な判断では公式情報や専門家の確認もあわせてご利用ください。
          </p>
        </div>
        <nav
          aria-label="サイトポリシー"
          className="flex flex-wrap content-start gap-x-5 gap-y-3 md:justify-end"
        >
          <a
            className="underline-offset-4 hover:text-blue-600 hover:underline"
            href="/guides"
          >
            実践ガイド
          </a>
          <a
            className="underline-offset-4 hover:text-blue-600 hover:underline"
            href="/about"
          >
            運営者情報
          </a>
          <a
            className="underline-offset-4 hover:text-blue-600 hover:underline"
            href="/privacy"
          >
            プライバシーポリシー
          </a>
          <a
            className="underline-offset-4 hover:text-blue-600 hover:underline"
            href="/disclaimer"
          >
            免責事項
          </a>
          <a
            className="underline-offset-4 hover:text-blue-600 hover:underline"
            href="/"
          >
            サクプラ トップ
          </a>
          <a
            aria-label="ご意見・不具合報告（X・新しいタブで開く）"
            className="underline-offset-4 hover:text-blue-600 hover:underline"
            href="https://x.com/sakupura_tools"
            rel="noopener noreferrer"
            target="_blank"
          >
            ご意見・不具合報告（X）
          </a>
        </nav>
        <p className="text-xs leading-5 md:col-span-2">
          Xの公開投稿には個人情報・機密情報を書かないでください。
        </p>
        <p className="md:col-span-2">© 2026 NOROPS / サクプラ</p>
      </div>
    </footer>
  );
}
