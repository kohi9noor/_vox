"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TARGETED_VOICES } from "@/constant";
import { useTextToSpeechStore } from "@/store/text-to-speech-store";
import { useMakeAnAudioStore } from "@/store/make-an-audio-store";

const VoiceSettings = () => {
  const { updatePayload, payload } = useTextToSpeechStore();

  const onVoiceChange = (voice: string) => {
    updatePayload({
      targetedVoiceId: voice,
    });
  };

  return (
    <div className="flex flex-col w-full gap-1.5 py-6">
      <p className="text-xs text-muted-foreground">Voice</p>
      <Select onValueChange={onVoiceChange} value={payload.targetedVoiceId}>
        <SelectTrigger
          className="
          h-6 px-2 rounded-xl text-xs
          bg-secondary/40
          border border-border/50
          hover:bg-secondary/60
          focus:ring-0 focus:border-none
          w-full
        "
        >
          <SelectValue placeholder="Select voice" />
        </SelectTrigger>

        <SelectContent
          className="
          w-[--radix-select-trigger-width]
          bg-background rounded-xl
          border border-border/60
        "
        >
          {TARGETED_VOICES.map((voice) => (
            <div key={voice.value}>
              <SelectItem value={voice.value} className="text-xs">
                {voice.label}
              </SelectItem>
            </div>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

const SFXSettings = () => {
  const { updatePayload, payload } = useMakeAnAudioStore();

  return (
    <div className="flex flex-col w-full gap-6 py-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
            Duration
          </p>
          <span className="text-xs font-mono bg-secondary/50 px-2 py-0.5 rounded text-primary">
            {payload.duration}s
          </span>
        </div>
        <div
          className="relative h-1.5 w-full bg-secondary/40 rounded-full cursor-pointer group"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percentage = Math.max(0, Math.min(1, x / rect.width));
            const value = Math.round(percentage * 25 + 5); // 5s to 30s
            updatePayload({ duration: value });
          }}
        >
          <div
            className="absolute h-full bg-primary rounded-full transition-all duration-150"
            style={{
              width: `${((payload.duration - 5) / 25) * 100}%`,
            }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-background border-2 border-primary rounded-full shadow-sm transition-all duration-150"
            style={{
              left: `calc(${((payload.duration - 5) / 25) * 100}% - 6px)`,
            }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
          <span>5s</span>
          <span>30s</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
            Guidance Scale
          </p>
          <span className="text-xs font-mono bg-secondary/50 px-2 py-0.5 rounded text-primary">
            {payload.scale.toFixed(1)}
          </span>
        </div>
        <div
          className="relative h-1.5 w-full bg-secondary/40 rounded-full cursor-pointer group"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percentage = Math.max(0, Math.min(1, x / rect.width));
            const value = parseFloat((percentage * 9 + 1).toFixed(1)); // 1.0 to 10.0
            updatePayload({ scale: value });
          }}
        >
          <div
            className="absolute h-full bg-primary rounded-full transition-all duration-150"
            style={{
              width: `${((payload.scale - 1) / 9) * 100}%`,
            }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-background border-2 border-primary rounded-full shadow-sm transition-all duration-150"
            style={{
              left: `calc(${((payload.scale - 1) / 9) * 100}% - 6px)`,
            }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
          <span>1.0</span>
          <span>10.0</span>
        </div>
      </div>
    </div>
  );
};

interface SettingsProps {
  type: "tts" | "voice_conversion" | "sfx";
}

const Settings = ({ type }: SettingsProps) => {
  const renderSettingsMap: Record<
    SettingsProps["type"],
    () => React.ReactNode
  > = {
    tts: () => <VoiceSettings />,
    voice_conversion: () => <VoiceSettings />,
    sfx: () => <SFXSettings />,
  };

  return renderSettingsMap[type]();
};

export default Settings;
