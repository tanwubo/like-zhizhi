import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminSection } from "@/components/admin/admin-section";
import { ChecklistForm } from "@/components/admin/checklist-form";
import { updateChecklistItem } from "@/features/admin/checklist-actions";
import { getAdminChecklistItem } from "@/features/admin/checklist-data";

export default async function EditChecklistItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getAdminChecklistItem(id);

  if (!item) {
    notFound();
  }

  return (
    <div className="grid gap-5">
      <div>
        <Link className="text-sm text-blush-700" href="/admin/content/checklist">
          返回清单管理
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-ink">编辑清单</h1>
      </div>
      <AdminSection title="清单内容">
        <ChecklistForm action={updateChecklistItem} item={item} />
      </AdminSection>
    </div>
  );
}
