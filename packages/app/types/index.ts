import { LucideIcon, Mic2, Volume2, Zap } from "lucide-react";

type Feature = {
  id: "tts" | "clone" | "conversion";
  label: string;
  icon: LucideIcon;
};

export const FEATURE_MODEL: Feature[] = [
  {
    id: "tts",
    label: "Text to Speech",
    icon: Volume2,
  },
  {
    id: "clone",
    label: "Voice Clone",
    icon: Mic2,
  },
  {
    id: "conversion",
    label: "Voice Conversion",
    icon: Zap,
  },
];

export type MODELTYPES = (typeof FEATURE_MODEL)[number]["id"];

export type JobType = "tts" | "voice_conversion" | "make_an_audio";
export type JobStatus = "queued" | "processing" | "completed" | "failed";

export interface JobResponse {
  id: string;
  type: JobType;
  text: string | null;
  targetVoiceId: string | null;
  status: JobStatus;
  outputAudioPath: string | null;
  sourceAudioPath: string | null;
  error: string | null;
  createdAt: string;
}

export interface HistoryResponse {
  count: number;
  jobs: JobResponse[];
}

export interface JobStatusResult {
  audioId: string;
  targetedVoiceId: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface TextToSpeechRequest {
  text: string;
  targetedVoiceId: string;
  language?: string;
}

export interface TextToSpeechResponse {
  jobId: string;
}

export interface VoiceConversionRequest {
  audio: File;
  targetedVoiceId: string;
}

export interface VoiceConversionResponse {
  jobId: string;
}

export interface MakeAnAudioRequest {
  prompt: string;
  duration?: number;
  scale?: number;
}

export interface MakeAnAudioResponse {
  jobId: string;
}

export interface JobStatusRequest {
  jobId: string;
}

export interface JobStatusResponse {
  status: JobStatus;
  result: JobStatusResult | null;
  error?: string;
}

export interface AllJobsResponse {
  count: number;
  jobs: JobResponse[];
}

export interface AudioDownloadRequest {
  audioId: string;
  range?: string;
}

export type AudioDownloadResponse = Blob;

export type LanguageCode =
  | "en"
  | "hi"
  | "fr"
  | "de"
  | "es"
  | "it"
  | "ja"
  | "ko"
  | "zh";

export const SUPPORTED_LANGUAGES: Record<LanguageCode, string> = {
  en: "English",
  hi: "Hindi",
  fr: "French",
  de: "German",
  es: "Spanish",
  it: "Italian",
  ja: "Japanese",
  ko: "Korean",
  zh: "Chinese",
};
