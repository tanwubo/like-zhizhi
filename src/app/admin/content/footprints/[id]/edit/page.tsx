import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminSection } from "@/components/admin/admin-section";
import { FootprintForm } from "@/components/admin/footprint-form";
import { updateFootprintPlace } from "@/features/admin/footprint-actions";
import { getAdminFootprintPlace } from "@/features/admin/footprint-data";
import { getAdminMediaAssets } from "@/features/admin/media-data";

export default async function EditFootprintPlacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [place, mediaAssets] = await Promise.all([getAdminFootprintPlace(id), getAdminMediaAssets()]);

  if (!place) {
    notFound();
  }

  return (
    <div className="grid gap-5">
      <div>
        <Link className="text-sm text-blush-700" href="/admin/content/footprints">
          返回足迹管理
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-ink">编辑足迹</h1>
      </div>
      <AdminSection title="足迹内容">
        <FootprintForm action={updateFootprintPlace} place={place} mediaAssets={mediaAssets} />
      </AdminSection>
    </div>
  );
}
