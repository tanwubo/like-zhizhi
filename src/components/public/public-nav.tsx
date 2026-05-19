"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Camera, Home, Info, ListChecks, MessageCircle, Route } from "lucide-react";

import { cn } from "@/lib/cn";

export type PublicNavItem = {
  key: string;
  label: string;
  href: string;
};

const homeNavOrder = ["notes", "messages", "footprints", "home", "album", "checklist", "about"];

const homeNavLabels: Record<string, string> = {
  home: "",
  notes: "点滴",
  messages: "留言",
  footprints: "轨迹",
  album: "相册",
  checklist: "清单",
  about: "关于"
};

const homeNavIcons = {
  home: Home,
  notes: BookOpen,
  messages: MessageCircle,
  footprints: Route,
  album: Camera,
  checklist: ListChecks,
  about: Info
};

export function PublicNav({ items, variant = "default" }: { items: PublicNavItem[]; variant?: "default" | "home" }) {
  const pathname = usePathname();
  const navItems =
    variant === "home"
      ? homeNavOrder.flatMap((key) => {
          const item = items.find((candidate) => candidate.key === key);
          if (!item && key !== "home") return [];
          return [
            {
              key,
              href: item?.href ?? "/",
              label: homeNavLabels[key]
            }
          ];
        })
      : items;

  return (
    <nav
      className={cn(
        "items-center",
        variant === "home"
          ? "flex min-w-0 flex-1 justify-center overflow-x-auto rounded-full bg-[#fafafa]/95 px-2 py-1 text-[13px] font-semibold text-[#414958] shadow-[0_8px_24px_rgba(40,44,63,0.06)] ring-1 ring-[#eff0f4] md:flex-none md:overflow-visible"
          : "hidden gap-5 text-sm text-ink/70 md:flex"
      )}
    >
      {navItems.map((item) => {
        const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));
        const Icon = variant === "home" ? homeNavIcons[item.key as keyof typeof homeNavIcons] : null;

        return (
          <Link
            key={item.key}
            href={item.href}
            className={cn(
              "transition",
              variant === "home"
                ? "flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-[#3f4650] hover:bg-white hover:text-[#ff6371]"
                : "hover:text-blush-700",
              variant === "home" && item.key === "home" ? "px-4" : "",
              variant === "home" && active ? "bg-[#ff6371] text-white shadow-[0_8px_18px_rgba(255,99,113,0.34)] hover:bg-[#ff6371] hover:text-white" : ""
            )}
            aria-current={active ? "page" : undefined}
          >
            {Icon ? <Icon className="size-3.5 stroke-[2.4]" aria-hidden="true" /> : null}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
