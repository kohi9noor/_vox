"use client";

import { Pause, Play, SkipBack, SkipForward, Download, X } from "lucide-react";
import { AudioPlayerHook } from "@/hooks/use-audio-player";

interface PlayerBarProps {
  player: AudioPlayerHook;
}

const PlayerBar = ({ player }: PlayerBarProps) => {
  const {
    currentAudio,
    isPlaying,
    duration,
    progress,
    togglePause,
    skipBackward,
    skipForward,
    downloadCurrentAudio,
    togglePlayBar,
    isPlaybarVisible,
    seek,
  } = player;

  if (!currentAudio || !isPlaybarVisible) return null;

  const skipMovement = 5;

  return (
    <div className="border-t border-border/60 max-w-full my-8 bg-secondary/95 rounded-xl p-2 backdrop-blur">
      <div className="mx-auto px-2 py-2">
        <div className="flex items-center gap-4">
          <div className="flex min-w-0 flex-1 flex-col">
            <p className="truncate text-sm font-medium text-foreground">
              {currentAudio?.title}
            </p>
            <p className="text-xs text-muted-foreground">
              {currentAudio?.voice}
            </p>
          </div>

          {/* PLAYER BAR */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => skipBackward(skipMovement)}
              className="p-1 text-muted-foreground hover:text-foreground"
            >
              <SkipBack className="h-4 w-4" />
            </button>

            <button
              onClick={togglePause}
              className="rounded-md bg-secondary/50 p-1.5 text-foreground hover:bg-secondary"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </button>

            <button
              onClick={() => skipForward(skipMovement)}
              className="p-1 text-muted-foreground hover:text-foreground"
            >
              <SkipForward className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <p className="text-xs text-muted-foreground">{duration}</p>
            <button
              onClick={downloadCurrentAudio}
              className="text-muted-foreground hover:text-foreground"
            >
              <Download className="h-4 w-4" />
            </button>

            <button
              onClick={togglePlayBar}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div
          className="mt-2 h-1 w-full rounded bg-secondary/40 cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const percent = (clickX / rect.width) * 100;
            seek(percent);
          }}
        >
          <div
            className="h-1 rounded bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default PlayerBar;
