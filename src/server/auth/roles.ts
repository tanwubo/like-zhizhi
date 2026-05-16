import type { UserRole } from "@prisma/client";

type AdminNavItem = {
  label: string;
  href: string;
  capability: "admin" | "content" | "moderation" | "settings" | "integrations" | "users";
};

type AdminNavGroup = {
  label: string;
  items: AdminNavItem[];
};

const adminNavGroups: AdminNavGroup[] = [
  {
    label: "总览",
    items: [{ label: "管理概览", href: "/admin", capability: "admin" }]
  },
  {
    label: "内容管理",
    items: [
      { label: "媒体中心", href: "/admin/media", capability: "content" },
      { label: "点滴", href: "/admin/content/notes", capability: "content" },
      { label: "留言审核", href: "/admin/content/messages", capability: "moderation" },
      { label: "足迹", href: "/admin/content/footprints", capability: "content" },
      { label: "相册", href: "/admin/content/album", capability: "content" },
      { label: "清单", href: "/admin/content/checklist", capability: "content" },
      { label: "纪念日", href: "/admin/content/love-days", capability: "content" },
      { label: "音乐", href: "/admin/content/music", capability: "content" }
    ]
  },
  {
    label: "站点设置",
    items: [
      { label: "基础设置", href: "/admin/settings/site", capability: "settings" },
      { label: "人物资料", href: "/admin/settings/people", capability: "settings" },
      { label: "主题设置", href: "/admin/settings/theme", capability: "settings" },
      { label: "模块开关", href: "/admin/settings/modules", capability: "settings" }
    ]
  },
  {
    label: "系统",
    items: [
      { label: "集成配置", href: "/admin/integrations", capability: "integrations" },
      { label: "用户管理", href: "/admin/users", capability: "users" }
    ]
  }
];

export function canAccessAdmin(role: UserRole) {
  return role === "OWNER" || role === "PARTNER" || role === "MODERATOR";
}

export function canManageContent(role: UserRole) {
  return role === "OWNER" || role === "PARTNER";
}

export function canManageUsers(role: UserRole) {
  return role === "OWNER";
}

export function canManageSettings(role: UserRole) {
  return role === "OWNER" || role === "PARTNER";
}

export function canModerateMessages(role: UserRole) {
  return role === "OWNER" || role === "PARTNER" || role === "MODERATOR";
}

export function canManageIntegrations(role: UserRole) {
  return role === "OWNER";
}

function canUseCapability(role: UserRole, capability: AdminNavItem["capability"]) {
  if (capability === "admin") return canAccessAdmin(role);
  if (capability === "content") return canManageContent(role);
  if (capability === "moderation") return canModerateMessages(role);
  if (capability === "settings") return canManageSettings(role);
  if (capability === "integrations") return canManageIntegrations(role);
  return canManageUsers(role);
}

export function getVisibleAdminNavGroups(role: UserRole) {
  return adminNavGroups
    .map((group) => ({
      label: group.label,
      items: group.items
        .filter((item) => canUseCapability(role, item.capability))
        .map(({ label, href }) => ({ label, href }))
    }))
    .filter((group) => group.items.length > 0);
}
