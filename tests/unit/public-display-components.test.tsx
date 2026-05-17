import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ContentCard } from "@/components/public/content-card";
import { EmptyState } from "@/components/public/empty-state";
import { PageHeader } from "@/components/public/page-header";

describe("public display components", () => {
  it("builds content cards on the shared card primitive", () => {
    render(
      <ContentCard meta="Daily Notes" title="点滴">
        把日常里的小确幸收进时间线。
      </ContentCard>
    );

    expect(screen.getByRole("article")).toHaveAttribute("data-slot", "card");
    expect(screen.getByText("点滴")).toHaveAttribute("data-slot", "card-title");
    expect(screen.getByText("Daily Notes")).toHaveAttribute("data-slot", "badge");
  });

  it("uses consistent public header and empty-state surfaces", () => {
    render(
      <div>
        <PageHeader eyebrow="Photo Album" title="相册" description="把走过的风景收好。" />
        <EmptyState title="暂无相册" description="上传并发布照片后会展示在这里。" />
      </div>
    );

    expect(screen.getByText("Photo Album")).toHaveAttribute("data-slot", "badge");
    expect(screen.getByText("相册")).toHaveAttribute("data-slot", "page-title");
    expect(screen.getByText("暂无相册").closest("[data-slot='card']")).toBeInTheDocument();
  });
});
