import type { ReactNode } from "react";
import { Analytics } from "./Analytics";
import { Footer } from "./Footer";
import { Header } from "./Header";

export type AppLayoutProps = {
  children: ReactNode;
  title?: string;
};

export function AppLayout({ children, title }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f7f9fc] text-slate-950">
      <Analytics />
      <Header title={title} />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
