import { MediaType } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import Wave from "react-wavify";
import type { ReactNode } from "react";
import {
  BookOpen,
  Check,
  ChevronRight,
  Film,
  Gift,
  Heart,
  ImageIcon,
  MessageCircle,
  MoreHorizontal,
  Plane
} from "lucide-react";

import { PublicShell } from "@/components/layout/public-shell";
import { FloatingMusicPlayer } from "@/components/public/floating-music-player";
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
            <div className="grid w-full items-center gap-8 md:gap-[70px] md:grid-cols-[1fr_auto_1fr]">
              <div className="flex justify-center md:justify-end">
                {people[0] ? (
                  <HeroPerson person={people[0]} align="right" />
                ) : (
                  <EmptyHeroPerson label="主角 A" slot={1} />
                )}
              </div>
              <div className="home-heart grid place-items-center">
                <HeartPulse />
              </div>
              <div className="flex justify-center md:justify-start">
                {people[1] ? (
                  <HeroPerson person={people[1]} align="left" />
                ) : (
                  <EmptyHeroPerson label="主角 B" slot={2} />
                )}
              </div>
            </div>
          </div>
          <div className="absolute inset-x-0 -bottom-px h-[68px] overflow-hidden">
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
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-4 bg-white" />
          </div>
        </section>

        <section className="mx-auto max-w-[1280px] px-4 pb-10 pt-12 md:px-6">
          <AnniversaryPanel
            description={data.site.description}
            sinceLabel={togetherDate}
            slogan={data.site.slogan}
            togetherDays={data.togetherDays}
          />
        </section>

        <section className="mx-auto grid max-w-[1280px] gap-5 px-4 pb-11 md:grid-cols-2 md:px-6 xl:grid-cols-3">
          <AlbumPreviewCard albumCount={data.albumCount} items={data.albumPreview} />
          <ChecklistPreviewCard items={data.checklistPreview} />
          <MessagePreviewCard messages={data.latestMessages} />
          <DailyPreviewCard notes={data.latestNotes} />
          <LoveDayPreviewCard events={data.loveDayPreview} />
          <MorePreviewCard />
        </section>

        <section className="mx-auto max-w-[1280px] px-4 pb-16 md:px-6">
          <div className="relative overflow-hidden rounded-[16px] bg-[linear-gradient(135deg,#fff2f5_0%,#fffafa_48%,#fff0f3_100%)] px-6 py-11 text-center shadow-[0_18px_50px_rgba(36,48,71,0.06)] md:px-14">
            <span className="absolute left-[18%] top-6 font-serif text-7xl leading-none text-[#ffd2dc]">
              “
            </span>
            <p className="font-romance relative mx-auto max-w-[760px] text-2xl font-light leading-[1.95] tracking-[0.16em] text-[#30323b] md:text-[34px]">
              {data.site.slogan || "你是我平淡生活里，最闪闪发光的那部分。"}
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <span className="size-2 rounded-full bg-[#d9d9df]" />
              <span className="size-2 rounded-full bg-[#ff7f9a]" />
              <span className="size-2 rounded-full bg-[#d9d9df]" />
            </div>
          </div>
        </section>
        {data.musicTracks.length ? <FloatingMusicPlayer tracks={data.musicTracks} /> : null}
      </div>
    </PublicShell>
  );
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
    <div
      className={[
        "home-hero-person flex flex-col items-center",
        align === "left" ? "from-right" : "from-left"
      ].join(" ")}
    >
      <AvatarMotionFrame>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatarSrc}
          alt={person.displayName}
          className="absolute inset-[3px] z-10 size-[calc(100%-6px)] rounded-full object-cover"
        />
        <span className="pointer-events-none absolute inset-[3px] z-20 rounded-full bg-[linear-gradient(135deg,rgba(255,255,255,0.22),transparent_46%,rgba(255,255,255,0.12))]" />
      </AvatarMotionFrame>
      <div className="mt-3 rounded-full border border-white/55 bg-white/24 px-5 py-1.5 text-sm font-bold text-white shadow-[0_14px_34px_rgba(61,86,54,0.2),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl">
        {person.displayName}
      </div>
      <p
        className={[
          "mt-2 max-w-40 text-center text-xs text-white/85 drop-shadow",
          align === "left" ? "md:text-left" : "md:text-right"
        ].join(" ")}
      >
        {person.location ?? "在彼此心里"}
      </p>
    </div>
  );
}

