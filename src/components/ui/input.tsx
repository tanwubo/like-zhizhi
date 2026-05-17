import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      data-slot="input"
      className={cn(
        "flex h-10 w-full rounded-md border border-blush-100 bg-white px-3 py-2 text-sm text-ink outline-none transition file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-ink/35 focus:border-blush-300 focus:ring-2 focus:ring-blush-100 disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    />
  );
}
