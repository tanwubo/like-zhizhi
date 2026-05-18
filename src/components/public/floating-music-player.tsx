"use client";

import { ChevronUp, ListMusic, Music2, Pause, Play, SkipBack, SkipForward } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

type MusicTrack = {
  id: string;
  title: string;
  artist: string;
  coverUrl: string | null;
  sourceUrl: string;
};

type PlayerMode = "compact" | "bar" | "expanded";

export function FloatingMusicPlayer({ tracks }: { tracks: MusicTrack[] }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [trackIndex, setTrackIndex] = useState(0);
  const [mode, setMode] = useState<PlayerMode>("compact");
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [mounted, setMounted] = useState(false);

  const currentTrack = tracks[trackIndex] ?? tracks[0];
  const hasPlaylist = tracks.length > 1;

  const progress = useMemo(() => {
    if (!duration) {
      return 0;
    }

    return Math.min(100, Math.max(0, (currentTime / duration) * 100));
  }, [currentTime, duration]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || !isPlaying) {
      return;
    }

    void audio.play().catch(() => setIsPlaying(false));
  }, [currentTrack?.sourceUrl, isPlaying]);

  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
  }, [currentTrack?.sourceUrl]);

  if (!currentTrack) {
    return null;
  }

  const play = () => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    setMode((value) => (value === "compact" ? "bar" : value));
    void audio
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  };

  const pause = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (isPlaying) {
      pause();
      return;
    }

    play();
  };

  const goToPrevious = () => {
    setTrackIndex((index) => (index - 1 + tracks.length) % tracks.length);
  };

  const goToNext = () => {
    setTrackIndex((index) => (index + 1) % tracks.length);
  };

  const chooseTrack = (index: number) => {
    setTrackIndex(index);
    setMode("expanded");
    setIsPlaying(true);
  };

  const seek = (value: string) => {
    const audio = audioRef.current;

    if (!audio || !duration) {
      return;
    }

    const nextTime = (Number(value) / 100) * duration;
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const record = (
    <span className={["home-music-record", isPlaying ? "is-playing" : ""].join(" ")} aria-hidden="true">
      <span className="home-music-record-groove" />
      <span className="home-music-record-cover">
        {currentTrack.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={currentTrack.coverUrl} alt="" />
        ) : (
          <Music2 className="size-5" aria-hidden="true" />
        )}
      </span>
      <span className="home-music-record-needle" />
    </span>
  );

  if (!mounted) {
    return null;
  }

  return createPortal(
    <aside
      aria-label="首页音乐播放器"
      className={["home-music-player", `home-music-player-${mode}`].join(" ")}
      data-home-floating="true"
    >
      <audio
        ref={audioRef}
        preload="metadata"
        src={currentTrack.sourceUrl}
        onEnded={() => {
          if (hasPlaylist) {
            goToNext();
            setIsPlaying(true);
          } else {
            setIsPlaying(false);
          }
        }}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 0)}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
      />

      {mode === "compact" ? (
        <button
          type="button"
          className="home-music-compact"
          aria-label={`播放 ${currentTrack.title}`}
          onClick={play}
        >
          {record}
        </button>
      ) : null}

      {mode === "bar" ? (
        <div className="home-music-bar" role="group" aria-label={`${currentTrack.title} 播放控制`}>
          <button type="button" className="home-music-record-button" aria-label={isPlaying ? "暂停音乐" : "播放音乐"} onClick={togglePlay}>
            {record}
          </button>
          <PlayerButton label="上一首" onClick={goToPrevious} disabled={!hasPlaylist}>
            <SkipBack className="size-7" fill="currentColor" aria-hidden="true" />
          </PlayerButton>
          <PlayerButton label={isPlaying ? "暂停" : "播放"} onClick={togglePlay} className="home-music-play">
            {isPlaying ? <Pause className="size-12" fill="currentColor" aria-hidden="true" /> : <Play className="size-11" fill="currentColor" aria-hidden="true" />}
          </PlayerButton>
          <PlayerButton label="下一首" onClick={goToNext} disabled={!hasPlaylist}>
            <SkipForward className="size-7" fill="currentColor" aria-hidden="true" />
          </PlayerButton>
          <span className="home-music-divider" aria-hidden="true" />
          <PlayerButton label="展开播放列表" onClick={() => setMode("expanded")}>
            <ChevronUp className="size-7" aria-hidden="true" />
          </PlayerButton>
        </div>
      ) : null}

      {mode === "expanded" ? (
        <div className="home-music-expanded" role="group" aria-label={`${currentTrack.title} 播放器`}>
          <div className="home-music-now">
            <button type="button" className="home-music-record-button" aria-label={isPlaying ? "暂停音乐" : "播放音乐"} onClick={togglePlay}>
              {record}
            </button>
            <div className="home-music-meta">
              <p className="home-music-title">{currentTrack.title}</p>
              <p className="home-music-artist">{currentTrack.artist}</p>
              <div className="home-music-progress-row">
                <span>{formatTime(currentTime)}</span>
                <input
                  aria-label="播放进度"
                  className="home-music-progress"
                  max="100"
                  min="0"
                  step="0.1"
                  style={{ "--music-progress": `${progress}%` } as CSSProperties}
                  type="range"
                  value={progress}
                  onChange={(event) => seek(event.currentTarget.value)}
                />
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>
          <div className="home-music-expanded-controls">
            <PlayerButton label="上一首" onClick={goToPrevious} disabled={!hasPlaylist}>
              <SkipBack className="size-8" fill="currentColor" aria-hidden="true" />
            </PlayerButton>
            <PlayerButton label={isPlaying ? "暂停" : "播放"} onClick={togglePlay} className="home-music-play">
              {isPlaying ? <Pause className="size-14" fill="currentColor" aria-hidden="true" /> : <Play className="size-12" fill="currentColor" aria-hidden="true" />}
            </PlayerButton>
            <PlayerButton label="下一首" onClick={goToNext} disabled={!hasPlaylist}>
              <SkipForward className="size-8" fill="currentColor" aria-hidden="true" />
            </PlayerButton>
          </div>
          <div className="home-music-list">
            <div className="home-music-list-head">
              <span>播放列表</span>
              <button type="button" aria-label="收起播放列表" onClick={() => setMode("bar")}>
                <ChevronUp className="size-5" aria-hidden="true" />
              </button>
            </div>
            <div className="home-music-list-scroll">
              {tracks.map((track, index) => (
                <button
                  key={track.id}
                  type="button"
                  className={["home-music-track", index === trackIndex ? "is-current" : ""].join(" ")}
                  onClick={() => chooseTrack(index)}
                  aria-current={index === trackIndex ? "true" : undefined}
                >
                  {index === trackIndex && isPlaying ? <ListMusic className="size-4" aria-hidden="true" /> : <Music2 className="size-4" aria-hidden="true" />}
                  <span>
                    <strong>{track.title}</strong>
                    <em>{track.artist}</em>
                  </span>
                  <small>{index === trackIndex ? formatTime(duration) : "--:--"}</small>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </aside>,
    document.body
  );
}

function PlayerButton({
  label,
  children,
  className = "",
  disabled,
  onClick
}: {
  label: string;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" className={["home-music-control", className].join(" ")} aria-label={label} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}

function formatTime(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return "00:00";
  }

  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);

  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}
