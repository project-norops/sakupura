import type { ReactNode } from "react";
import { Analytics } from "./Analytics";
import { DisclaimerModal } from "./DisclaimerModal";
import { Footer } from "./Footer";
import { Header } from "./Header";

export type AppLayoutProps = {
  children: ReactNode;
  title?: string;
};

export function AppLayout({ children, title }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <Analytics />
      <Header title={title} />
      <div>{children}</div>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <DisclaimerModal />
      </div>
      <Footer />
    </div>
  );
}
