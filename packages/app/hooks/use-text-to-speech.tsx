import { CONFIG_ENDPOINTS } from "@/config";
import { useMutation } from "@tanstack/react-query";
import { convertTextToSpeech } from "@/lib/endpoint";
import {
  ApiResponse,
  TextToSpeechRequest,
  TextToSpeechResponse,
} from "@/types";
import { AxiosError } from "axios";

const useTextToSpeech = () => {
  return useMutation<
    ApiResponse<TextToSpeechResponse>,
    AxiosError<ApiResponse<never>>,
    TextToSpeechRequest
  >({
    mutationKey: [CONFIG_ENDPOINTS.tts.endpoint, "text-to-speech"],
    mutationFn: async (payload: TextToSpeechRequest) => {
      return convertTextToSpeech(payload);
    },
  });
};

export default useTextToSpeech;
