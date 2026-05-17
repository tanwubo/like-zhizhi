import { PublicShell } from "@/components/layout/public-shell";
import { ContentCard } from "@/components/public/content-card";
import { EmptyState } from "@/components/public/empty-state";
import { PageHeader } from "@/components/public/page-header";
import { getLoveDayEvents } from "@/features/public/public-content";
import { getPublicSiteData } from "@/features/public/site-data";
import { formatDateLabel } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function LoveDaysPage() {
  const [publicData, events] = await Promise.all([getPublicSiteData(), getLoveDayEvents()]);

  return (
    <PublicShell
      title={publicData.site.title}
      footerText={publicData.site.footerText}
      modules={publicData.navigation}
      theme={publicData.theme}
      variant="home"
    >
      <div className="min-h-[calc(100vh-60px)] bg-[#f5f5f7] text-[#1d1d1f]">
        <PageHeader eyebrow="Love Days" title="纪念日" description="重要日期会被认真保存，也会一直被提醒。" />
        <section className="mx-auto grid max-w-[1200px] gap-4 px-4 pb-12 md:grid-cols-2 md:px-6">
          {events.length ? (
            events.map((event) => (
              <ContentCard key={event.id} title={event.title} meta={formatDateLabel(event.date)}>
                <p>{event.description}</p>
                <p className="mt-4 font-mono text-3xl font-bold text-[#007aff]">{event.counter.label}</p>
              </ContentCard>
            ))
          ) : (
            <div className="md:col-span-2">
              <EmptyState title="暂无纪念日" description="重要日期会展示在这里。" />
            </div>
          )}
        </section>
      </div>
    </PublicShell>
  );
}
