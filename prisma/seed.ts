import bcrypt from "bcryptjs";
import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const ownerEmail = process.env.SEED_OWNER_EMAIL ?? "owner@example.com";
  const ownerPassword = process.env.SEED_OWNER_PASSWORD ?? "ChangeMe123!";
  const passwordHash = await bcrypt.hash(ownerPassword, 12);

  const owner = await prisma.user.upsert({
    where: { email: ownerEmail },
    update: { name: "站点主人", role: UserRole.OWNER, passwordHash },
    create: { email: ownerEmail, name: "站点主人", role: UserRole.OWNER, passwordHash }
  });

  await prisma.siteSetting.upsert({
    where: { id: "site" },
    update: {},
    create: {
      title: "Like Zhizhi",
      slogan: "把每一天都认真收藏",
      description: "一个从零重建的情侣纪念站。",
      togetherDate: new Date("2024-05-20T00:00:00+08:00"),
      footerText: "Like Zhizhi"
    }
  });

  await prisma.themeSetting.upsert({
    where: { id: "theme" },
    update: {},
    create: { id: "theme" }
  });

  await prisma.personProfile.upsert({
    where: { slot: 1 },
    update: {},
    create: {
      slot: 1,
      displayName: "知知",
      location: "Shanghai",
      bio: "喜欢记录生活里的小事。"
    }
  });

  await prisma.personProfile.upsert({
    where: { slot: 2 },
    update: {},
    create: {
      slot: 2,
      displayName: "只只",
      location: "Hangzhou",
      bio: "负责把愿望一点点实现。"
    }
  });

  const modules = [
    ["home", "首页", 0],
    ["notes", "点滴", 10],
    ["messages", "留言", 20],
    ["footprints", "轨迹", 30],
    ["album", "相册", 40],
    ["checklist", "清单", 50],
    ["love-days", "纪念日", 60],
    ["about", "关于", 70]
  ] as const;

  for (const [key, label, sortOrder] of modules) {
    await prisma.moduleSetting.upsert({
      where: { key },
      update: { label, sortOrder, enabled: true },
      create: { key, label, sortOrder, enabled: true }
    });
  }

  await prisma.note.upsert({
    where: { slug: "first-memory" },
    update: {},
    create: {
      slug: "first-memory",
      title: "第一条点滴",
      excerpt: "这是 Phase 1 的种子内容，用来证明首页和后台可以读取数据库。",
      content: "等公共站阶段开始，这里会变成完整的图文时间线。",
      status: "PUBLISHED",
      mood: "开心",
      weather: "晴",
      location: "家",
      authorId: owner.id,
      publishedAt: new Date("2024-05-20T20:00:00+08:00")
    }
  });

  await prisma.message.upsert({
    where: { id: "seed-message" },
    update: {},
    create: {
      id: "seed-message",
      nickname: "访客",
      content: "祝你们一直热爱生活。",
      status: "APPROVED",
      location: "Local"
    }
  });

  await prisma.checklistItem.upsert({
    where: { id: "seed-checklist" },
    update: {},
    create: {
      id: "seed-checklist",
      title: "一起看一次海",
      description: "Phase 1 的愿望清单种子数据。",
      completed: false,
      sortOrder: 1
    }
  });

  await prisma.loveDayEvent.upsert({
    where: { id: "seed-love-day" },
    update: {},
    create: {
      id: "seed-love-day",
      title: "在一起",
      description: "纪念我们开始认真记录彼此的日子。",
      date: new Date("2024-05-20T00:00:00+08:00"),
      yearly: true,
      sortOrder: 1
    }
  });

  const sunsetMedia = await prisma.mediaAsset.upsert({
    where: { id: "seed-media-sunset" },
    update: {
      publicUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
      filename: "sunset.jpg",
      contentType: "image/jpeg",
      sizeBytes: 128000
    },
    create: {
      id: "seed-media-sunset",
      type: "IMAGE",
      bucket: "like-zhizhi",
      objectKey: "seed/sunset.jpg",
      publicUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
      filename: "sunset.jpg",
      contentType: "image/jpeg",
      sizeBytes: 128000,
      width: 1600,
      height: 1067
    }
  });

  await prisma.albumItem.upsert({
    where: { id: "seed-album-sunset" },
    update: {},
    create: {
      id: "seed-album-sunset",
      mediaId: sunsetMedia.id,
      title: "海边日落",
      caption: "把傍晚的风和光一起收藏。",
      location: "舟山",
      authorLabel: "知知",
      sortOrder: 1,
      takenAt: new Date("2025-08-16T18:30:00+08:00")
    }
  });

  await prisma.footprintPlace.upsert({
    where: { id: "seed-place-bund" },
    update: {
      name: "外滩",
      description: "一起走过江边，看灯光慢慢亮起来。"
    },
    create: {
      id: "seed-place-bund",
      name: "外滩",
      description: "一起走过江边，看灯光慢慢亮起来。",
      latitude: 31.2400000,
      longitude: 121.4900000,
      coverUrl: "https://images.unsplash.com/photo-1548919973-5cef591cdbc9"
    }
  });

  await prisma.footprintVisit.upsert({
    where: { id: "seed-visit-bund" },
    update: {},
    create: {
      id: "seed-visit-bund",
      placeId: "seed-place-bund",
      visitedAt: new Date("2025-09-03T20:00:00+08:00"),
      title: "夜游外滩",
      description: "那天风很轻，适合慢慢走。"
    }
  });

  await prisma.dailyStat.upsert({
    where: { date: new Date("2026-05-15T00:00:00+08:00") },
    update: {},
    create: {
      date: new Date("2026-05-15T00:00:00+08:00"),
      visits: 128,
      uniqueVisitors: 42,
      messages: 1,
      notes: 1
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
