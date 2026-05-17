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
      variant="home"
    >
      <div className="min-h-[calc(100vh-60px)] bg-[#f5f5f7] text-[#1d1d1f]">
        <article className="mx-auto max-w-3xl px-4 py-12 md:px-6">
          <div className="rounded-xl border border-[#d2d2d7] bg-white p-6 shadow-sm md:p-8">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.04em] text-[#007aff]">
              {note.publishedAt ? formatDateLabel(note.publishedAt) : "点滴"}
            </p>
            <h1 className="mt-3 text-3xl font-bold leading-tight text-[#1d1d1f] md:text-4xl">{note.title}</h1>
            <p className="mt-4 text-base leading-8 text-[#6e6e73]">{note.content}</p>
          </div>
        </article>
      </div>
    </PublicShell>
  );
}
