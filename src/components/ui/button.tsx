import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" && "bg-blush-500 text-white shadow-soft hover:bg-blush-700",
        variant === "secondary" && "border border-blush-100 bg-white text-ink hover:bg-blush-50",
        variant === "ghost" && "text-ink hover:bg-blush-50",
        className
      )}
      {...props}
    />
  );
}
