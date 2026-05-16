import { PublicShell } from "@/components/layout/public-shell";
import { ContentCard } from "@/components/public/content-card";
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
    >
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-4xl font-semibold text-ink">关于</h1>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {publicData.people.map((person) => (
            <ContentCard key={person.id} title={person.displayName} meta={person.location ?? "主页成员"}>
              {person.bio}
            </ContentCard>
          ))}
        </div>
      </section>
    </PublicShell>
  );
}
