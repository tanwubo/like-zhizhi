import { AdminSection } from "@/components/admin/admin-section";
import { CarouselSlideForm } from "@/components/admin/carousel-slide-form";
import { createCarouselSlide } from "@/features/admin/carousel-actions";
import { getAdminMediaAssets } from "@/features/admin/media-data";

export const dynamic = "force-dynamic";

export default async function NewCarouselSlidePage() {
  const mediaAssets = await getAdminMediaAssets();

  return (
    <div className="grid gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-ink">新增轮播图</h1>
        <p className="mt-1 text-sm text-ink/60">添加一张首页头部轮播图素材。</p>
      </div>
      <AdminSection title="轮播图信息">
        <CarouselSlideForm action={createCarouselSlide} mediaAssets={mediaAssets} />
      </AdminSection>
    </div>
  );
}
