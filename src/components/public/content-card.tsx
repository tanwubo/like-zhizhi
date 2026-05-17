import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card
      role="article"
      className={cn(
        "rounded-xl border-[#ead4da] bg-white/92 shadow-[0_16px_40px_rgba(36,48,71,0.06)] backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-blush-200 hover:shadow-[0_18px_46px_rgba(36,48,71,0.1)]",
        className
      )}
    >
      <CardHeader>
        {meta ? <Badge variant="secondary" className="w-fit">{meta}</Badge> : null}
        <CardTitle className="text-xl font-bold text-[#1d1d1f]">{title}</CardTitle>
      </CardHeader>
      <CardContent className="mt-3 text-sm leading-6 text-[#6e6e73]">{children}</CardContent>
    </Card>
  );
}
