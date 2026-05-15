import Link from "next/link";

import { AdminSection } from "@/components/admin/admin-section";
import { FootprintForm } from "@/components/admin/footprint-form";
import { createFootprintPlace } from "@/features/admin/footprint-actions";

export default function NewFootprintPlacePage() {
  return (
    <div className="grid gap-5">
      <div>
        <Link className="text-sm text-blush-700" href="/admin/content/footprints">
          返回足迹管理
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-ink">新建足迹</h1>
      </div>
      <AdminSection title="足迹内容">
        <FootprintForm action={createFootprintPlace} />
      </AdminSection>
    </div>
  );
}
