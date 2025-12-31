interface TextToSpeech {
  text: string;
  targetedVoiceId: string;
  language?: string;
}

interface TextToSpeechStore {
  payload: TextToSpeech;
  updatePayload: (payload: Partial<TextToSpeech>) => void;
  buildPayload: () => TextToSpeech;
  getTargetedVoiceId: () => string;
}

import { create } from "zustand";

import { TARGETED_VOICES } from "@/constant";

export const useTextToSpeechStore = create<TextToSpeechStore>((set, get) => ({
  payload: {
    text: "",
    targetedVoiceId: TARGETED_VOICES[0].value,
    language: "en",
  },

  getTargetedVoiceId: () => {
    const { payload } = get();
    return payload.targetedVoiceId;
  },
  updatePayload: (payload) => {
    set((state) => ({ payload: { ...state.payload, ...payload } }));
  },
  buildPayload: () => {
    const { payload } = get();

    if (!payload.text) {
      throw new Error("Text is required");
    }

    return payload;
  },
}));
