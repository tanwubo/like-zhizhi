import { buildIntegrationAdminModel, getStorageEnvironmentSummary } from "@/features/admin/integration-utils";
import { prisma } from "@/server/db/prisma";

export async function getAdminIntegrationSettings() {
  const rows = await prisma.integrationSetting.findMany();

  return {
    integrations: buildIntegrationAdminModel(rows),
    storage: getStorageEnvironmentSummary()
  };
}
