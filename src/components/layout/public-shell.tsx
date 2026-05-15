import Link from "next/link";
import type { ReactNode } from "react";

import { PublicNav } from "@/components/public/public-nav";

type ModuleLink = {
  key: string;
  label: string;
  href?: string;
};

const hrefByKey: Record<string, string> = {
  home: "/",
  notes: "/notes",
  messages: "/messages",
  footprints: "/footprints",
  album: "/album",
  checklist: "/checklist",
  "love-days": "/love-days",
  about: "/about"
};

export function PublicShell({
  title,
  footerText,
  modules,
  children
}: {
  title: string;
  footerText?: string;
  modules: ModuleLink[];
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <Link href="/" className="text-lg font-semibold text-ink">
          {title}
        </Link>
        <PublicNav
          items={modules.map((module) => ({
            ...module,
            href: module.href ?? hrefByKey[module.key] ?? "/"
          }))}
        />
      </header>
      <main>{children}</main>
      <footer className="mx-auto max-w-6xl px-4 py-10 text-center text-sm text-ink/50">
        {footerText ?? title}
      </footer>
    </div>
  );
}
