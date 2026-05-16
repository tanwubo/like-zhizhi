export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4 text-center">
      <div>
        <p className="text-sm font-medium text-blush-700">正在加载</p>
        <h1 className="mt-3 text-2xl font-semibold text-ink">正在整理这一页的内容</h1>
        <p className="mt-2 text-sm text-ink/60">请稍等片刻。</p>
      </div>
    </div>
  );
}
