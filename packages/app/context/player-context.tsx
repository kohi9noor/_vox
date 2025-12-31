import React, { createContext, useContext } from "react";
import { AudioPlayerHook, useAudioPlayer } from "@/hooks/use-audio-player";

const PlayerContext = createContext<AudioPlayerHook | null>(null);

export const PlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const player = useAudioPlayer();
  return (
    <PlayerContext.Provider value={player}>{children}</PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
};
