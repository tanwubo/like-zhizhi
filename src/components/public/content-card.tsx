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
    <article className={cn("rounded-lg border border-blush-100 bg-white/80 p-5 shadow-sm", className)}>
      {meta ? <p className="mb-2 text-xs font-medium text-blush-700">{meta}</p> : null}
      <h2 className="text-xl font-semibold text-ink">{title}</h2>
      <div className="mt-3 text-sm leading-6 text-ink/65">{children}</div>
    </article>
  );
}
