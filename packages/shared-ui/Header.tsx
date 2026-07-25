import Image from "next/image";
import Link from "next/link";
import { BookmarkButton } from "./BookmarkButton";
import { ShareButton } from "./ShareButton";
import brandMark from "./assets/sakupura-mark.png";

export type HeaderProps = {
  title?: string;
};

export function Header({ title }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <Link
            href="/"
            className="group inline-flex items-center gap-2.5 font-bold tracking-tight text-slate-950"
          >
            <Image
              src={brandMark}
              alt=""
              aria-hidden="true"
              className="h-9 w-9 rounded-full ring-1 ring-slate-200 transition duration-200 group-hover:scale-105 group-hover:ring-blue-300"
            />
            <span>サクプラ</span>
            <span className="hidden text-xs font-medium text-slate-400 sm:inline">
              by NOROPS
            </span>
          </Link>
          {title ? (
            <p className="hidden truncate pl-[46px] text-xs text-slate-500 md:block">
              {title}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/#tools"
            data-analytics-event="select_content"
            data-analytics-content-type="navigation"
            data-analytics-item-id="header_tools"
            className="hidden rounded-full px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 sm:inline-flex"
          >
            無料ツール
          </Link>
          <ShareButton />
          <BookmarkButton />
        </div>
      </div>
    </header>
  );
}
