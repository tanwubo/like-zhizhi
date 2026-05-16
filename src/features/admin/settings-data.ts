import { prisma } from "@/server/db/prisma";

export type AdminThemeSetting = {
  primaryColor: string;
  backgroundImageUrl: string | null;
  backgroundVideoUrl: string | null;
  enableGlassEffect: boolean;
  enablePageAnimation: boolean;
};

export type AdminModuleSetting = {
  id: string;
  key: string;
  label: string;
  enabled: boolean;
  sortOrder: number;
  description: string;
};

export function normalizeModuleSettings(modules: AdminModuleSetting[]) {
  return [...modules].sort((left, right) => {
    if (left.sortOrder !== right.sortOrder) {
      return left.sortOrder - right.sortOrder;
    }

    return left.label.localeCompare(right.label, "zh-CN");
  });
}

export function normalizeThemeSetting(theme: AdminThemeSetting | null): AdminThemeSetting {
  return {
    primaryColor: theme?.primaryColor || "#f45d7a",
    backgroundImageUrl: theme?.backgroundImageUrl || null,
    backgroundVideoUrl: theme?.backgroundVideoUrl || null,
    enableGlassEffect: theme?.enableGlassEffect ?? true,
    enablePageAnimation: theme?.enablePageAnimation ?? true
  };
}

export async function getAdminSettingsData() {
  const [site, theme, people, modules] = await Promise.all([
    prisma.siteSetting.findUniqueOrThrow({ where: { id: "site" } }),
    prisma.themeSetting.findUnique({ where: { id: "theme" } }),
    prisma.personProfile.findMany({ orderBy: { slot: "asc" } }),
    prisma.moduleSetting.findMany({
      select: {
        id: true,
        key: true,
        label: true,
        enabled: true,
        sortOrder: true,
        description: true
      }
    })
  ]);

  return {
    site,
    theme: normalizeThemeSetting(theme),
    people,
    modules: normalizeModuleSettings(modules)
  };
}
