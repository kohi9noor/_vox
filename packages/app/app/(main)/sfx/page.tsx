import SoundtoEffectGenerator from "@/components/editor/sound-to-effect";
import DashboardLayout from "@/components/layout/dashboard";

const Page = () => {
  return (
    <DashboardLayout type="sfx">
      <SoundtoEffectGenerator />
    </DashboardLayout>
  );
};

export default Page;
