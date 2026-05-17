import { cloneElement, isValidElement, type ButtonHTMLAttributes, type ReactElement } from "react";
import { cn } from "@/lib/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: "primary" | "secondary" | "ghost" | "destructive" | "outline";
  size?: "sm" | "default" | "lg" | "icon";
};

export function Button({
  asChild = false,
  className,
  variant = "primary",
  size = "default",
  children,
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-60",
    variant === "primary" && "bg-blush-600 text-white shadow-soft hover:bg-blush-700 focus-visible:outline-blush-600",
    variant === "secondary" && "border border-blush-100 bg-white text-ink hover:bg-blush-50",
    variant === "ghost" && "text-ink hover:bg-blush-50",
    variant === "destructive" && "bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600",
    variant === "outline" && "border border-blush-100 bg-transparent text-ink hover:border-blush-300 hover:bg-blush-50",
    size === "sm" && "h-8 px-3 text-xs",
    size === "default" && "h-10 px-4 py-2",
    size === "lg" && "h-11 px-6",
    size === "icon" && "h-10 w-10",
    className
  );

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{ className?: string; "data-slot"?: string }>;

    return cloneElement(child, {
      ...props,
      "data-slot": "button",
      className: cn(classes, child.props.className)
    });
  }

  return (
    <button
      data-slot="button"
      className={classes}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}
