import { create } from "zustand";

interface MakeAnAudioPayload {
  prompt: string;
  duration: number;
  ddim_steps: number;
  scale: number;
}

interface MakeAnAudioStore {
  payload: MakeAnAudioPayload;
  updatePayload: (payload: Partial<MakeAnAudioPayload>) => void;
}

export const useMakeAnAudioStore = create<MakeAnAudioStore>((set) => ({
  payload: {
    prompt: "",
    duration: 10,
    ddim_steps: 100,
    scale: 3.0,
  },
  updatePayload: (payload) => {
    set((state) => ({ payload: { ...state.payload, ...payload } }));
  },
}));
