import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { Heart } from "lucide-react";

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

type ShellPerson = {
  displayName: string;
  avatarUrl?: string | null;
  slot?: number;
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
  people = [],
  theme,
  variant = "default",
  children
}: {
  title: string;
  footerText?: string;
  modules: ModuleLink[];
  people?: ShellPerson[];
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
  const headerPeople = [
    people[0] ?? { displayName: "Ki", avatarUrl: "/images/avatar-person-2.svg", slot: 1 },
    people[1] ?? { displayName: "Really", avatarUrl: "/images/avatar-person-1.svg", slot: 2 }
  ];

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
              ? "sticky top-0 z-50 min-h-[70px] max-w-none gap-4 border-b border-[#ececf1] bg-white/95 px-5 py-3 shadow-[0_8px_22px_rgba(39,43,58,0.05)] backdrop-blur-xl md:h-[70px] md:px-10 md:py-0 lg:px-[88px]"
              : "max-w-6xl px-4 py-5"
          )}
        >
          {variant === "home" ? (
            <Link
              href="/"
              className="hidden min-w-[250px] items-center gap-4 text-[#273044] sm:flex"
              aria-label={`${headerPeople[0].displayName} and ${headerPeople[1].displayName}`}
            >
              <span className="font-romance text-[20px] italic leading-none">{headerPeople[0].displayName}</span>
              <span className="h-px w-7 bg-[#ff7a8c]" aria-hidden="true" />
              <Heart className="size-5 fill-[#ff5f6f] text-[#ff5f6f]" aria-hidden="true" />
              <span className="h-px w-7 bg-[#ff7a8c]" aria-hidden="true" />
              <span className="font-romance text-[20px] italic leading-none">{headerPeople[1].displayName}</span>
            </Link>
          ) : (
            <Link href="/" className="text-lg font-semibold text-ink">
              {title}
            </Link>
          )}
          <PublicNav
            variant={variant}
            items={modules.map((module) => ({
              ...module,
              href: module.href ?? hrefByKey[module.key] ?? "/"
            }))}
          />
          {variant === "home" ? (
            <div className="hidden min-w-[150px] justify-end sm:flex" aria-label="主页成员头像">
              <span className="flex rounded-full border border-[#eef0f4] bg-white px-2.5 py-1.5 shadow-[0_7px_18px_rgba(39,43,58,0.08)]">
                {headerPeople.map((person, index) => (
                  <span
                    key={`${person.displayName}-${index}`}
                    className={cn(
                      "relative grid size-9 overflow-hidden rounded-full border-2 border-white bg-[#f4f5f8]",
                      index > 0 ? "-ml-2" : ""
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={person.avatarUrl || (person.slot === 2 ? "/images/avatar-person-1.svg" : "/images/avatar-person-2.svg")}
                      alt={person.displayName}
                      className="h-full w-full object-cover"
                    />
                  </span>
                ))}
              </span>
            </div>
          ) : null}
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
