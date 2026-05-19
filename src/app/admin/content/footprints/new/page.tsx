import Link from "next/link";

import { AdminSection } from "@/components/admin/admin-section";
import { FootprintForm } from "@/components/admin/footprint-form";
import { createFootprintPlace } from "@/features/admin/footprint-actions";

export default async function NewFootprintPlacePage() {
  return (
    <div className="grid gap-5">
      <div>
        <Link className="text-sm text-blush-700" href="/admin/content/footprints">
          返回足迹管理
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-ink">新建城市足迹</h1>
        <p className="mt-1 text-sm text-ink/60">先创建城市节点，保存后再添加具体记忆和照片。</p>
      </div>
      <AdminSection title="城市节点">
        <FootprintForm action={createFootprintPlace} />
      </AdminSection>
    </div>
  );
}
