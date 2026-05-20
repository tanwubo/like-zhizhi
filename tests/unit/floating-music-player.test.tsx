import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { FloatingMusicPlayer } from "@/components/public/floating-music-player";

const tracks = [
  {
    id: "track_1",
    title: "First Song",
    artist: "Us",
    coverUrl: "/cover.jpg",
    sourceUrl: "/music.mp3"
  }
];

const guideStorageKey = "like-zhizhi:home-music-guide-dismissed";
const autoplayStorageKey = "like-zhizhi:home-music-autoplay-enabled";

describe("FloatingMusicPlayer", () => {
  let playMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    window.localStorage.clear();
    playMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(window.HTMLMediaElement.prototype, "play", {
      configurable: true,
      value: playMock
    });
    Object.defineProperty(window.HTMLMediaElement.prototype, "pause", {
      configurable: true,
      value: vi.fn()
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it("keeps the first-visit guide opt-out unchecked by default", async () => {
    render(<FloatingMusicPlayer tracks={tracks} />);

    const neverRemind = await screen.findByRole("checkbox", { name: /下次不再提醒/ });

    expect(neverRemind).not.toBeChecked();
  });

  it("does not persist the guide or autoplay when guide playback starts without opt-out consent", async () => {
    render(<FloatingMusicPlayer tracks={tracks} />);

    const playButton = await screen.findByRole("button", { name: "立即播放" });
    fireEvent.click(playButton);

    expect(window.localStorage.getItem(guideStorageKey)).toBeNull();
    expect(window.localStorage.getItem(autoplayStorageKey)).toBeNull();
    await waitFor(() => expect(playMock).toHaveBeenCalledTimes(1));
  });

  it("persists guide dismissal and autoplay only when opt-out is checked before playback", async () => {
    render(<FloatingMusicPlayer tracks={tracks} />);

    fireEvent.click(await screen.findByRole("checkbox", { name: /下次不再提醒/ }));
    fireEvent.click(screen.getByRole("button", { name: "立即播放" }));

    expect(window.localStorage.getItem(guideStorageKey)).toBe("true");
    expect(window.localStorage.getItem(autoplayStorageKey)).toBe("true");
    await waitFor(() => expect(playMock).toHaveBeenCalledTimes(1));
  });

  it("shows the guide again on later visits when playback was started without opt-out consent", async () => {
    render(<FloatingMusicPlayer tracks={tracks} />);

    fireEvent.click(await screen.findByRole("button", { name: "立即播放" }));
    cleanup();

    render(<FloatingMusicPlayer tracks={tracks} />);

    expect(await screen.findByRole("dialog", { name: "沉浸体验" })).toBeInTheDocument();
  });

  it("automatically starts music on later visits after guide playback consent", async () => {
    window.localStorage.setItem(guideStorageKey, "true");
    window.localStorage.setItem(autoplayStorageKey, "true");

    render(<FloatingMusicPlayer tracks={tracks} />);

    expect(screen.queryByRole("dialog", { name: "沉浸体验" })).not.toBeInTheDocument();
    await waitFor(() => expect(playMock).toHaveBeenCalledTimes(1));
  });

  it("does not autoplay when the guide was dismissed without playback consent", async () => {
    window.localStorage.setItem(guideStorageKey, "true");

    render(<FloatingMusicPlayer tracks={tracks} />);

    await waitFor(() => expect(screen.getByLabelText("首页音乐播放器")).toBeInTheDocument());
    expect(playMock).not.toHaveBeenCalled();
  });
});
