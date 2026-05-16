import Link from "next/link";

import { AdminSection } from "@/components/admin/admin-section";
import { FootprintForm } from "@/components/admin/footprint-form";
import { createFootprintPlace } from "@/features/admin/footprint-actions";
import { getAdminMediaAssets } from "@/features/admin/media-data";

export default async function NewFootprintPlacePage() {
  const mediaAssets = await getAdminMediaAssets();

  return (
    <div className="grid gap-5">
      <div>
        <Link className="text-sm text-blush-700" href="/admin/content/footprints">
          返回足迹管理
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-ink">新建足迹</h1>
      </div>
      <AdminSection title="足迹内容">
        <FootprintForm action={createFootprintPlace} mediaAssets={mediaAssets} />
      </AdminSection>
    </div>
  );
}
