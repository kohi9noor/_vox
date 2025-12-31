"use client";
import { useMemo } from "react";
import useHistory from "./use-history";

const useGetHistory = () => {
  const { data, isLoading } = useHistory();

  const jobs = useMemo(() => {
    return data?.success ? data.data.jobs : [];
  }, [data]);

  const ttsHistory = useMemo(() => {
    return jobs.filter((job) => job.type === "tts");
  }, [jobs]);

  const vcHistory = useMemo(() => {
    return jobs.filter((job) => job.type === "voice_conversion");
  }, [jobs]);

  const sfxHistory = useMemo(() => {
    return jobs.filter((job) => job.type === "make_an_audio");
  }, [jobs]);

  return { ttsHistory, vcHistory, sfxHistory, isLoading };
};

export default useGetHistory;
