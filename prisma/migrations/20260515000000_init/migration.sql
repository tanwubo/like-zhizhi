-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('OWNER', 'PARTNER', 'MODERATOR');

-- CreateEnum
CREATE TYPE "PublishStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'HIDDEN');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('PENDING', 'APPROVED', 'HIDDEN');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO', 'AUDIO', 'FILE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'PARTNER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonProfile" (
    "id" TEXT NOT NULL,
    "slot" INTEGER NOT NULL,
    "displayName" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "birthday" TIMESTAMP(3),
    "location" TEXT,
    "bio" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSetting" (
    "id" TEXT NOT NULL DEFAULT 'site',
    "title" TEXT NOT NULL,
    "slogan" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "togetherDate" TIMESTAMP(3) NOT NULL,
    "footerText" TEXT NOT NULL,
    "icpText" TEXT,
    "policeText" TEXT,
    "seoKeywords" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThemeSetting" (
    "id" TEXT NOT NULL DEFAULT 'theme',
    "primaryColor" TEXT NOT NULL DEFAULT '#f45d7a',
    "backgroundImageUrl" TEXT,
    "backgroundVideoUrl" TEXT,
    "enableGlassEffect" BOOLEAN NOT NULL DEFAULT true,
    "enablePageAnimation" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ThemeSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModuleSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModuleSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "type" "MediaType" NOT NULL,
    "bucket" TEXT NOT NULL,
    "objectKey" TEXT NOT NULL,
    "publicUrl" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "mood" TEXT,
    "weather" TEXT,
    "location" TEXT,
    "authorId" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NoteMedia" (
    "id" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "NoteMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NoteReaction" (
    "id" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "visitorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NoteReaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "MessageStatus" NOT NULL DEFAULT 'PENDING',
    "ipHash" TEXT,
    "userAgent" TEXT,
    "location" TEXT,
    "deviceLabel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageReply" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "authorId" TEXT,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageReply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlbumItem" (
    "id" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "caption" TEXT NOT NULL,
    "status" "PublishStatus" NOT NULL DEFAULT 'PUBLISHED',
    "takenAt" TIMESTAMP(3),
    "location" TEXT,
    "authorLabel" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlbumItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChecklistItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "PublishStatus" NOT NULL DEFAULT 'PUBLISHED',
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "targetDate" TIMESTAMP(3),
    "location" TEXT,
    "imageUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FootprintPlace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "latitude" DECIMAL(10,7) NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "coverUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FootprintPlace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FootprintVisit" (
    "id" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "visitedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "FootprintVisit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoveDayEvent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "yearly" BOOLEAN NOT NULL DEFAULT false,
    "lunar" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoveDayEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MusicTrack" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "coverUrl" TEXT,
    "sourceUrl" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL DEFAULT 'url',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MusicTrack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisitEvent" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisitEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyStat" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "visits" INTEGER NOT NULL DEFAULT 0,
    "uniqueVisitors" INTEGER NOT NULL DEFAULT 0,
    "messages" INTEGER NOT NULL DEFAULT 0,
    "notes" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DailyStat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "PersonProfile_slot_key" ON "PersonProfile"("slot");

-- CreateIndex
CREATE UNIQUE INDEX "ModuleSetting_key_key" ON "ModuleSetting"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Note_slug_key" ON "Note"("slug");

-- CreateIndex
CREATE INDEX "Note_status_publishedAt_idx" ON "Note"("status", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "NoteMedia_noteId_mediaId_key" ON "NoteMedia"("noteId", "mediaId");

-- CreateIndex
CREATE INDEX "NoteReaction_noteId_type_idx" ON "NoteReaction"("noteId", "type");

-- CreateIndex
CREATE INDEX "Message_status_createdAt_idx" ON "Message"("status", "createdAt");

-- CreateIndex
CREATE INDEX "AlbumItem_status_sortOrder_idx" ON "AlbumItem"("status", "sortOrder");

-- CreateIndex
CREATE INDEX "VisitEvent_path_createdAt_idx" ON "VisitEvent"("path", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "DailyStat_date_key" ON "DailyStat"("date");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteMedia" ADD CONSTRAINT "NoteMedia_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteMedia" ADD CONSTRAINT "NoteMedia_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "MediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteReaction" ADD CONSTRAINT "NoteReaction_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageReply" ADD CONSTRAINT "MessageReply_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlbumItem" ADD CONSTRAINT "AlbumItem_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "MediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FootprintVisit" ADD CONSTRAINT "FootprintVisit_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "FootprintPlace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

