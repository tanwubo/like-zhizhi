import { prisma } from "@/server/db/prisma";

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

export async function getAdminSettingsData() {
  const [site, people, modules] = await Promise.all([
    prisma.siteSetting.findUniqueOrThrow({ where: { id: "site" } }),
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
    people,
    modules: normalizeModuleSettings(modules)
  };
}
