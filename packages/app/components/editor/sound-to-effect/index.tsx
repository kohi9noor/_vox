'use client';

import { useState } from 'react';
import { Wand2, Music2, Loader2 } from 'lucide-react';
import { audioUrl, cn, getErrorMessage } from '@/lib';
import PlayerBar from '@/components/player';
import { usePlayer } from '@/context/player-context';
import useMakeAnAudio from '@/hooks/use-make-an-audio';
import useJobPolling from '@/hooks/use-job-polling';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import { ApiResponse } from '@/types';
import { useMakeAnAudioStore } from '@/store/make-an-audio-store';

const SFX_PRESETS = [
  {
    label: 'Cinematic Whoosh',
    value: 'A deep, cinematic whoosh sound effect with a long tail',
  },
  {
    label: 'Retro Jump',
    value: '8-bit retro game jump sound effect, high pitched',
  },
  {
    label: 'Rain & Thunder',
    value: 'Soft rain falling on a tin roof with distant thunder',
  },
  { label: 'Laser Blast', value: 'Futuristic sci-fi laser blast sound' },
  { label: 'Door Creak', value: 'Slow, eerie wooden door creaking open' },
];

const SoundToEffectGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const player = usePlayer();
  const { playAudio } = player;
  const { mutate: generateSFX, isPending: isSubmitting } = useMakeAnAudio();
  const { payload: sfxSettings } = useMakeAnAudioStore();

  const { startPolling, isProcessing } = useJobPolling({
    onSuccess: (data) => {
      if (data.result?.audioId) {
        toast.success('Sound effect generated successfully!');
        playAudio({
          id: data.result.audioId,
          title: prompt || 'Generated Sound Effect',
          voice: 'Sound Effect',
          audioUrl: audioUrl(data.result.audioId),
        });
      }
    },
    onError: (error) => {
      toast.error(`Generation failed: ${error}`);
    },
  });

  const onGenerate = () => {
    if (!prompt.trim()) return;

    generateSFX(
      {
        prompt,
        duration: sfxSettings.duration,
        scale: sfxSettings.scale,
      },
      {
        onSuccess: (response) => {
          if (response.success) {
            toast.info('Generation started...');
            startPolling(response.data.jobId);
          } else {
            toast.error(response.error);
          }
        },
        onError: (error: AxiosError<ApiResponse<never>>) => {
          toast.error(getErrorMessage(error));
        },
      }
    );
  };

  const isGenerating = isSubmitting || isProcessing;

  return (
    <main className="flex-1 p-6 overflow-auto">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Describe the sound you want to create, and our AI will generate a
            high-quality sound effect for you.
          </p>
        </div>

        <div className="space-y-6">
          <div className="relative group">
            <div className="relative bg-secondary/5 border border-border/60 rounded-3xl p-6 focus-within:border-primary/40 transition-all duration-300">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your sound (e.g., 'A futuristic spaceship engine powering up'...)"
                className="w-full h-40 bg-transparent border-none outline-none resize-none text-lg placeholder:text-muted-foreground/50"
              />

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/40">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Music2 className="w-4 h-4" />
                  <span className="text-xs font-medium">
                    {prompt.length} characters
                  </span>
                </div>

                <button
                  onClick={() => setPrompt('')}
                  className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">
              Quick Presets
            </p>
            <div className="flex flex-wrap gap-2">
              {SFX_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => setPrompt(preset.value)}
                  className="px-4 py-2 rounded-full text-sm font-medium border border-border/60 bg-secondary/5 hover:bg-secondary/10 hover:border-primary/40 transition-all duration-200"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <button
              disabled={!prompt || isGenerating}
              onClick={onGenerate}
              className={cn(
                'w-full py-4 rounded-2xl font-semibold text-base transition-all duration-300 flex items-center justify-center gap-3',
                prompt && !isGenerating
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-secondary text-muted-foreground cursor-not-allowed'
              )}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Sound...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  Generate SFX
                </>
              )}
            </button>
          </div>
        </div>

        <PlayerBar player={player} />
      </div>
    </main>
  );
};

export default SoundToEffectGenerator;
