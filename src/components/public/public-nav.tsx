import Link from "next/link";

import { cn } from "@/lib/cn";

export type PublicNavItem = {
  key: string;
  label: string;
  href: string;
};

export function PublicNav({ items, variant = "default" }: { items: PublicNavItem[]; variant?: "default" | "home" }) {
  return (
    <nav
      className={cn(
        "hidden items-center md:flex",
        variant === "home" ? "gap-1 text-[13px] text-[#6e6e73]" : "gap-5 text-sm text-ink/70"
      )}
    >
      {items.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          className={cn(
            "transition",
            variant === "home"
              ? "rounded-full px-3.5 py-1.5 hover:bg-[rgba(0,122,255,0.08)] hover:text-[#007aff]"
              : "hover:text-blush-700"
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
