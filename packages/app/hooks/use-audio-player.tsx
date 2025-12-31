import { useState, useEffect, useRef, useCallback } from 'react';

export interface AudioInfo {
  id: string;
  title: string;
  voice: string | undefined;
  audioUrl: string;
  duration?: string;
  progress?: number;
  createdAt?: Date;
  service?: string;
}

export const useAudioPlayer = () => {
  const [currentAudio, setCurrentAudio] = useState<AudioInfo | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlaybarVisible, setIsPlaybarVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState('0:00');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Using ref pattern here because playAudio is passed to 50+ AudioItem
  // components in a list. Without this, all items re-render when
  // currentAudio changes. The ref lets us maintain a stable function
  // reference while still checking the latest audio state.
  const currentAudioRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio();
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${mins}:${sec < 10 ? '0' : ''}${sec}`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      const percent = (audio.currentTime / audio.duration) * 100;
      setProgress(isNaN(percent) ? 0 : percent);
    };

    const onLoadMetaData = () => {
      setDuration(formatTime(audio.duration));
    };

    const onEnded = () => {
      setProgress(0);
      setIsPlaying(false);
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', onLoadMetaData);
    audio.addEventListener('seeking', updateProgress);
    audio.addEventListener('seeked', updateProgress);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', onLoadMetaData);
      audio.removeEventListener('seeking', updateProgress);
      audio.removeEventListener('seeked', updateProgress);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, []);

  const playAudio = useCallback((audio: AudioInfo) => {
    if (!audioRef.current) return;

    const isSameAudio = currentAudioRef?.current === audio.audioUrl;

    if (isSameAudio) {
      if (audioRef.current.paused) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
      return;
    }

    setCurrentAudio(audio);

    setIsPlaybarVisible(true);

    currentAudioRef.current = audio.audioUrl;

    audioRef.current.src = audio.audioUrl;

    audioRef.current.load();

    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        if (err.name !== 'AbortError') {
          console.error('Error playing audio:', err);
        }
      });
    }
  }, []);

  const togglePause = useCallback(() => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          if (err.name !== 'AbortError') {
            console.error('Error playing audio:', err);
          }
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, []);

  const skipForward = useCallback((seconds: number = 5) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.min(
      audioRef.current.currentTime + seconds,
      audioRef.current.duration
    );
  }, []);

  const skipBackward = useCallback((seconds: number = 5) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(
      audioRef.current.currentTime - seconds,
      0
    );
  }, []);

  const togglePlayBar = useCallback(() => {
    setIsPlaybarVisible((prev) => {
      if (prev && audioRef.current) {
        audioRef.current.pause();
      }
      return !prev;
    });
  }, []);

  const downloadCurrentAudio = useCallback(() => {
    if (!currentAudio) return;
    const link = document.createElement('a');
    link.href = currentAudio.audioUrl;
    link.download = `${currentAudio.title || 'audio'}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [currentAudio]);

  const seek = useCallback((percent: number) => {
    if (!audioRef.current || !audioRef.current.duration) return;
    audioRef.current.currentTime = (percent / 100) * audioRef.current.duration;
  }, []);

  return {
    currentAudio,
    isPlaying,
    isPlaybarVisible,
    progress,
    duration,
    playAudio,
    togglePause,
    skipForward,
    skipBackward,
    togglePlayBar,
    downloadCurrentAudio,
    seek,
    setIsPlaybarVisible,
  };
};

export type AudioPlayerHook = ReturnType<typeof useAudioPlayer>;
