import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import { PublicNav } from "@/components/public/public-nav";
import { VisitTracker } from "@/components/public/visit-tracker";
import type { AdminThemeSetting } from "@/features/admin/settings-data";

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
  theme,
  children
}: {
  title: string;
  footerText?: string;
  modules: ModuleLink[];
  theme?: AdminThemeSetting;
  children: ReactNode;
}) {
  const shellStyle = {
    "--theme-primary": theme?.primaryColor ?? "#f45d7a",
    backgroundImage: theme?.backgroundImageUrl
      ? `linear-gradient(rgba(255, 246, 247, 0.78), rgba(255, 255, 255, 0.86)), url("${theme.backgroundImageUrl}")`
      : undefined
  } as CSSProperties;

  return (
    <div
      className={theme?.enablePageAnimation === false ? "public-theme min-h-screen" : "public-theme theme-page-animation min-h-screen"}
      style={shellStyle}
    >
      <VisitTracker />
      {theme?.backgroundVideoUrl ? (
        <video
          aria-hidden="true"
          autoPlay
          className="fixed inset-0 -z-10 h-full w-full object-cover opacity-20"
          loop
          muted
          playsInline
          src={theme.backgroundVideoUrl}
        >
          <track kind="captions" />
        </video>
      ) : null}
      <div className={theme?.enableGlassEffect === false ? "" : "theme-glass"}>
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
    </div>
  );
}
