'use client';
import PlayerBar from '@/components/player';
import { PROMPT_PRESETS } from '@/constant';
import useJobPolling from '@/hooks/use-job-polling';
import useTextToSpeech from '@/hooks/use-text-to-speech';
import { audioUrl, cn, getErrorMessage } from '@/lib';
import { useTextToSpeechStore } from '@/store/text-to-speech-store';
import { ApiResponse, JobStatusResponse } from '@/types';
import { AxiosError } from 'axios';
import { Loader2 } from 'lucide-react';
import { useCallback } from 'react';
import { toast } from 'sonner';
import { usePlayer } from '@/context/player-context';

const Generator = () => {
  const { updatePayload, payload, buildPayload } = useTextToSpeechStore();
  const { mutate, isPending: isMutating } = useTextToSpeech();
  const player = usePlayer();
  const { setIsPlaybarVisible, playAudio } = player;

  const onJobError = useCallback((error: string) => {
    toast.error('Generation failed', {
      description: error,
    });
  }, []);

  const onJobSuccess = useCallback(
    (data: JobStatusResponse) => {
      if (!data.result) return;
      const url = audioUrl(data.result?.audioId || '');
      playAudio({
        id: data.result?.audioId || '',
        title: payload.text || 'Generated Audio',
        voice: data.result.targetedVoiceId,
        audioUrl: url,
      });

      toast.success('Audio generated successfully!');
      updatePayload({ text: '' });
    },
    [payload.text, playAudio, updatePayload]
  );

  const {
    startPolling,
    isProcessing: isPolling,
    jobId: activeJobId,
  } = useJobPolling({
    onSuccess: onJobSuccess,
    onError: onJobError,
  });

  const onChange = (value: string) => {
    updatePayload({
      text: value,
    });
    setIsPlaybarVisible(false);
  };

  const onGenerate = () => {
    mutate(buildPayload(), {
      onSuccess: (response) => {
        if (response.success) {
          toast.info('Generation started', {
            description: 'Your audio is being processed...',
          });
          startPolling(response.data.jobId);
        }
      },
      onError: (error: AxiosError<ApiResponse<never>>) => {
        toast.error('Failed to start generation', {
          description: getErrorMessage(error),
        });
      },
    });
  };

  const isProcessing = isMutating || isPolling;
  const getStartedWith = true;

  return (
    <main className="flex-1 p-4 overflow-auto">
      <div className="h-full rounded-md bg-surface p-4 flex flex-col">
        <div className="flex-1 w-full">
          <textarea
            value={payload.text}
            onChange={(e) => onChange(e.target.value)}
            disabled={isProcessing}
            placeholder="Enter your text here..."
            className="w-full h-full resize-none bg-transparent outline-none text-foreground placeholder:text-muted-foreground disabled:opacity-50"
          />
        </div>
        <div className="shrink-0 flex flex-col space-y-2 mt-4">
          <div className=" flex  justify-between items-center">
            {payload.text && (
              <>
                <p className="text-sm text-muted-foreground">
                  {payload.text.split(' ').length} words
                </p>
                <button
                  onClick={onGenerate}
                  disabled={!payload.text || isProcessing}
                  className={cn(
                    'mt-2 px-4 py-1.5 rounded-xl text-sm transition-all flex items-center gap-2',
                    payload.text && !isProcessing
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'bg-secondary text-muted-foreground cursor-not-allowed'
                  )}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      {activeJobId ? 'Processing...' : 'Generating...'}
                    </>
                  ) : (
                    'Generate'
                  )}
                </button>
              </>
            )}
          </div>

          {getStartedWith && !payload.text && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-muted-foreground">
                Get started with
              </p>

              <div className="flex flex-wrap gap-2">
                {PROMPT_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => onChange(preset.value)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm border border-border bg-accent/10 text-accent-foreground hover:bg-accent/20 transition-colors'
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <PlayerBar player={player} />
        </div>
      </div>
    </main>
  );
};

export default Generator;
