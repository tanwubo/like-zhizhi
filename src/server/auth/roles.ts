import type { UserRole } from "@prisma/client";

export function canAccessAdmin(role: UserRole) {
  return role === "OWNER" || role === "PARTNER" || role === "MODERATOR";
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
