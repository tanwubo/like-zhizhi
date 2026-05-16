import { notFound } from "next/navigation";

import { PublicShell } from "@/components/layout/public-shell";
import { getPublishedNoteBySlug } from "@/features/public/public-content";
import { getPublicSiteData } from "@/features/public/site-data";
import { formatDateLabel } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function NoteDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [publicData, note] = await Promise.all([getPublicSiteData(), getPublishedNoteBySlug(slug)]);

  if (!note) {
    notFound();
  }

  return (
    <PublicShell
      title={publicData.site.title}
      footerText={publicData.site.footerText}
      modules={publicData.navigation}
      theme={publicData.theme}
    >
      <article className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-sm font-medium text-blush-700">
          {note.publishedAt ? formatDateLabel(note.publishedAt) : "点滴"}
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-ink">{note.title}</h1>
        <p className="mt-5 text-base leading-8 text-ink/70">{note.content}</p>
      </article>
    </PublicShell>
  );
}
