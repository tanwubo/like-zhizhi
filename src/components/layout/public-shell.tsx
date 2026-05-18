import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import { PublicNav } from "@/components/public/public-nav";
import { VisitTracker } from "@/components/public/visit-tracker";
import { resolveThemeFontStacks } from "@/features/admin/font-options";
import type { AdminThemeSetting } from "@/features/admin/settings-data";
import { cn } from "@/lib/cn";

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
  variant = "default",
  children
}: {
  title: string;
  footerText?: string;
  modules: ModuleLink[];
  theme?: AdminThemeSetting;
  variant?: "default" | "home";
  children: ReactNode;
}) {
  const fontStacks = resolveThemeFontStacks(theme ?? {});
  const shellStyle = {
    "--theme-primary": theme?.primaryColor ?? "#f45d7a",
    "--font-body": fontStacks.body,
    "--font-display": fontStacks.display,
    "--font-romance": fontStacks.romance,
    "--font-number": fontStacks.number,
    backgroundImage: theme?.backgroundImageUrl
      ? `linear-gradient(rgba(255, 246, 247, 0.78), rgba(255, 255, 255, 0.86)), url("${theme.backgroundImageUrl}")`
      : undefined
  } as CSSProperties;

  return (
    <div
      className={cn(
        "public-theme min-h-screen",
        theme?.enablePageAnimation === false ? "" : "theme-page-animation",
        variant === "home" ? "home-public-shell" : ""
      )}
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
      <div className={theme?.enableGlassEffect === false || variant === "home" ? "" : "theme-glass"}>
        <header
          className={cn(
            "mx-auto flex items-center justify-between",
            variant === "home"
              ? "sticky top-0 z-50 h-[60px] max-w-none border-b border-[#d2d2d7]/80 bg-[#f5f5f7]/75 px-4 backdrop-blur-xl md:px-6"
              : "max-w-6xl px-4 py-5"
          )}
        >
          <Link
            href="/"
            className={cn(
              "font-semibold",
              variant === "home"
                ? "flex items-center gap-2 text-[17px] text-[#1d1d1f]"
                : "text-lg text-ink"
            )}
          >
            {variant === "home" ? (
              <span className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-[#007aff] to-[#5856d6] text-xs font-bold text-white">
                LZ
              </span>
            ) : null}
            <span>{title}</span>
          </Link>
          <PublicNav
            variant={variant}
            items={modules.map((module) => ({
              ...module,
              href: module.href ?? hrefByKey[module.key] ?? "/"
            }))}
          />
        </header>
        <main>{children}</main>
        <footer
          className={cn(
            "mx-auto px-4 py-10 text-center text-sm",
            variant === "home" ? "max-w-[1200px] text-[#86868b]" : "max-w-6xl text-ink/50"
          )}
        >
          {footerText ?? title}
        </footer>
      </div>
    </div>
  );
}
