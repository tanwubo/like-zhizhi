"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4 text-center">
      <div>
        <p className="text-sm font-medium text-blush-700">页面暂时不可用</p>
        <h1 className="mt-3 text-2xl font-semibold text-ink">内容加载时遇到问题</h1>
        <p className="mt-2 text-sm text-ink/60">可以稍后重试，或返回上一页继续浏览。</p>
        <button
          className="mt-6 rounded-md bg-blush-600 px-4 py-2 text-sm font-medium text-white hover:bg-blush-700"
          onClick={reset}
          type="button"
        >
          重新加载
        </button>
      </div>
    </div>
  );
}
