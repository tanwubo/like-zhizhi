import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export function ContentCard({
  title,
  meta,
  children,
  className
}: {
  title: string;
  meta?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "rounded-xl border border-[#d2d2d7] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[rgba(0,122,255,0.2)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.06)]",
        className
      )}
    >
      {meta ? <p className="mb-2 font-mono text-xs font-semibold uppercase tracking-[0.04em] text-[#007aff]">{meta}</p> : null}
      <h2 className="text-xl font-bold text-[#1d1d1f]">{title}</h2>
      <div className="mt-3 text-sm leading-6 text-[#6e6e73]">{children}</div>
    </article>
  );
}
