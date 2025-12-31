import VoiceCloning from "@/components/editor/voice-cloning";
import DashboardLayout from "@/components/layout/dashboard";

const Page = () => {
  return (
    <DashboardLayout type="voice_conversion">
      <VoiceCloning />
    </DashboardLayout>
  );
};

export default Page;
