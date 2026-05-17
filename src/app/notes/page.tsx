import Link from "next/link";

import { PublicShell } from "@/components/layout/public-shell";
import { ContentCard } from "@/components/public/content-card";
import { EmptyState } from "@/components/public/empty-state";
import { PageHeader } from "@/components/public/page-header";
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
      theme={publicData.theme}
      variant="home"
    >
      <div className="min-h-[calc(100vh-60px)] bg-[#f5f5f7] text-[#1d1d1f]">
        <PageHeader eyebrow="Daily Notes" title="点滴" description="把日常里的小确幸收进时间线。" />
        <section className="mx-auto grid max-w-[1200px] gap-4 px-4 pb-12 md:grid-cols-2 md:px-6">
          {notes.length ? (
            notes.map((note) => (
              <Link key={note.id} href={`/notes/${note.slug}`} className="block">
                <ContentCard
                  title={note.title}
                  meta={note.publishedAt ? formatDateLabel(note.publishedAt) : "未标记日期"}
                  className="h-full"
                >
                  {note.excerpt}
                </ContentCard>
              </Link>
            ))
          ) : (
            <div className="md:col-span-2">
              <EmptyState title="暂无点滴" description="发布后的故事会展示在这里。" />
            </div>
          )}
        </section>
      </div>
    </PublicShell>
  );
}
