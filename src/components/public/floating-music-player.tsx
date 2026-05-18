"use client";

import AudioPlayer from "react-h5-audio-player";
import { ChevronDown, ChevronUp, ListMusic, Music2 } from "lucide-react";
import { useMemo, useState } from "react";

type MusicTrack = {
  id: string;
  title: string;
  artist: string;
  coverUrl: string | null;
  sourceUrl: string;
};

export function FloatingMusicPlayer({ tracks }: { tracks: MusicTrack[] }) {
  const [trackIndex, setTrackIndex] = useState(0);
  const [expanded, setExpanded] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentTrack = tracks[trackIndex] ?? tracks[0];
  const hasPlaylist = tracks.length > 1;

  const playlistLabel = useMemo(() => {
    if (!tracks.length) {
      return "暂无音乐";
    }

    return `${trackIndex + 1} / ${tracks.length}`;
  }, [trackIndex, tracks.length]);

  if (!currentTrack) {
    return null;
  }

  const goToPrevious = () => {
    setTrackIndex((index) => (index - 1 + tracks.length) % tracks.length);
  };

  const goToNext = () => {
    setTrackIndex((index) => (index + 1) % tracks.length);
  };

  return (
    <aside
      aria-label="首页音乐播放器"
      className={[
        "home-music-player fixed bottom-4 left-4 z-40 w-[min(calc(100vw-2rem),360px)] overflow-hidden rounded-[8px] border border-white/70 bg-white/82 text-[#243047] shadow-[0_18px_48px_rgba(36,48,71,0.18)] backdrop-blur-xl",
        expanded ? "p-3" : "p-2"
      ].join(" ")}
    >
      <div className="flex items-center gap-3">
        <div className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-[8px] bg-[#fff0f4] text-[#ff5f86]">
          {currentTrack.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={currentTrack.coverUrl} alt="" className="size-full object-cover" />
          ) : (
            <Music2 className="size-5" aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{currentTrack.title}</p>
          <p className="mt-0.5 truncate text-xs text-[#7b8498]">{currentTrack.artist}</p>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="grid size-8 shrink-0 place-items-center rounded-full bg-[#fff0f4] text-[#ff5f86] transition hover:bg-[#ffe2ea]"
          aria-label={expanded ? "收起音乐播放器" : "展开音乐播放器"}
        >
          {expanded ? <ChevronDown className="size-4" aria-hidden="true" /> : <ChevronUp className="size-4" aria-hidden="true" />}
        </button>
      </div>

      {expanded ? (
        <div className="mt-3">
          <AudioPlayer
            autoPlay={false}
            autoPlayAfterSrcChange={isPlaying}
            className="home-music-audio"
            customAdditionalControls={[]}
            header={null}
            i18nAriaLabels={{
              player: "音乐播放器",
              progressControl: "播放进度",
              volumeControl: "音量",
              play: "播放",
              pause: "暂停",
              previous: "上一首",
              next: "下一首",
              rewind: "后退",
              forward: "前进",
              loop: "循环播放",
              loopOff: "关闭循环",
              volume: "音量",
              volumeMute: "静音"
            }}
            layout="stacked-reverse"
            onClickNext={goToNext}
            onClickPrevious={goToPrevious}
            onEnded={() => {
              if (hasPlaylist) {
                setIsPlaying(true);
                goToNext();
              } else {
                setIsPlaying(false);
              }
            }}
            onPause={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            preload="metadata"
            showJumpControls={false}
            showSkipControls={hasPlaylist}
            src={currentTrack.sourceUrl}
          />
          <div className="mt-2 flex items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9aa2b3]">
            <span className="flex items-center gap-1">
              <ListMusic className="size-3.5" aria-hidden="true" />
              {playlistLabel}
            </span>
            <span>Click to play</span>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
