import {
  canManageContent,
  canManageIntegrations,
  canManageSettings,
  canManageUsers,
  canModerateMessages
} from "@/server/auth/roles";
import { getCurrentUser } from "@/server/auth/session";

type AdminCapability = "content" | "settings" | "integrations" | "users" | "moderation";

const messages: Record<AdminCapability, string> = {
  content: "没有内容管理权限",
  settings: "没有设置管理权限",
  integrations: "没有集成管理权限",
  users: "没有用户管理权限",
  moderation: "没有留言审核权限"
};

export async function requireAdminCapability(capability: AdminCapability) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error(messages[capability]);
  }

  const allowed =
    capability === "content"
      ? canManageContent(user.role)
      : capability === "settings"
        ? canManageSettings(user.role)
        : capability === "integrations"
          ? canManageIntegrations(user.role)
          : capability === "users"
            ? canManageUsers(user.role)
            : canModerateMessages(user.role);

  if (!allowed) {
    throw new Error(messages[capability]);
  }

  return user;
}
