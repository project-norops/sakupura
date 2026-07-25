import type { ReactNode } from "react";
import { Analytics } from "./Analytics";
import { BookmarkButton } from "./BookmarkButton";
import { Footer } from "./Footer";
import { Header } from "./Header";

export type AppLayoutProps = {
  children: ReactNode;
  title?: string;
};

export function AppLayout({ children, title }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <Analytics />
      <Header title={title} />
      <div className="flex-1">{children}</div>
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <BookmarkButton />
      </div>
      <Footer />
    </div>
  );
}
