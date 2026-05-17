-- CreateTable
CREATE TABLE "CarouselSlide" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "linkUrl" TEXT,
    "description" TEXT NOT NULL DEFAULT '',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarouselSlide_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CarouselSlide_enabled_sortOrder_idx" ON "CarouselSlide"("enabled", "sortOrder");
