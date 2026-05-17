import { MediaType } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import Wave from "react-wavify";
import type { CSSProperties, ReactNode } from "react";

import { PublicShell } from "@/components/layout/public-shell";
import { HomeAnimations } from "@/components/public/home-animations";
import { HomeHeroCarousel } from "@/components/public/home-hero-carousel";
import { AvatarMotionFrame, HeartPulse } from "@/components/public/home-motion";
import { getHomeData } from "@/features/home/home-data";
import { buildHomeHeroSlides } from "@/features/home/hero-slides";
import { getPublicNavigation } from "@/features/public/navigation";
import { formatDateLabel } from "@/lib/date";

export const dynamic = "force-dynamic";

function fallbackAvatar(slot?: number) {
  return slot === 2 ? "/images/avatar-person-1.svg" : "/images/avatar-person-2.svg";
}

export default async function HomePage() {
  const [data, navigation] = await Promise.all([getHomeData(), getPublicNavigation()]);
  const people = data.people.slice(0, 2);
  const togetherDate = formatDateLabel(data.site.togetherDate);
  const heroSlides = buildHomeHeroSlides({
    carouselSlides: data.carouselSlides,
    backgroundImageUrl: data.theme.backgroundImageUrl,
    albumItems: data.albumPreview,
    limit: 4
  });

  const statCards = [
    { label: "相伴", value: data.togetherDays, suffix: "days", tone: "blue" },
    { label: "日常", value: data.latestNotes.length, suffix: "notes", tone: "slate" },
    { label: "留言", value: data.messageCount, suffix: "messages", tone: "pink" },
    { label: "清单", value: data.checklistCount, suffix: "wishes", tone: "gold" },
    { label: "相册", value: data.albumCount, suffix: "photos", tone: "cyan" },
    { label: "足迹", value: data.footprintCount, suffix: "places", tone: "dark" }
  ] as const;

  return (
    <PublicShell
      title={data.site.title}
      footerText={data.site.footerText}
      modules={navigation}
      theme={data.theme}
      variant="home"
    >
      <HomeAnimations />
      <div className="home-page min-h-[calc(100vh-60px)] bg-white text-[#243047]">
        <section className="relative isolate min-h-[676px] overflow-hidden bg-[#dcefd5]">
          <HomeHeroCarousel slides={heroSlides} />
          <div className="mx-auto flex min-h-[585px] max-w-[1180px] flex-col items-center justify-center px-4 pb-32 pt-20 md:px-6">
            <p className="rounded-full bg-white/45 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#557247] shadow-sm backdrop-blur-md">
              {data.site.title}
            </p>
            <div className="mt-10 grid w-full items-center gap-8 md:gap-[70px] md:grid-cols-[1fr_auto_1fr]">
              <div className="flex justify-center md:justify-end">
                {people[0] ? <HeroPerson person={people[0]} align="right" /> : <EmptyHeroPerson label="主角 A" slot={1} />}
              </div>
              <div className="home-heart flex flex-col items-center gap-3">
                <div className="rounded-full bg-white/75 px-4 py-2 text-xs font-semibold text-[#557247] shadow-[0_12px_34px_rgba(61,86,54,0.16)] backdrop-blur-md">
                  相伴 {data.togetherDays.toLocaleString("zh-CN")} 天
                </div>
                <HeartPulse />
                <p className="rounded-full bg-white/70 px-3 py-1 text-xs text-[#557247] backdrop-blur-md">From {togetherDate}</p>
              </div>
              <div className="flex justify-center md:justify-start">
                {people[1] ? <HeroPerson person={people[1]} align="left" /> : <EmptyHeroPerson label="主角 B" slot={2} />}
              </div>
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-[67px] overflow-hidden">
            <Wave
              fill="#fff"
              className="absolute inset-0 opacity-100"
              options={{
                speed: 0.2,
                amplitude: 50,
                points: 3
              }}
            />
            <Wave
              fill="#fff"
              className="absolute inset-0 opacity-50"
              options={{
                speed: 0.21,
                amplitude: 49,
                points: 4
              }}
            />
            <Wave
              fill="#fff"
              className="absolute inset-0 opacity-30"
              options={{
                speed: 0.19,
                amplitude: 51,
                points: 5
              }}
            />
          </div>
        </section>

        <section className="mx-auto max-w-[980px] px-4 pb-10 pt-10 text-center md:px-6">
          <div className="mx-auto mb-8 flex w-fit items-center gap-3 rounded-full bg-[#fff2f5] px-5 py-2 text-xs font-semibold text-[#ff5f86]">
            <span className="size-2 rounded-full bg-[#ff5f86]" />
            收好我们的日常
            <span className="size-2 rounded-full bg-[#ff5f86]" />
          </div>
          <div className="grid items-center overflow-hidden rounded-[18px] bg-white text-left shadow-[0_20px_60px_rgba(36,48,71,0.09)] md:grid-cols-[1.15fr_0.85fr]">
            <div className="p-8 md:p-10">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[#ff5f86]">Today</p>
              <h1 className="mt-4 text-3xl font-bold leading-tight text-[#243047] md:text-4xl">
                {data.site.description}
              </h1>
              <p className="mt-4 text-sm leading-7 text-[#7b8498]">{data.site.slogan}</p>
            </div>
            <div className="flex h-full min-h-[220px] flex-col items-center justify-center bg-[#f8f9fc] p-8 text-center">
              <p className="font-mono text-6xl font-bold leading-none text-[#243047] md:text-7xl">
                {data.togetherDays.toLocaleString("zh-CN")}
              </p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-[#ff5f86]">Days</p>
              <div className="mt-6 grid grid-cols-3 gap-4 text-center text-xs text-[#7b8498]">
                <MiniCounter value={data.latestNotes.length} label="notes" />
                <MiniCounter value={data.messageCount} label="messages" />
                <MiniCounter value={data.albumCount} label="photos" />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-[980px] gap-3 px-4 pb-12 sm:grid-cols-2 md:px-6 lg:grid-cols-3">
          {statCards.map((item, index) => (
            <Link
              key={item.label}
              href={statHref[item.label]}
              style={revealDelay(index)}
              className={[
                "home-reveal rounded-[14px] p-5 text-white shadow-[0_12px_32px_rgba(36,48,71,0.08)] transition hover:-translate-y-1",
                statToneClass[item.tone]
              ].join(" ")}
            >
              <p className="text-sm font-semibold opacity-85">{item.label}</p>
              <div className="mt-5 flex items-end justify-between">
                <p className="font-mono text-3xl font-bold leading-none">{item.value.toLocaleString("zh-CN")}</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] opacity-80">{item.suffix}</p>
              </div>
            </Link>
          ))}
        </section>

        <HomeSection eyebrow="记录" title="点滴" href="/notes">
          <div className="grid gap-4 md:grid-cols-2">
            {(data.latestNotes.length ? data.latestNotes : [data.latestNote]).filter(Boolean).map((note, index) => (
              <Link
                key={note!.id}
                href={`/notes/${note!.slug}`}
                style={revealDelay(index)}
                className={[
                  "home-reveal rounded-[14px] p-5 text-white shadow-[0_14px_34px_rgba(36,48,71,0.1)] transition hover:-translate-y-1",
                  index === 0 ? "bg-[#142037] md:col-span-2" : "bg-[#1f2d49]"
                ].join(" ")}
              >
                <p className="text-xs text-white/60">{note!.mood ?? note!.location ?? "日常"}</p>
                <h2 className="mt-4 text-lg font-bold">{note!.title}</h2>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/70">{note!.excerpt}</p>
              </Link>
            ))}
            {!data.latestNote ? <EmptyPreview text="还没有发布点滴。" /> : null}
          </div>
        </HomeSection>

        <HomeSection eyebrow="Love Day" title="纪念日" href="/love-days">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.loveDayPreview.length ? (
              data.loveDayPreview.map((event, index) => (
                <div
                  key={event.id}
                  style={revealDelay(index)}
                  className={["home-reveal rounded-[14px] p-4 text-white", loveToneClass[index % loveToneClass.length]].join(" ")}
                >
                  <p className="line-clamp-1 text-sm font-semibold">{event.title}</p>
                  <p className="mt-1 text-xs opacity-75">{formatDateLabel(event.date)}</p>
                  <p className="mt-4 font-mono text-2xl font-bold">{event.yearly ? "每年" : "珍藏"}</p>
                </div>
              ))
            ) : (
              <EmptyPreview text="还没有设置纪念日。" />
            )}
          </div>
        </HomeSection>

        <HomeSection eyebrow="足迹" title="去过的地方" href="/footprints">
          <div className="grid gap-4 md:grid-cols-2">
            {data.footprintPreview.length ? (
              data.footprintPreview.map((place, index) => (
                <div
                  key={place.id}
                  style={revealDelay(index)}
                  className="home-reveal rounded-[14px] bg-white p-5 shadow-[0_12px_32px_rgba(36,48,71,0.06)]"
                >
                  <p className="font-semibold text-[#243047]">{place.name}</p>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#8a93a7]">{place.description}</p>
                  {place.visits[0] ? <p className="mt-4 text-xs text-[#ff8aa4]">{place.visits[0].title}</p> : null}
                </div>
              ))
            ) : (
              <EmptyPreview text="还没有发布足迹。" />
            )}
          </div>
        </HomeSection>

        <HomeSection eyebrow="相册" title="照片墙" href="/album">
          <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
            {data.albumPreview.length ? (
              data.albumPreview.map((item, index) => (
                <Link
                  key={item.id}
                  href="/album"
                  style={revealDelay(index)}
                  className={[
                    "home-reveal group relative overflow-hidden rounded-[14px] bg-[#eef3f7] shadow-[0_14px_34px_rgba(36,48,71,0.1)]",
                    index === 0 ? "min-h-[300px]" : "min-h-[142px]"
                  ].join(" ")}
                >
                  {item.media.type === MediaType.VIDEO ? (
                    <video className="absolute inset-0 h-full w-full object-cover" muted playsInline preload="metadata" src={item.media.publicUrl}>
                      <track kind="captions" />
                    </video>
                  ) : (
                    <Image
                      alt={item.title}
                      className="object-cover transition duration-500 group-hover:scale-105"
                      fill
                      loading="lazy"
                      src={item.media.publicUrl}
                      unoptimized
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <p className="text-xs opacity-80">{item.location ?? "Photo"}</p>
                    <h2 className="mt-1 font-bold">{item.title}</h2>
                  </div>
                </Link>
              ))
            ) : (
              <EmptyPreview text="还没有发布相册。" />
            )}
          </div>
        </HomeSection>

        <HomeSection eyebrow="留言" title="大家的祝福" href="/messages">
          <div className="grid gap-4 md:grid-cols-3">
            {data.latestMessages.length ? (
              data.latestMessages.map((message, index) => (
                <div
                  key={message.id}
                  style={revealDelay(index)}
                  className="home-reveal rounded-[14px] bg-white p-5 text-center shadow-[0_12px_32px_rgba(36,48,71,0.06)]"
                >
                  <p className="font-semibold text-[#243047]">{message.nickname}</p>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#8a93a7]">{message.content}</p>
                  <p className="mt-4 text-xs text-[#b4bac8]">{message.location ?? formatDateLabel(message.createdAt)}</p>
                </div>
              ))
            ) : (
              <EmptyPreview text="还没有收到留言。" />
            )}
          </div>
        </HomeSection>

        <section className="mx-auto max-w-[980px] px-4 py-16 text-center md:px-6">
          <p className="text-lg text-[#9aa2b3]">我们在不同的风景里，确认着同一种心意。</p>
          <p className="mt-4 text-sm text-[#b4bac8]">{data.site.footerText}</p>
        </section>
      </div>
    </PublicShell>
  );
}

const statHref = {
  相伴: "/love-days",
  日常: "/notes",
  留言: "/messages",
  清单: "/checklist",
  相册: "/album",
  足迹: "/footprints"
};

const statToneClass = {
  blue: "bg-[#6fd8f4]",
  slate: "bg-[#b5aea7]",
  pink: "bg-[#ff5f93]",
  gold: "bg-[#ffbd48]",
  cyan: "bg-[#41dfe2]",
  dark: "bg-[#121927]"
};

const loveToneClass = ["bg-[#6fe4e8]", "bg-[#ffd84d]", "bg-[#ffbd48]", "bg-[#69d8f2]"];

function revealDelay(index: number) {
  return { "--reveal-delay": `${index * 90}ms` } as CSSProperties;
}

type Partner = {
  id: string;
  slot: number;
  displayName: string;
  avatarUrl: string | null;
  location: string | null;
};

function HeroPerson({ person, align }: { person: Partner; align: "left" | "right" }) {
  const avatarSrc = person.avatarUrl || fallbackAvatar(person.slot);

  return (
    <div className={["home-hero-person flex flex-col items-center", align === "left" ? "from-right" : "from-left"].join(" ")}>
      <AvatarMotionFrame>
        <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,#ff9a9e,#fad0c4,#fad0c4,#ff9a9e)] opacity-75 blur-[2px]" />
        <div className="absolute inset-[4px] rounded-full bg-white/80" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={avatarSrc} alt={person.displayName} className="absolute inset-[8px] z-10 size-[calc(100%-16px)] rounded-full object-cover" />
        <span className="pointer-events-none absolute inset-[8px] z-20 rounded-full bg-[linear-gradient(135deg,rgba(255,255,255,0.36),transparent_48%,rgba(255,255,255,0.18))]" />
      </AvatarMotionFrame>
      <div className="mt-3 rounded-full border border-white/55 bg-white/24 px-5 py-1.5 text-sm font-bold text-white shadow-[0_14px_34px_rgba(61,86,54,0.2),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl">
        {person.displayName}
      </div>
      <p className={["mt-2 max-w-40 text-center text-xs text-white/85 drop-shadow", align === "left" ? "md:text-left" : "md:text-right"].join(" ")}>
        {person.location ?? "在彼此心里"}
      </p>
    </div>
  );
}

function EmptyHeroPerson({ label, slot }: { label: string; slot: number }) {
  return (
    <div className="home-hero-person from-left flex flex-col items-center">
      <div className="relative grid size-32 place-items-center rounded-full border-[8px] border-white/80 bg-white/75 shadow-[0_18px_50px_rgba(61,86,54,0.18)] backdrop-blur-sm md:size-40">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={fallbackAvatar(slot)} alt={label} className="size-full rounded-full object-cover" />
        <span className="pointer-events-none absolute inset-0 rounded-full bg-[linear-gradient(135deg,rgba(255,255,255,0.36),transparent_48%,rgba(255,255,255,0.18))]" />
      </div>
      <div className="mt-3 rounded-full bg-[#6e8a4d]/85 px-5 py-1.5 text-sm font-bold text-white">等待补充</div>
    </div>
  );
}

function MiniCounter({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <p className="font-mono text-lg font-bold text-[#243047]">{value.toLocaleString("zh-CN")}</p>
      <p className="mt-1 uppercase tracking-[0.12em]">{label}</p>
    </div>
  );
}

function HomeSection({
  eyebrow,
  title,
  href,
  children
}: {
  eyebrow: string;
  title: string;
  href: string;
  children: ReactNode;
}) {
  return (
    <section className="home-reveal mx-auto max-w-[980px] px-4 pb-14 md:px-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid size-6 place-items-center rounded-full bg-[#ffeff3] text-xs font-bold text-[#ff5f86]">+</span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#ff8aa4]">{eyebrow}</p>
            <h2 className="mt-1 text-xl font-bold text-[#243047]">{title}</h2>
          </div>
        </div>
        <Link href={href} className="grid size-7 place-items-center rounded-full bg-[#fff0f4] text-sm font-bold text-[#ff5f86]" aria-label={`查看${title}`}>
          →
        </Link>
      </div>
      {children}
    </section>
  );
}

function EmptyPreview({ text }: { text: string }) {
  return (
    <div className="home-reveal rounded-[14px] border border-dashed border-[#e5e8ef] bg-white p-6 text-sm text-[#9aa2b3]">
      {text}
    </div>
  );
}
