import { PublicShell } from "@/components/layout/public-shell";
import { Card } from "@/components/ui/card";
import { getHomeData } from "@/features/home/home-data";
import { getPublicNavigation } from "@/features/public/navigation";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [data, navigation] = await Promise.all([getHomeData(), getPublicNavigation()]);

  return (
    <PublicShell title={data.site.title} footerText={data.site.footerText} modules={navigation}>
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-[1.2fr_0.8fr] md:py-20">
        <div>
          <p className="mb-3 text-sm font-medium text-blush-700">{data.site.slogan}</p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-ink md:text-6xl">
            {data.site.description}
          </h1>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Card>
              <p className="text-sm text-ink/55">相伴天数</p>
              <p className="mt-2 text-3xl font-semibold text-blush-700">{data.togetherDays}</p>
            </Card>
            <Card>
              <p className="text-sm text-ink/55">留言祝福</p>
              <p className="mt-2 text-3xl font-semibold text-blush-700">{data.messageCount}</p>
            </Card>
            <Card>
              <p className="text-sm text-ink/55">访问次数</p>
              <p className="mt-2 text-3xl font-semibold text-blush-700">{data.visits}</p>
            </Card>
          </div>
        </div>
        <Card className="self-start">
          <p className="text-sm text-ink/55">最新点滴</p>
          <h2 className="mt-3 text-2xl font-semibold text-ink">
            {data.latestNote?.title ?? "暂无点滴"}
          </h2>
          <p className="mt-3 text-sm leading-6 text-ink/65">
            {data.latestNote?.excerpt ?? "后台发布后会显示在这里。"}
          </p>
          <div className="mt-6 grid gap-3">
            {data.people.map((person) => (
              <div key={person.id} className="rounded-md bg-blush-50 p-4">
                <p className="font-medium text-ink">{person.displayName}</p>
                <p className="mt-1 text-sm text-ink/60">{person.bio}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </PublicShell>
  );
}
