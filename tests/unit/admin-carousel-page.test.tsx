import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AdminCarouselPage from "@/app/admin/content/carousel/page";

vi.mock("@/features/admin/carousel-data", () => ({
  getAdminCarouselSlides: vi.fn()
}));

vi.mock("@/features/admin/carousel-actions", () => ({
  deleteCarouselSlide: vi.fn(),
  moveCarouselSlide: vi.fn()
}));

vi.mock("@/components/admin/action-form", () => ({
  AdminActionForm: ({ children }: { children: React.ReactNode }) => <form>{children}</form>
}));

vi.mock("@/components/admin/delete-button", () => ({
  DeleteButton: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <button className={className} type="submit">
      {children}
    </button>
  )
}));

const { getAdminCarouselSlides } = await import("@/features/admin/carousel-data");

describe("admin carousel page", () => {
  beforeEach(() => {
    vi.mocked(getAdminCarouselSlides).mockResolvedValue([
      {
        id: "slide-a",
        title: "第一张",
        imageUrl: "https://example.com/a.jpg",
        linkUrl: null,
        description: "首页第一张背景",
        enabled: true,
        sortOrder: 10,
        createdAt: new Date("2026-05-17T08:00:00Z"),
        updatedAt: new Date("2026-05-17T08:00:00Z")
      },
      {
        id: "slide-b",
        title: "第二张",
        imageUrl: "https://example.com/b.jpg",
        linkUrl: "https://example.com/story",
        description: "",
        enabled: false,
        sortOrder: 20,
        createdAt: new Date("2026-05-17T07:00:00Z"),
        updatedAt: new Date("2026-05-17T07:00:00Z")
      }
    ]);
  });

  it("renders carousel preview and direct CRUD controls", async () => {
    render(await AdminCarouselPage());

    expect(screen.getByRole("link", { name: "新增轮播图" })).toHaveAttribute("href", "/admin/content/carousel/new");
    expect(screen.getAllByRole("link", { name: "编辑" })).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: "删除" })).toHaveLength(2);
    expect(screen.getByRole("heading", { name: "轮播效果预览" })).toBeInTheDocument();
    expect(screen.getAllByRole("img", { name: "第一张" })[0]).toHaveAttribute("src", "https://example.com/a.jpg");
    expect(screen.getByRole("link", { name: "预览第一张" })).toHaveAttribute("href", "https://example.com/a.jpg");
  });

  it("renders order controls for each carousel slide", async () => {
    render(await AdminCarouselPage());

    expect(screen.getAllByRole("button", { name: "上移" })).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: "下移" })).toHaveLength(2);
    expect(screen.getAllByDisplayValue("up")).toHaveLength(2);
    expect(screen.getAllByDisplayValue("down")).toHaveLength(2);
  });

  it("shows create actions inside empty carousel states", async () => {
    vi.mocked(getAdminCarouselSlides).mockResolvedValue([]);

    render(await AdminCarouselPage());

    expect(screen.getByText("暂无启用的轮播图，启用后会在这里预览首页头部背景。")).toBeInTheDocument();
    expect(screen.getByText("暂无轮播图，新增后会展示在首页头部。")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "新增轮播图" })).toHaveLength(3);
  });
});
