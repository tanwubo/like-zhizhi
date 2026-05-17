export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-dashed border-[#d2d2d7] bg-white px-6 py-12 text-center shadow-sm">
      <h2 className="text-lg font-bold text-[#1d1d1f]">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-[#6e6e73]">{description}</p>
    </div>
  );
}
