import Link from "next/link";

export type HeaderProps = {
  title?: string;
};

export function Header({ title }: HeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-white py-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div>
          <Link href="https://norops.jp" className="text-lg font-semibold text-slate-950 hover:text-sky-600 dark:text-slate-50">
            サクプラ by NOROPS
          </Link>
          {title ? (
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{title}</p>
          ) : null}
        </div>
      </div>
    </header>
  );
}
