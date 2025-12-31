import { CONFIG_ENDPOINTS } from '@/config';
import { voiceCloningConversion } from '@/lib/endpoint';
import { useMutation } from '@tanstack/react-query';
import {
  ApiResponse,
  VoiceConversionRequest,
  VoiceConversionResponse,
} from '@/types';
import { AxiosError } from 'axios';

const useVoiceConversion = () => {
  return useMutation<
    ApiResponse<VoiceConversionResponse>,
    AxiosError<ApiResponse<never>>,
    VoiceConversionRequest
  >({
    mutationKey: [CONFIG_ENDPOINTS.voiceCloning.endpoints, 'voiceConversion'],
    mutationFn: async (payload: VoiceConversionRequest) => {
      return voiceCloningConversion(payload);
    },
  });
};

export default useVoiceConversion;
