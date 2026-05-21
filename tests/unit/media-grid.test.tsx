import { MediaType } from "@/server/db/enums";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MediaGrid } from "@/components/admin/media-grid";

const router = {
  refresh: vi.fn()
};

vi.mock("next/navigation", () => ({
  useRouter: () => router
}));

const assets = [
  {
    id: "media_1",
    type: MediaType.IMAGE,
    filename: "photo-one.jpg",
    publicUrl: "https://example.com/photo-one.jpg",
    contentType: "image/jpeg",
    sizeBytes: 1024,
    width: 100,
    height: 80,
    createdAt: new Date("2026-05-18T00:00:00.000Z")
  },
  {
    id: "media_2",
    type: MediaType.FILE,
    filename: "doc-two.pdf",
    publicUrl: "https://example.com/doc-two.pdf",
    contentType: "application/pdf",
    sizeBytes: 2048,
    width: null,
    height: null,
    createdAt: new Date("2026-05-18T00:00:00.000Z")
  }
];

describe("MediaGrid", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, "confirm").mockReturnValue(true);
  });

  it("selects media assets and deletes the selected batch", async () => {
    const deleteAction = vi.fn(async () => ({ ok: true as const, deletedCount: 2 }));

    render(<MediaGrid assets={assets} deleteAction={deleteAction} />);

    fireEvent.click(screen.getByLabelText("选择 photo-one.jpg"));
    fireEvent.click(screen.getByLabelText("选择 doc-two.pdf"));
    fireEvent.click(screen.getByRole("button", { name: "删除已选 2 个" }));

    await waitFor(() => expect(deleteAction).toHaveBeenCalledWith(["media_1", "media_2"]));
    expect(router.refresh).toHaveBeenCalled();
    expect(screen.queryByText("已选择 2 个媒体")).not.toBeInTheDocument();
  });

  it("shows returned batch deletion errors", async () => {
    const deleteAction = vi.fn(async () => ({ ok: false as const, error: "删除失败" }));

    render(<MediaGrid assets={assets} deleteAction={deleteAction} />);

    fireEvent.click(screen.getByLabelText("选择 photo-one.jpg"));
    fireEvent.click(screen.getByRole("button", { name: "删除已选 1 个" }));

    expect(await screen.findByText("删除失败")).toBeInTheDocument();
    expect(router.refresh).not.toHaveBeenCalled();
  });
});
