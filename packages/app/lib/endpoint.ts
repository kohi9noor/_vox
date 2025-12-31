import { CONFIG_ENDPOINTS } from "@/config";
import api from "./api";

import {
  ApiResponse,
  HistoryResponse,
  JobStatusResponse,
  MakeAnAudioRequest,
  MakeAnAudioResponse,
  TextToSpeechRequest,
  TextToSpeechResponse,
  VoiceConversionRequest,
  VoiceConversionResponse,
} from "@/types/index";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function generateMakeAnAudio(payload: MakeAnAudioRequest) {
  const response = await api.post<ApiResponse<MakeAnAudioResponse>>(
    CONFIG_ENDPOINTS.makeAnAudio.endpoint,
    payload
  );
  return response.data;
}

export async function convertTextToSpeech(payload: TextToSpeechRequest) {
  const response = await api.post<ApiResponse<TextToSpeechResponse>>(
    CONFIG_ENDPOINTS.tts.endpoint,
    payload
  );
  return response.data;
}

export async function fetchAllGeneratedVoices() {
  const response = await api.get<ApiResponse<HistoryResponse>>(
    `${CONFIG_ENDPOINTS.history.endpoint}`
  );
  return response.data;
}

export async function fetchJobStatus(jobId: string) {
  const response = await api.get<ApiResponse<JobStatusResponse>>(
    `${CONFIG_ENDPOINTS.jobStatus.endpoint}/${jobId}`
  );
  return response.data;
}

export async function voiceCloningConversion(payload: VoiceConversionRequest) {
  const formData = new FormData();
  formData.append("audio", payload.audio);
  formData.append("targetedVoiceId", payload.targetedVoiceId);

  const response = await api.post<ApiResponse<VoiceConversionResponse>>(
    `${CONFIG_ENDPOINTS.voiceCloning.endpoints}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
}
