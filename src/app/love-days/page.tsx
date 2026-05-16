import { PublicShell } from "@/components/layout/public-shell";
import { ContentCard } from "@/components/public/content-card";
import { EmptyState } from "@/components/public/empty-state";
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
    >
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-4xl font-semibold text-ink">纪念日</h1>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {events.length ? (
            events.map((event) => (
              <ContentCard key={event.id} title={event.title} meta={formatDateLabel(event.date)}>
                <p>{event.description}</p>
                <p className="mt-3 text-2xl font-semibold text-blush-700">{event.counter.label}</p>
              </ContentCard>
            ))
          ) : (
            <EmptyState title="暂无纪念日" description="重要日期会展示在这里。" />
          )}
        </div>
      </section>
    </PublicShell>
  );
}
