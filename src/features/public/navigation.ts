import { prisma } from "@/server/db/prisma";

import { mapModuleToRoute } from "./public-content";

export type PublicNavigationItem = {
  key: string;
  label: string;
  href: string;
};

export async function getPublicNavigation(): Promise<PublicNavigationItem[]> {
  const modules = await prisma.moduleSetting.findMany({
    where: { enabled: true },
    orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
    select: { key: true, label: true }
  });

  return modules.flatMap((module) => {
    const href = mapModuleToRoute(module.key);
    return href ? [{ ...module, href }] : [];
  });
}
