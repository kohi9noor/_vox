import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";
import { TARGETED_VOICES } from "@/constant";
import { AxiosError } from "axios";
import { ApiResponse } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function audioUrl(id: string) {
  const audioUrl = `${
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api"
  }/audio/${id}`;

  return audioUrl;
}

export function getClonedVoiceName(voiceId: string) {
  return TARGETED_VOICES.find((voice) => voice.value === voiceId);
}

export function getErrorMessage(error: AxiosError<ApiResponse<never>>): string {
  return error.response?.data.success === false
    ? error.response?.data.error
    : error.message;
}
