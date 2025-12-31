export const CONFIG_ENDPOINTS = {
  tts: {
    endpoint: "/text-to-speech",
    requiredPayload: {
      text: true,
      targetedVoiceId: true,
    },
  },

  history: {
    endpoint: "/all-jobs",
    requiredPayload: {},
  },

  jobStatus: {
    endpoint: "/job-status",
    requiredPayload: {
      jobId: true,
    },
  },

  voiceCloning: {
    endpoints: "/voice-conversion",
    requiredPayload: {
      audio: true,
      targetedVoiceId: true,
    },
  },

  makeAnAudio: {
    endpoint: "/make-an-audio",
    requiredPayload: {
      prompt: true,
    },
  },
};
