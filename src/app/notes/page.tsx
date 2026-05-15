import Link from "next/link";

import { PublicShell } from "@/components/layout/public-shell";
import { ContentCard } from "@/components/public/content-card";
import { EmptyState } from "@/components/public/empty-state";
import { getPublishedNotes } from "@/features/public/public-content";
import { getPublicSiteData } from "@/features/public/site-data";
import { formatDateLabel } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function NotesPage() {
  const [publicData, notes] = await Promise.all([getPublicSiteData(), getPublishedNotes()]);

  return (
    <PublicShell
      title={publicData.site.title}
      footerText={publicData.site.footerText}
      modules={publicData.navigation}
    >
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-4xl font-semibold text-ink">点滴</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/60">把日常里的小确幸收进时间线。</p>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {notes.length ? (
            notes.map((note) => (
              <Link key={note.id} href={`/notes/${note.slug}`}>
                <ContentCard
                  title={note.title}
                  meta={note.publishedAt ? formatDateLabel(note.publishedAt) : "未标记日期"}
                >
                  {note.excerpt}
                </ContentCard>
              </Link>
            ))
          ) : (
            <EmptyState title="暂无点滴" description="发布后的故事会展示在这里。" />
          )}
        </div>
      </section>
    </PublicShell>
  );
}
