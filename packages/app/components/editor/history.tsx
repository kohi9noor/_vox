import { TARGETED_VOICES } from "@/constant";
import { JobResponse } from "@/types";
import { Loader2, Play, Pause, Volume2, MessageSquare } from "lucide-react";
import { usePlayer } from "@/context/player-context";

interface HistoryProps {
  data: JobResponse[];
  isLoading: boolean;
}

const History = ({ data, isLoading }: HistoryProps) => {
  const { playAudio, currentAudio, isPlaying, togglePause } = usePlayer();

  if (isLoading) {
    return (
      <div className="w-full h-full py-12 flex items-center justify-center">
        <Loader2 size={16} className="animate-spin text-primary" />
      </div>
    );
  }

  const getVoiceName = (voiceId: string) => {
    return TARGETED_VOICES.find((voice) => voice.value === voiceId);
  };

  const handlePlay = (entry: JobResponse) => {
    if (currentAudio?.id === entry.id) {
      togglePause();
      return;
    }
    const audioUrl = `${
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api"
    }/audio/${entry.id}`;

    const voiceLabel =
      entry.type === "make_an_audio"
        ? "Sound Effect"
        : getVoiceName(entry.targetVoiceId || "")?.label || "Unknown";

    playAudio({
      id: entry.id,
      title: entry.text || "Generated Audio",
      voice: voiceLabel,
      audioUrl: audioUrl,
    });
  };

  return (
    <div className="py-6 px-4 flex flex-col gap-6 max-w-2xl mx-auto">
      {data.map((entry, index) => {
        const isPlayingThis = currentAudio?.id === entry.id && isPlaying;
        const voice =
          entry.type === "make_an_audio"
            ? { label: "Sound Effect" }
            : getVoiceName(entry.targetVoiceId || "");

        return (
          <div key={index} className="relative flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-px flex-1 bg-secondary/30" />
              <div className="px-3 py-1 bg-secondary/10 rounded-full border border-secondary/20">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  {new Date(entry.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="h-px flex-1 bg-secondary/30" />
            </div>

            <div className="group relative bg-card hover:bg-secondary/5 border border-border/50 hover:border-primary/20 rounded-2xl p-4 transition-all duration-300 shadow-sm hover:shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-primary/10 rounded-lg">
                      <Volume2 size={14} className="text-primary" />
                    </div>
                    <h3 className="text-sm font-semibold truncate">
                      {voice?.label || "Unknown Voice"}
                    </h3>
                    <span className="text-[10px] text-muted-foreground ml-auto">
                      {new Date(entry.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {entry.text && (
                    <div className="flex gap-2 items-start mb-4">
                      <MessageSquare
                        size={12}
                        className="text-muted-foreground mt-1 shrink-0"
                      />
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed italic">
                        {entry.text}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-auto">
                    <button
                      onClick={() => handlePlay(entry)}
                      disabled={entry.status !== "completed"}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                        isPlayingThis
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                          : "bg-secondary hover:bg-secondary/80 text-foreground"
                      } ${
                        entry.status !== "completed"
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {isPlayingThis ? (
                        <Pause size={14} fill="currentColor" />
                      ) : (
                        <Play size={14} fill="currentColor" />
                      )}
                    </button>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${
                          entry.status === "completed"
                            ? "bg-green-500/10 text-green-500"
                            : entry.status === "failed"
                            ? "bg-red-500/10 text-red-500"
                            : "bg-blue-500/10 text-blue-500 animate-pulse"
                        }`}
                      >
                        {entry.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default History;
