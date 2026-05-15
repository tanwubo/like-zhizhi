import type { ReactNode } from "react";

export function AdminSection({
  title,
  description,
  children
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-blush-100 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
        {description ? <p className="mt-1 text-sm leading-6 text-ink/60">{description}</p> : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}
