import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminActionForm } from "@/components/admin/action-form";
import { AdminSection } from "@/components/admin/admin-section";
import { DeleteButton } from "@/components/admin/delete-button";
import { FootprintForm } from "@/components/admin/footprint-form";
import { FootprintMemoryForm } from "@/components/admin/footprint-memory-form";
import {
  createFootprintMemory,
  deleteFootprintMemory,
  updateFootprintMemory,
  updateFootprintPlace
} from "@/features/admin/footprint-actions";
import { getAdminFootprintPlace, getFootprintImageAssets } from "@/features/admin/footprint-data";
import { formatDateLabel } from "@/lib/date";

export default async function EditFootprintPlacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [place, imageAssets] = await Promise.all([getAdminFootprintPlace(id), getFootprintImageAssets()]);

  if (!place) {
    notFound();
  }

  return (
    <div className="grid gap-5">
      <div>
        <Link className="text-sm text-blush-700" href="/admin/content/footprints">
          返回足迹管理
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-ink">编辑城市足迹</h1>
        <p className="mt-1 text-sm text-ink/60">维护城市节点，以及这个城市下的具体记忆和照片。</p>
      </div>
      <AdminSection title="城市节点">
        <FootprintForm action={updateFootprintPlace} place={place} />
      </AdminSection>
      <AdminSection title="新增记忆">
        <FootprintMemoryForm action={createFootprintMemory} imageAssets={imageAssets} placeId={place.id} />
      </AdminSection>
      <AdminSection title="已有记忆">
        {place.memories.length ? (
          <div className="grid gap-4">
            {place.memories.map((memory) => (
              <div key={memory.id} className="grid gap-3 rounded-md border border-blush-100 bg-white/70 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-ink">
                      {memory.locationName} · {formatDateLabel(memory.visitedAt)}
                    </h2>
                    <p className="mt-1 text-sm text-ink/55">{memory.mood || memory.address || "暂无心情短句"}</p>
                  </div>
                  <AdminActionForm action={deleteFootprintMemory}>
                    <input name="id" type="hidden" value={memory.id} />
                    <DeleteButton className="text-sm text-ink/45 hover:text-blush-700" message="确认删除这条记忆？">
                      删除记忆
                    </DeleteButton>
                  </AdminActionForm>
                </div>
                <FootprintMemoryForm
                  action={updateFootprintMemory}
                  imageAssets={imageAssets}
                  memory={memory}
                  placeId={place.id}
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink/60">暂无记忆，先添加一个具体地点和照片。</p>
        )}
      </AdminSection>
    </div>
  );
}
