export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-8 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 sm:px-6 lg:px-8">
        <p>
          本ツールの算出結果および提供情報によって生じた損害等について、当サイトは一切の責任を負いません。ご利用は自己責任でお願いいたします。
        </p>
        <nav
          aria-label="サイトポリシー"
          className="flex flex-wrap gap-x-5 gap-y-2"
        >
          <a
            className="underline-offset-4 hover:text-sky-600 hover:underline"
            href="https://www.norops.jp/privacy"
          >
            プライバシーポリシー
          </a>
          <a
            className="underline-offset-4 hover:text-sky-600 hover:underline"
            href="https://www.norops.jp/disclaimer"
          >
            免責事項
          </a>
          <a
            className="underline-offset-4 hover:text-sky-600 hover:underline"
            href="https://www.norops.jp/"
          >
            サクプラ トップ
          </a>
        </nav>
        <p>© 2026 NOROPS / サクプラ. All rights reserved.</p>
      </div>
    </footer>
  );
}
