interface PromptPreset {
  label: string;
  value: string;
}

export const DEMO_AUDIO = {
  id: "demo-audio",
  title: "Welcome to VOX",
  voice: "Demo voice",
  audioUrl: "/demo/voice-1.wav",
  duration: "0:18",
};

export const PROMPT_PRESETS: PromptPreset[] = [
  {
    label: "Narrate a story",
    value:
      "Narrate a short story with a calm and engaging tone. Focus on clarity, pacing, and emotion.",
  },
  {
    label: "Tell a silly joke",
    value:
      "Explain the topic in very simple terms, as if explaining it to a 5-year-old.",
  },
  {
    label: "Professional voice",
    value:
      "Read the text in a professional, confident, and clear tone suitable for presentations.",
  },
  {
    label: "Warm storyteller",
    value:
      "Tell the text warmly and personally, as if chatting with a close friend around a campfire.",
  },
  {
    label: "Energetic pitch",
    value:
      "Deliver the text with high energy, enthusiasm, and upbeat pacing to hook the listener quickly.",
  },
  {
    label: "Soothing meditation",
    value:
      "Guide the listener through the content slowly and softly, emphasizing relaxation and calm breath awareness.",
  },
  {
    label: "News anchor",
    value:
      "Present the information with steady cadence, neutrality, and crisp diction, like a news broadcast.",
  },
];

export const MAX_TEXT_LENGTH = 5000;
export const MAX_AUDIO_DURATION = 300;

interface VoiceOption {
  label: string;
  value: string;
}

export const TARGETED_VOICES: VoiceOption[] = [
  {
    label: "Jian",
    value: "03bb32e1-7ba0-4e1f-b6a9-068a78546fec",
  },
  {
    label: "May",
    value: "4fc2d258-0025-406d-8b36-fec5138c1306",
  },
];
