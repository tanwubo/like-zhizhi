import Link from "next/link";

import { PublicShell } from "@/components/layout/public-shell";
import { getHomeData } from "@/features/home/home-data";
import { getPublicNavigation } from "@/features/public/navigation";
import { formatDateLabel } from "@/lib/date";

export const dynamic = "force-dynamic";

function getInitials(name: string) {
  return name.trim().slice(0, 2).toUpperCase() || "LZ";
}

export default async function HomePage() {
  const [data, navigation] = await Promise.all([getHomeData(), getPublicNavigation()]);
  const people = data.people.slice(0, 2);
  const togetherDate = formatDateLabel(data.site.togetherDate);
  const statCards = [
    { label: "相伴天数", value: data.togetherDays, sub: `从 ${togetherDate} 开始`, tone: "blue" },
    { label: "留言祝福", value: data.messageCount, sub: "被认真收藏的心意", tone: "pink" },
    { label: "愿望清单", value: data.checklistCount, sub: "等待一起完成", tone: "green" },
    { label: "访问次数", value: data.visits, sub: "每次打开都算一次想念", tone: "gold" }
  ];

  return (
    <PublicShell
      title={data.site.title}
      footerText={data.site.footerText}
      modules={navigation}
      theme={data.theme}
      variant="home"
    >
      <div className="home-page min-h-[calc(100vh-60px)] bg-[#f5f5f7] text-[#1d1d1f]">
        <section className="mx-auto max-w-[1200px] px-4 pb-5 pt-10 text-center md:px-6">
          <p className="font-mono text-xs uppercase tracking-[0.08em] text-[#86868b]">Love Archive</p>
          <h1 className="mx-auto mt-2 max-w-3xl text-3xl font-bold leading-tight md:text-4xl">
            {data.site.description}
          </h1>
          <p className="mt-2 text-sm text-[#86868b]">{data.site.slogan}</p>
        </section>

        <section className="mx-auto max-w-[1200px] px-4 pb-8 md:px-6">
          <div className="relative overflow-hidden rounded-[20px] border border-[#d2d2d7] bg-white px-6 py-9 shadow-[0_4px_12px_rgba(0,0,0,0.04),0_12px_40px_rgba(0,0,0,0.08)] md:px-8">
            <div className="pointer-events-none absolute -right-16 -top-16 size-52 rounded-full bg-[radial-gradient(circle,rgba(0,122,255,0.08),transparent_70%)]" />
            <div className="pointer-events-none absolute -bottom-12 -left-12 size-44 rounded-full bg-[radial-gradient(circle,rgba(88,86,214,0.06),transparent_70%)]" />

            <div className="relative flex flex-col items-center justify-center gap-8 md:flex-row md:gap-16">
              {people[0] ? <PartnerCard person={people[0]} /> : <EmptyPartnerCard label="主角 A" />}

              <div className="flex flex-col items-center gap-3">
                <div className="grid size-14 place-items-center rounded-full border-2 border-[#d2d2d7] bg-[rgba(0,122,255,0.08)] text-2xl text-[#007aff] shadow-[0_4px_16px_rgba(0,122,255,0.12)]">
                  ♥
                </div>
                <p className="font-mono text-sm font-semibold text-[#007aff]">Day {data.togetherDays}</p>
              </div>

              {people[1] ? <PartnerCard person={people[1]} /> : <EmptyPartnerCard label="主角 B" />}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1200px] px-4 pb-8 md:px-6">
          <div className="relative overflow-hidden rounded-[20px] border border-[#d2d2d7] bg-gradient-to-br from-[#f5f5f7] to-[#e8e8ed] px-6 py-10 text-center md:px-8">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(0,122,255,0.06),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(88,86,214,0.05),transparent_45%)]" />
            <div className="relative">
              <p className="text-2xl font-bold md:text-3xl">我们已经相伴</p>
              <p className="mt-2 text-sm text-[#86868b]">每一天都被写进这个小小的纪念册</p>
              <div className="mt-7 flex items-end justify-center gap-3">
                <span className="font-mono text-5xl font-bold leading-none text-[#007aff] md:text-6xl">
                  {data.togetherDays}
                </span>
                <span className="pb-2 text-sm text-[#86868b]">天</span>
              </div>
              <p className="mt-4 text-xs text-[#86868b]">开始于 {togetherDate}</p>
              <Link
                href="/album"
                className="mt-6 inline-flex items-center rounded-full bg-gradient-to-br from-[#007aff] to-[#0056cc] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_2px_8px_rgba(0,122,255,0.2)] transition hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,122,255,0.3)]"
              >
                查看相册
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-[1200px] gap-3 px-4 pb-10 sm:grid-cols-2 lg:grid-cols-4 md:px-6">
          {statCards.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-[#d2d2d7] bg-white p-5 text-center transition hover:-translate-y-0.5 hover:border-[rgba(0,122,255,0.2)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.06)]"
            >
              <p className="text-xs text-[#86868b]">{item.label}</p>
              <p className={["mt-2 font-mono text-3xl font-bold leading-none", toneClass[item.tone]].join(" ")}>
                {item.value}
              </p>
              <p className="mt-2 text-xs text-[#86868b]">{item.sub}</p>
            </div>
          ))}
        </section>

        <section className="mx-auto grid max-w-[1200px] gap-4 px-4 pb-12 md:grid-cols-[1fr_0.85fr] md:px-6">
          <article className="rounded-xl border border-[#d2d2d7] bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.06)]">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.04em] text-[#007aff]">Latest Note</p>
            <h2 className="mt-3 text-xl font-bold">{data.latestNote?.title ?? "暂无点滴"}</h2>
            <p className="mt-3 text-sm leading-6 text-[#6e6e73]">
              {data.latestNote?.excerpt ?? "后台发布后会显示在这里。"}
            </p>
            <Link href="/notes" className="mt-5 inline-flex text-sm font-semibold text-[#007aff]">
              阅读更多
            </Link>
          </article>

          <div className="grid gap-3">
            {people.length > 0 ? (
              people.map((person) => (
                <div key={person.id} className="rounded-xl border border-[#d2d2d7] bg-white p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{person.displayName}</p>
                    {person.location ? <p className="text-xs text-[#86868b]">{person.location}</p> : null}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#6e6e73]">{person.bio || "还没有写下简介。"}</p>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-[#d2d2d7] bg-white p-5 text-sm text-[#86868b]">
                后台设置人物资料后会显示在这里。
              </div>
            )}
          </div>
        </section>
      </div>
    </PublicShell>
  );
}

const toneClass: Record<string, string> = {
  blue: "text-[#007aff]",
  pink: "text-[#ff2d55]",
  green: "text-[#34c759]",
  gold: "text-[#ff9f0a]"
};

type Partner = {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string;
  location: string | null;
};

function PartnerCard({ person }: { person: Partner }) {
  return (
    <div className="flex flex-col items-center gap-3">
      {person.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={person.avatarUrl}
          alt={person.displayName}
          className="size-24 rounded-full border-[6px] border-white object-cover shadow-[0_4px_16px_rgba(0,0,0,0.08)] md:size-28"
        />
      ) : (
        <div className="grid size-24 place-items-center rounded-full border-[6px] border-white bg-gradient-to-br from-[#e8f2ff] to-[#ffe9ef] font-semibold text-[#007aff] shadow-[0_4px_16px_rgba(0,0,0,0.08)] md:size-28">
          {getInitials(person.displayName)}
        </div>
      )}
      <div className="text-center">
        <p className="font-bold">{person.displayName}</p>
        <p className="mt-1 flex items-center justify-center gap-1 text-xs text-[#86868b]">
          <span className="size-1.5 rounded-full bg-[#34c759]" />
          {person.location ?? "在彼此心里"}
        </p>
      </div>
    </div>
  );
}

function EmptyPartnerCard({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="grid size-24 place-items-center rounded-full border-[6px] border-white bg-[#f5f5f7] text-sm font-semibold text-[#86868b] shadow-[0_4px_16px_rgba(0,0,0,0.08)] md:size-28">
        {label}
      </div>
      <p className="text-sm text-[#86868b]">等待补充资料</p>
    </div>
  );
}
