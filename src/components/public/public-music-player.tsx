"use client";

import { usePathname } from "next/navigation";

import { FloatingMusicPlayer } from "@/components/public/floating-music-player";

type MusicTrack = {
  id: string;
  title: string;
  artist: string;
  coverUrl: string | null;
  sourceUrl: string;
};

const publicMusicPaths = [
  "/",
  "/notes",
  "/messages",
  "/footprints",
  "/album",
  "/checklist",
  "/love-days",
  "/about"
];

function isPublicMusicPath(pathname: string) {
  return publicMusicPaths.some((path) => pathname === path || (path !== "/" && pathname.startsWith(`${path}/`)));
}

export function PublicMusicPlayer({ tracks }: { tracks: MusicTrack[] }) {
  const pathname = usePathname();

  if (!tracks.length || !isPublicMusicPath(pathname)) {
    return null;
  }

  return <FloatingMusicPlayer tracks={tracks} />;
}
