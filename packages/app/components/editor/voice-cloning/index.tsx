'use client';

import React, { useCallback, useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { audioUrl, cn, getClonedVoiceName, getErrorMessage } from '@/lib';
import Dropzone from './dropzone';
import FilePreview from './file-preview';
import useVoiceConversion from '@/hooks/use-voice-conversion';
import { ApiResponse, JobStatusResponse } from '@/types';
import PlayerBar from '@/components/player';
import { useTextToSpeechStore } from '@/store/text-to-speech-store';
import useJobPolling from '@/hooks/use-job-polling';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import { usePlayer } from '@/context/player-context';

const VoiceCloning = () => {
  const [file, setFile] = useState<File | null>(null);

  const [isCloning, setIsCloning] = useState(false);

  const { mutate } = useVoiceConversion();

  const player = usePlayer();
  const { playAudio } = player;

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('audio/')) {
      setFile(droppedFile);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const onCloneSuccess = useCallback(
    (data: JobStatusResponse) => {
      if (!data.result) return;
      setIsCloning(false);
      const audioId = data.result.audioId;
      const audioUrlValue = audioUrl(audioId);
      const voice = getClonedVoiceName(data.result.targetedVoiceId);

      playAudio({
        audioUrl: audioUrlValue,
        id: audioId,
        title: '',
        voice: voice?.label,
      });

      toast.success('Voice conversion successful!');
    },
    [playAudio]
  );

  const { getTargetedVoiceId } = useTextToSpeechStore();

  const onCloneError = useCallback((error: string) => {
    toast.error('Voice conversion failed', {
      description: error,
    });
    setIsCloning(false);
  }, []);

  const { startPolling, isProcessing } = useJobPolling({
    onSuccess: onCloneSuccess,
    onError: onCloneError,
  });

  const onClone = () => {
    if (!file) return;
    const targetedVoiceId = getTargetedVoiceId();
    setIsCloning(true);
    mutate(
      {
        audio: file,
        targetedVoiceId: targetedVoiceId,
      },
      {
        onSuccess: (res) => {
          if (!res.success) return;
          toast.info('Conversion started', {
            description: 'Uploading and processing your audio...',
          });

          startPolling(res.data.jobId);
        },
        onError: (error: AxiosError<ApiResponse<never>>) => {
          toast.error('Failed to start conversion', {
            description: getErrorMessage(error),
          });
          setIsCloning(false);
        },
      }
    );
  };

  return (
    <main className="flex-1 p-6 overflow-auto">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Upload a high-quality audio sample or record yourself to create a
            digital clone of your voice.
          </p>
        </div>

        <div className="grid gap-6">
          {!file ? (
            <Dropzone onDrop={onDrop} onFileChange={onFileChange} />
          ) : (
            <FilePreview file={file} onRemove={() => setFile(null)} />
          )}

          <div className="pt-4">
            <button
              disabled={!file || isCloning || isProcessing}
              onClick={() => onClone()}
              className={cn(
                'w-full py-4 rounded-2xl font-semibold text-base transition-all duration-300 flex items-center justify-center gap-3 shadow-lg',
                file && !isCloning
                  ? 'bg-primary text-primary-foreground hover:shadow-primary/20 hover:-translate-y-0.5'
                  : 'bg-secondary text-muted-foreground cursor-not-allowed'
              )}
            >
              {isCloning || isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Cloning Voice...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Clone Voice
                </>
              )}
            </button>
            <p className="text-[10px] text-center text-muted-foreground mt-4 uppercase tracking-widest font-bold">
              By cloning, you agree to our terms of service and ethical use
              policy.
            </p>
          </div>
        </div>

        <PlayerBar player={player} />
      </div>
    </main>
  );
};

export default VoiceCloning;
