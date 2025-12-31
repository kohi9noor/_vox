import { CONFIG_ENDPOINTS } from "@/config";
import { useMutation } from "@tanstack/react-query";
import { generateMakeAnAudio } from "@/lib/endpoint";
import { ApiResponse, MakeAnAudioRequest, MakeAnAudioResponse } from "@/types";
import { AxiosError } from "axios";

const useMakeAnAudio = () => {
  return useMutation<
    ApiResponse<MakeAnAudioResponse>,
    AxiosError<ApiResponse<never>>,
    MakeAnAudioRequest
  >({
    mutationKey: [CONFIG_ENDPOINTS.makeAnAudio.endpoint, "make-an-audio"],
    mutationFn: async (payload: MakeAnAudioRequest) => {
      return generateMakeAnAudio(payload);
    },
  });
};

export default useMakeAnAudio;
