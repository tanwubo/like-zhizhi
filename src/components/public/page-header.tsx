export function PageHeader({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="mx-auto max-w-[1200px] px-4 pb-8 pt-10 text-center md:px-6">
      <p className="font-mono text-xs uppercase tracking-[0.08em] text-[#86868b]">{eyebrow}</p>
      <h1 className="mx-auto mt-2 max-w-3xl text-3xl font-bold leading-tight text-[#1d1d1f] md:text-4xl">
        {title}
      </h1>
      {description ? (
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#6e6e73]">{description}</p>
      ) : null}
    </header>
  );
}
