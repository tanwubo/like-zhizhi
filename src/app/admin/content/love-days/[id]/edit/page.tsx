import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminSection } from "@/components/admin/admin-section";
import { LoveDayForm } from "@/components/admin/love-day-form";
import { updateLoveDayEvent } from "@/features/admin/love-days-actions";
import { getAdminLoveDayEvent } from "@/features/admin/love-days-data";

export default async function EditLoveDayEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getAdminLoveDayEvent(id);

  if (!event) {
    notFound();
  }

  return (
    <div className="grid gap-5">
      <div>
        <Link className="text-sm text-blush-700" href="/admin/content/love-days">
          返回纪念日管理
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-ink">编辑纪念日</h1>
      </div>
      <AdminSection title="纪念日内容">
        <LoveDayForm action={updateLoveDayEvent} event={event} />
      </AdminSection>
    </div>
  );
}
