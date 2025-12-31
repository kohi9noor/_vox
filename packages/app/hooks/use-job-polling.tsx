import { useState, useEffect, useCallback, useRef } from 'react';
import useJobStatus from './use-job-status';
import { JobStatusResponse } from '@/types';

interface UseJobPollingOptions {
  onSuccess: (data: JobStatusResponse) => void;
  onError: (error: string) => void;
}

function useJobPolling({ onSuccess, onError }: UseJobPollingOptions) {
  const [jobId, setJobId] = useState<string | null>(null);
  const { data: jobStatusData } = useJobStatus(jobId || '');

  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);

  useEffect(() => {
    if (!jobId || jobStatusData?.success !== true) return;

    const { status, error } = jobStatusData.data;

    if (status === 'completed') {
      queueMicrotask(() => setJobId(null));
      onSuccessRef.current(jobStatusData.data);
    } else if (status === 'failed') {
      queueMicrotask(() => setJobId(null));
      onErrorRef.current(error || 'Job failed');
    }
  }, [jobId, jobStatusData]);

  const startPolling = useCallback((id: string) => {
    setJobId(id);
  }, []);

  const stopPolling = useCallback(() => {
    setJobId(null);
  }, []);

  const status =
    jobStatusData?.success === true ? jobStatusData.data.status : null;

  const isProcessing =
    !!jobId && (status === 'queued' || status === 'processing' || !status);

  return { startPolling, stopPolling, isProcessing, jobId };
}

export default useJobPolling;
