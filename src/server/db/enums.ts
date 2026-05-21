export const UserRole = {
  OWNER: "OWNER",
  PARTNER: "PARTNER",
  MODERATOR: "MODERATOR"
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const PublishStatus = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  HIDDEN: "HIDDEN"
} as const;

export type PublishStatus = (typeof PublishStatus)[keyof typeof PublishStatus];

export const MessageStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  HIDDEN: "HIDDEN"
} as const;

export type MessageStatus = (typeof MessageStatus)[keyof typeof MessageStatus];

export const MediaType = {
  IMAGE: "IMAGE",
  VIDEO: "VIDEO",
  AUDIO: "AUDIO",
  FILE: "FILE"
} as const;

export type MediaType = (typeof MediaType)[keyof typeof MediaType];
