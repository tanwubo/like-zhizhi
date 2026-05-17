import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "secondary" | "outline" | "destructive";
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(
        "inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variant === "default" && "bg-blush-600 text-white",
        variant === "secondary" && "bg-blush-50 text-blush-700",
        variant === "outline" && "border border-blush-100 text-ink/70",
        variant === "destructive" && "bg-red-50 text-red-700",
        className
      )}
      {...props}
    />
  );
}
