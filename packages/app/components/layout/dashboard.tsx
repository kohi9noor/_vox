"use client";
import React from "react";
import Header from "../editor/header";
import Asidebar from "../editor/aside-bar";
import useGetHistory from "@/hooks/use-get-history";
import { PlayerProvider } from "@/context/player-context";

interface DashboardLayoutProps {
  children: React.ReactNode;
  type?: "tts" | "voice_conversion" | "sfx";
}

const DashboardLayout = ({ children, type = "tts" }: DashboardLayoutProps) => {
  const { ttsHistory, vcHistory, sfxHistory, isLoading } = useGetHistory();

  const historyData =
    type === "tts"
      ? ttsHistory
      : type === "voice_conversion"
      ? vcHistory
      : sfxHistory;

  return (
    <PlayerProvider>
      <div className="flex flex-col w-full h-full bg-background">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          {children}
          <Asidebar
            historyData={historyData}
            historyIsLoading={isLoading}
            type={type}
          />
        </div>
      </div>
    </PlayerProvider>
  );
};

export default DashboardLayout;