function EmptyHeroPerson({ label, slot }: { label: string; slot: number }) {
  return (
    <div className="home-hero-person from-left flex flex-col items-center">
      <div className="relative grid size-28 place-items-center overflow-hidden rounded-full border-2 border-white/90 bg-white/20 shadow-[0_5px_14px_rgba(80,63,72,0.16),0_0_0_1px_rgba(255,255,255,0.35)] md:size-32">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={fallbackAvatar(slot)}
          alt={label}
          className="absolute inset-[3px] size-[calc(100%-6px)] rounded-full object-cover"
        />
        <span className="pointer-events-none absolute inset-[3px] rounded-full bg-[linear-gradient(135deg,rgba(255,255,255,0.22),transparent_46%,rgba(255,255,255,0.12))]" />
      </div>
      <div className="mt-3 rounded-full bg-[#6e8a4d]/85 px-5 py-1.5 text-sm font-bold text-white">
        等待补充
      </div>
    </div>
  );
}

type HomeData = Awaited<ReturnType<typeof getHomeData>>;
type AlbumPreview = HomeData["albumPreview"];
type ChecklistPreview = HomeData["checklistPreview"];
type MessagePreview = HomeData["latestMessages"];
type NotePreview = HomeData["latestNotes"];
type LoveDayPreview = HomeData["loveDayPreview"];

