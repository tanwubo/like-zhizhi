import Link from "next/link";

export type PublicNavItem = {
  key: string;
  label: string;
  href: string;
};

export function PublicNav({ items }: { items: PublicNavItem[] }) {
  return (
    <nav className="hidden items-center gap-5 text-sm text-ink/70 md:flex">
      {items.map((item) => (
        <Link key={item.key} href={item.href} className="transition hover:text-blush-700">
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
