import { PublicShell } from "@/components/layout/public-shell";
import { ContentCard } from "@/components/public/content-card";
import { EmptyState } from "@/components/public/empty-state";
import { PageHeader } from "@/components/public/page-header";
import { getPublicSiteData } from "@/features/public/site-data";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const publicData = await getPublicSiteData();

  return (
    <PublicShell
      title={publicData.site.title}
      footerText={publicData.site.footerText}
      modules={publicData.navigation}
      theme={publicData.theme}
      variant="home"
    >
      <div className="min-h-[calc(100vh-60px)] bg-[#f5f5f7] text-[#1d1d1f]">
        <PageHeader eyebrow="About Us" title="关于" description="这里保存两个人的信息，也保存这个站点的出发点。" />
        <section className="mx-auto grid max-w-[1200px] gap-4 px-4 pb-12 md:grid-cols-2 md:px-6">
          {publicData.people.length ? (
            publicData.people.map((person) => (
              <ContentCard key={person.id} title={person.displayName} meta={person.location ?? "主页成员"}>
                {person.bio}
              </ContentCard>
            ))
          ) : (
            <div className="md:col-span-2">
              <EmptyState title="暂无成员资料" description="后台设置人物资料后会展示在这里。" />
            </div>
          )}
        </section>
      </div>
    </PublicShell>
  );
}