function AnniversaryPanel({
  description,
  sinceLabel,
  slogan,
  togetherDays
}: {
  description: string;
  sinceLabel: string;
  slogan: string;
  togetherDays: number;
}) {
  const now = new Date();
  const timeParts = [
    { value: now.getHours(), label: "时" },
    { value: now.getMinutes(), label: "分" },
    { value: now.getSeconds(), label: "秒" }
  ];
  const poemLines = buildPoemLines(description, slogan);

  return (
    <div className="grid overflow-hidden rounded-[22px] border border-[#f1edf0] bg-white px-7 py-8 shadow-[0_18px_54px_rgba(36,48,71,0.08)] md:grid-cols-[1fr_1.15fr] md:px-12 md:py-11">
      <div className="flex flex-col">
        <h2 className="font-display text-2xl font-bold text-[#2c2f37]">纪念日</h2>
        <span className="font-display mt-8 text-5xl leading-none text-[#ffb6c4]">“</span>
        <div className="font-romance mt-2 space-y-3 text-lg leading-9 tracking-[0.12em] text-[#343740] md:text-xl">
          {poemLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        <div className="mt-8 flex gap-3">
          <span className="size-2 rounded-full bg-[#ff7f9a]" />
          <span className="size-2 rounded-full bg-[#dadce3]" />
          <span className="size-2 rounded-full bg-[#dadce3]" />
        </div>
      </div>

      <div className="mt-8 grid border-[#ececf2] md:mt-0 md:border-l md:pl-14">
        <div className="flex flex-col gap-6 self-center">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <div className="min-w-[180px]">
              <p className="flex items-center gap-2 text-lg font-medium text-[#4c505b]">
                <Heart className="size-5 fill-[#ff7f9a] text-[#ff7f9a]" />
                我们在一起
              </p>
              <p className="font-number mt-4 text-2xl tracking-[0.04em] text-[#4b4e58]">{sinceLabel}</p>
            </div>
            <div className="flex items-end gap-3">
              <p className="font-number text-6xl font-light leading-none text-[#30323b] md:text-7xl">
                {togetherDays.toLocaleString("zh-CN")}
              </p>
              <span className="pb-2 text-lg text-[#50535d]">天</span>
            </div>
          </div>
          <div className="grid max-w-[420px] grid-cols-3 gap-5">
            {timeParts.map((item) => (
              <div key={item.label} className="rounded-[12px] bg-[#fff4f6] px-5 py-4 text-center">
                <p className="font-number text-4xl font-light text-[#30323b]">
                  {String(item.value).padStart(2, "0")}
                </p>
                <p className="mt-2 text-sm text-[#50535d]">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AlbumPreviewCard({ albumCount, items }: { albumCount: number; items: AlbumPreview }) {
  const previewItems = items.slice(0, 4);
  const placeholders = Math.max(0, 4 - previewItems.length);

  return (
    <HomePreviewCard href="/album" title="我们的相册">
      <div className="grid aspect-[1.72] grid-cols-5 grid-rows-4 gap-1 bg-white">
        {previewItems.map((item, index) => (
          <div
            key={item.id}
            className={[
              "relative min-h-0 overflow-hidden rounded-[8px] bg-[#f6edf0]",
              albumTileClass[index]
            ].join(" ")}
          >
            {item.media.type === MediaType.VIDEO ? (
              <video
                className="absolute inset-0 h-full w-full object-cover"
                muted
                playsInline
                preload="metadata"
                src={item.media.publicUrl}
              >
                <track kind="captions" />
              </video>
            ) : (
              <Image
                alt={item.title}
                className="object-cover"
                fill
                loading="lazy"
                src={item.media.publicUrl}
                unoptimized
              />
            )}
          </div>
        ))}
        {Array.from({ length: placeholders }).map((_, index) => (
          <div
            key={`album-placeholder-${index}`}
            className={[
              "grid place-items-center rounded-[8px] bg-[#fff2f5] text-[#ff9aae]",
              albumTileClass[previewItems.length + index]
            ].join(" ")}
          >
            <ImageIcon className="size-5" />
          </div>
        ))}
      </div>
      <p className="mt-5 text-sm text-[#6f7480]">
        共{" "}
        <span className="font-semibold text-[#ff6f8f]">{albumCount.toLocaleString("zh-CN")}</span>{" "}
        张照片
      </p>
    </HomePreviewCard>
  );
}

const albumTileClass = [
  "col-span-3 row-span-2",
  "col-span-2 row-span-2",
  "col-span-2 row-span-2",
  "col-span-3 row-span-2"
];

function ChecklistPreviewCard({ items }: { items: ChecklistPreview }) {
  const sortedItems = [...items]
    .sort((a, b) => Number(b.completed) - Number(a.completed))
    .slice(0, 4);
  const doneCount = items.filter((item) => item.completed).length;

  return (
    <HomePreviewCard href="/checklist" title="待办清单">
      <div className="space-y-4">
        {sortedItems.length ? (
          sortedItems.map((item) => (
            <div key={item.id} className="flex items-center gap-4 text-sm text-[#595d68]">
              <span
                className={[
                  "grid size-5 place-items-center rounded-full border",
                  item.completed
                    ? "border-[#ff7f9a] bg-[#ff7f9a] text-white"
                    : "border-[#aeb3bf] text-transparent"
                ].join(" ")}
              >
                <Check className="size-3.5" />
              </span>
              <span className="line-clamp-1">{item.title}</span>
            </div>
          ))
        ) : (
          <EmptyCardLine text="还没有公开清单。" />
        )}
      </div>
      <p className="mt-8 text-sm text-[#6f7480]">
        <span className="font-semibold text-[#ff6f8f]">{doneCount}</span> / {items.length} 完成
      </p>
    </HomePreviewCard>
  );
}

function MessagePreviewCard({ messages }: { messages: MessagePreview }) {
  return (
    <HomePreviewCard href="/messages" title="悄悄话">
      <div className="space-y-4">
        {messages.slice(0, 2).map((message) => (
          <div key={message.id} className="rounded-[10px] bg-[#fff7f8] px-5 py-4">
            <p className="line-clamp-2 text-sm leading-6 text-[#595d68]">{message.content}</p>
            <p className="mt-3 text-right text-xs text-[#a7abb6]">
              {formatMonthDay(message.createdAt)}
            </p>
          </div>
        ))}
        {!messages.length ? <EmptyCardLine text="还没有收到留言。" /> : null}
      </div>
    </HomePreviewCard>
  );
}

function DailyPreviewCard({ notes }: { notes: NotePreview }) {
  return (
    <HomePreviewCard href="/notes" title="日常记录">
      <div className="space-y-5">
        {notes.slice(0, 3).map((note) => (
          <Link
            key={note.id}
            href={`/notes/${note.slug}`}
            className="grid grid-cols-[68px_1fr] gap-5 text-sm"
          >
            <span className="font-number text-[#ff6f8f]">
              {formatMonthDay(note.publishedAt ?? new Date())}
            </span>
            <span className="line-clamp-1 text-[#555965]">{note.title}</span>
          </Link>
        ))}
        {!notes.length ? <EmptyCardLine text="还没有发布日常。" /> : null}
      </div>
      <p className="mt-8 text-sm text-[#5f6470]">记录我们的小日常 〉</p>
    </HomePreviewCard>
  );
}

function LoveDayPreviewCard({ events }: { events: LoveDayPreview }) {
  const icons = [Gift, Heart, Film];

  return (
    <HomePreviewCard href="/love-days" title="其他纪念日">
      <div className="space-y-6">
        {events.slice(0, 3).map((event, index) => {
          const Icon = icons[index % icons.length];

          return (
            <div key={event.id} className="grid grid-cols-[24px_1fr_auto] items-center gap-4">
              <span className="grid size-6 place-items-center rounded-full bg-[#ffedf2] text-[#ff7f9a]">
                <Icon className="size-4 fill-current" />
              </span>
              <div>
                <p className="line-clamp-1 text-sm text-[#555965]">{event.title}</p>
                <p className="mt-1 text-xs text-[#8d93a0]">{formatDateLabel(event.date)}</p>
              </div>
              <p className="text-xs text-[#6f7480]">{formatEventDelta(event.date)}</p>
            </div>
          );
        })}
        {!events.length ? <EmptyCardLine text="还没有设置纪念日。" /> : null}
      </div>
      <p className="mt-6 text-sm text-[#5f6470]">全部纪念日 〉</p>
    </HomePreviewCard>
  );
}

function MorePreviewCard() {
  const entries = [
    { label: "愿望清单", href: "/checklist", icon: Heart },
    { label: "一起打卡", href: "/footprints", icon: Plane },
    { label: "恋爱笔记", href: "/notes", icon: BookOpen },
    { label: "情侣问答", href: "/messages", icon: MessageCircle }
  ];

  return (
    <HomePreviewCard href="/about" title="更多">
      <div className="grid grid-cols-2 gap-x-8 gap-y-7 px-4 pt-1">
        {entries.map((entry) => {
          const Icon = entry.icon;

          return (
            <Link
              key={entry.label}
              href={entry.href}
              className="grid justify-items-center gap-3 text-center text-sm text-[#626773]"
            >
              <span className="grid size-14 place-items-center rounded-full bg-[#fff2f5] text-[#ff7f9a]">
                <Icon className="size-5" />
              </span>
              {entry.label}
            </Link>
          );
        })}
      </div>
      <div className="mt-6 grid place-items-center text-[#4d515c]">
        <MoreHorizontal className="size-6" />
      </div>
    </HomePreviewCard>
  );
}

function HomePreviewCard({
  children,
  href,
  title
}: {
  children: ReactNode;
  href: string;
  title: string;
}) {
  return (
    <article className="min-h-[320px] rounded-[16px] border border-[#f0edf0] bg-white p-7 shadow-[0_14px_42px_rgba(36,48,71,0.07)]">
      <div className="mb-7 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-[#30323b]">{title}</h2>
        <Link
          href={href}
          aria-label={`查看${title}`}
          className="grid size-7 place-items-center rounded-full text-[#3a3d46] transition hover:bg-[#fff2f5] hover:text-[#ff6f8f]"
        >
          <ChevronRight className="size-5" />
        </Link>
      </div>
      {children}
    </article>
  );
}

function EmptyCardLine({ text }: { text: string }) {
  return (
    <div className="rounded-[10px] border border-dashed border-[#eadde2] bg-[#fff9fa] px-4 py-5 text-sm text-[#9aa0ad]">
      {text}
    </div>
  );
}

function buildPoemLines(description: string, slogan: string) {
  const source =
    description || slogan || "遇见你之前，我没有想过结婚；遇见你之后，结婚我没有想过别人。";
  const parts = source
    .replace(/([，；。])/g, "$1|")
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 4);

  return parts.length >= 2
    ? parts
    : ["遇见你之前，", "我没有想过结婚；", "遇见你之后，", "结婚我没有想过别人。"];
}

function formatMonthDay(date: Date) {
  return `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatEventDelta(date: Date) {
  const today = startOfDay(new Date());
  const target = startOfDay(date);
  const days = Math.round((today.getTime() - target.getTime()) / 86_400_000);

  if (days >= 0) {
    return `已纪念 ${days.toLocaleString("zh-CN")} 天`;
  }

  return `还有 ${Math.abs(days).toLocaleString("zh-CN")} 天`;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
