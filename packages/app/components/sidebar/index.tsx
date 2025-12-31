'use client';
import { cn } from '@/lib';
import {
  ChevronRight,
  MessageCircle,
  Mic,
  Music,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const Sidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [active, setActive] = useState('tts');

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 768);
    };

    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const itemBase =
    'group relative flex items-center gap-3 rounded-md cursor-pointer transition-all duration-200';

  const itemInactive = 'text-muted-foreground hover:bg-secondary/60';

  const itemActive = 'bg-secondary text-foreground shadow-sm';

  return (
    <aside
      className={cn(
        'relative h-full bg-sidebar text-sidebar-foreground',
        'border-r border-sidebar-border',
        'transition-[width] duration-300 ease-in-out',
        isSidebarOpen ? 'min-w-[18rem]' : 'w-14'
      )}
    >
      <div className="flex h-full flex-col px-2 py-3">
        <div>
          <div
            className={cn(
              'flex items-center mb-6',
              isSidebarOpen ? 'justify-between px-1' : 'justify-center'
            )}
          >
            {isSidebarOpen && (
              <span className="text-sm font-semibold tracking-wide">VOX</span>
            )}

            <button
              onClick={() => setIsSidebarOpen((p) => !p)}
              className="w-7 h-7 flex items-center justify-center
                         rounded-md hover:bg-secondary/40
                         transition-colors"
            >
              <ChevronRight
                className={cn(
                  'w-4 h-4 transition-transform duration-300',
                  isSidebarOpen && 'rotate-180'
                )}
              />
            </button>
          </div>

          <div className="space-y-3">
            {isSidebarOpen && (
              <p className="px-2 text-[11px] border-b border-sidebar-border pb-2 uppercase tracking-wide text-muted-foreground">
                Playground
              </p>
            )}

            <div className="space-y-1">
              {[
                {
                  id: 'tts',
                  href: '/',
                  label: 'Text to Speech',
                  icon: MessageCircle,
                },
                {
                  id: 'voice',
                  href: '/voice',
                  label: 'Voice Changer',
                  icon: Mic,
                },
                {
                  id: 'sfx',
                  href: '/sfx',
                  label: 'Sound Effects',
                  icon: Music,
                },
              ].map(({ id, href, label, icon: Icon }) => (
                <Link href={href} key={id}>
                  <div
                    onClick={() => setActive(id)}
                    className={cn(
                      itemBase,
                      isSidebarOpen ? 'px-2 py-1.5' : 'justify-center py-2',
                      active === id ? itemActive : itemInactive
                    )}
                  >
                    {active === id && (
                      <span className="absolute left-0 h-4 w-[2px] bg-primary rounded-r" />
                    )}

                    <Icon className="w-4 h-4 group-hover:scale-105 transition-transform" />
                    {isSidebarOpen && (
                      <span className="text-sm animate-fadeIn">{label}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
