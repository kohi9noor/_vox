import { CONFIG_ENDPOINTS } from "@/config";
import { getErrorMessage } from "@/lib";
import { fetchAllGeneratedVoices } from "@/lib/endpoint";
import { ApiResponse, HistoryResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useEffect } from "react";
import { toast } from "sonner";

const useHistory = () => {
  const query = useQuery<
    ApiResponse<HistoryResponse>,
    AxiosError<ApiResponse<never>>
  >({
    queryKey: [CONFIG_ENDPOINTS.history.endpoint, "history"],
    queryFn: async () => {
      return fetchAllGeneratedVoices();
    },
  });

  useEffect(() => {
    if (query.error) {
      const axiosError = query.error as AxiosError<ApiResponse<never>>;
      toast.error("Failed to load history", {
        description: getErrorMessage(axiosError),
      });
    }
  }, [query.error]);

  return query;
};

export default useHistory;
