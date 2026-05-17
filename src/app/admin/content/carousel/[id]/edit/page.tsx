import { notFound } from "next/navigation";

import { AdminSection } from "@/components/admin/admin-section";
import { CarouselSlideForm } from "@/components/admin/carousel-slide-form";
import { updateCarouselSlide } from "@/features/admin/carousel-actions";
import { getAdminCarouselSlide } from "@/features/admin/carousel-data";
import { getAdminMediaAssets } from "@/features/admin/media-data";

export const dynamic = "force-dynamic";

export default async function EditCarouselSlidePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [slide, mediaAssets] = await Promise.all([getAdminCarouselSlide(id), getAdminMediaAssets()]);

  if (!slide) {
    notFound();
  }

  return (
    <div className="grid gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-ink">编辑轮播图</h1>
        <p className="mt-1 text-sm text-ink/60">修改首页头部轮播图素材和展示状态。</p>
      </div>
      <AdminSection title="轮播图信息">
        <CarouselSlideForm action={updateCarouselSlide} mediaAssets={mediaAssets} slide={slide} />
      </AdminSection>
    </div>
  );
}
