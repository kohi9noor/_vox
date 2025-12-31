'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Settings from './settings';
import History from './history';
import { JobResponse } from '@/types';
import { useEffect, useState } from 'react';

interface AsidebarProps {
  historyData: JobResponse[];
  historyIsLoading: boolean;
  type: 'tts' | 'voice_conversion' | 'sfx';
}
const Asidebar = ({ historyData, historyIsLoading, type }: AsidebarProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  if (!mounted) {
    return (
      <aside className="hidden lg:flex lg:w-80 border-l border-border/60 bg-background h-full overflow-hidden">
        <div className="w-full flex flex-col h-full" />
      </aside>
    );
  }

  return (
    <aside className="hidden lg:flex lg:w-80 border-l border-border/60 bg-background h-full overflow-hidden">
      <div className="w-full flex flex-col h-full">
        <Tabs defaultValue="settings" className="flex flex-col h-full">
          <div className="p-4 pb-0">
            <TabsList className="w-full">
              <TabsTrigger value="settings" className="flex-1">
                Settings
              </TabsTrigger>
              <TabsTrigger value="history" className="flex-1">
                History
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden">
            <TabsContent
              value="settings"
              className="h-full m-0 overflow-y-auto"
            >
              <div className="p-4">
                <Settings type={type} />
              </div>
            </TabsContent>

            <TabsContent value="history" className="h-full m-0 overflow-y-auto">
              <History data={historyData} isLoading={historyIsLoading} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </aside>
  );
};

export default Asidebar;
