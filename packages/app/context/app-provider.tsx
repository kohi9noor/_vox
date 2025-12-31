import { createContext } from "react";

interface TTSContext {
  textInput: string;
  voiceId: string;
}

interface VoiceSynthesisContext {
  audioFile: File | null;
  textInput: string;
}

interface VoiceConversionContext {
  audioFile: File | null;
  targetVoiceId: string;
}

interface ContextProps {
  tts: TTSContext;
  voiceSynthesis: VoiceSynthesisContext;
  voiceConversion: VoiceConversionContext;
}

const AppContext = createContext<ContextProps | null>(null);

const AppProvider = ({ children }: { children: React.ReactNode }) => {
  return <AppContext.Provider value={null}>{children}</AppContext.Provider>;
};

export default AppProvider;
