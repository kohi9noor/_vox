'use client';
import { useMemo } from 'react';
import useHistory from './use-history';

const useGetHistory = () => {
  const { data, isLoading } = useHistory();

  const jobs = useMemo(() => {
    return data?.success ? data.data.jobs : [];
  }, [data]);

  const ttsHistory = useMemo(() => {
    const ttsJobs = jobs.filter((job) => {
      return job.type === 'tts';
    });

    return ttsJobs.reduce((acc, job) => {
      const date = new Date(job.createdAt).toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(job);
      return acc;
    }, {} as Record<string, typeof ttsJobs>);
  }, [jobs]);

  const vcHistory = useMemo(() => {
    const vcJobs = jobs.filter((job) => job.type === 'voice_conversion');
    return vcJobs.reduce((acc, job) => {
      const date = new Date(job.createdAt).toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(job);
      return acc;
    }, {} as Record<string, typeof vcJobs>);
  }, [jobs]);

  const sfxHistory = useMemo(() => {
    const sfxJobs = jobs.filter((job) => job.type === 'make_an_audio');
    return sfxJobs.reduce((acc, job) => {
      const date = new Date(job.createdAt).toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(job);
      return acc;
    }, {} as Record<string, typeof sfxJobs>);
  }, [jobs]);

  return { ttsHistory, vcHistory, sfxHistory, isLoading };
};

export default useGetHistory;
