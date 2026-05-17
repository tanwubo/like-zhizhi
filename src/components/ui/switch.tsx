import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export function Switch({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      data-slot="switch"
      role="switch"
      type="checkbox"
      className={cn(
        "h-5 w-9 cursor-pointer appearance-none rounded-full bg-ink/20 transition checked:bg-blush-600 before:block before:h-5 before:w-5 before:rounded-full before:bg-white before:shadow before:transition checked:before:translate-x-4 disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    />
  );
}
