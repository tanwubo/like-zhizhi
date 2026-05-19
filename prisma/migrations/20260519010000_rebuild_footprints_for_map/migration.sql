DROP TABLE IF EXISTS "FootprintVisit";
DROP TABLE IF EXISTS "FootprintMemoryImage";
DROP TABLE IF EXISTS "FootprintMemory";
DROP TABLE IF EXISTS "FootprintPlace";

CREATE TABLE "FootprintPlace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "latitude" DECIMAL(10,7) NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "amapAdcode" TEXT,
    "amapCityCode" TEXT,
    "coverUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "FootprintPlace_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FootprintMemory" (
    "id" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "locationName" TEXT NOT NULL,
    "address" TEXT NOT NULL DEFAULT '',
    "amapPoiId" TEXT,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "visitedAt" TIMESTAMP(3) NOT NULL,
    "mood" TEXT NOT NULL DEFAULT '',
    "story" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "FootprintMemory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FootprintMemoryImage" (
    "id" TEXT NOT NULL,
    "memoryId" TEXT NOT NULL,
    "mediaAssetId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "caption" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FootprintMemoryImage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "FootprintPlace_enabled_sortOrder_idx" ON "FootprintPlace"("enabled", "sortOrder");
CREATE INDEX "FootprintMemory_placeId_visitedAt_idx" ON "FootprintMemory"("placeId", "visitedAt");
CREATE UNIQUE INDEX "FootprintMemoryImage_memoryId_mediaAssetId_key" ON "FootprintMemoryImage"("memoryId", "mediaAssetId");
CREATE INDEX "FootprintMemoryImage_mediaAssetId_idx" ON "FootprintMemoryImage"("mediaAssetId");

ALTER TABLE "FootprintMemory" ADD CONSTRAINT "FootprintMemory_placeId_fkey"
  FOREIGN KEY ("placeId") REFERENCES "FootprintPlace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FootprintMemoryImage" ADD CONSTRAINT "FootprintMemoryImage_memoryId_fkey"
  FOREIGN KEY ("memoryId") REFERENCES "FootprintMemory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FootprintMemoryImage" ADD CONSTRAINT "FootprintMemoryImage_mediaAssetId_fkey"
  FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
