import { CONFIG_ENDPOINTS } from "@/config";
import { fetchJobStatus } from "@/lib/endpoint";
import { ApiResponse, JobStatusResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

const useJobStatus = (jobId: string) => {
  return useQuery<
    ApiResponse<JobStatusResponse>,
    AxiosError<ApiResponse<never>>
  >({
    queryKey: [CONFIG_ENDPOINTS.jobStatus.endpoint, "jobStatus", jobId],
    queryFn: async () => {
      return fetchJobStatus(jobId);
    },
    enabled: !!jobId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (
        data?.success &&
        (data.data.status === "completed" || data.data.status === "failed")
      ) {
        return false;
      }
      return 2000;
    },
    refetchOnWindowFocus: false,
  });
};

export default useJobStatus;
