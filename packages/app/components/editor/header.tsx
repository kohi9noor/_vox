"use client";
import { ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";

const HEADER_TITLE = {
  "/voice": "Voice Cloning",
  "/": "Text to Speech",
  "/sfx": "Sound Effects Generator",
};

const Header = () => {
  const pathname = usePathname();
  if (!HEADER_TITLE[pathname as keyof typeof HEADER_TITLE]) {
    return null;
  }

  return (
    <header className="flex items-center justify-between px-4 py-2 border-b border-border/60">
      <p className="text-sm font-medium text-foreground">
        {HEADER_TITLE[pathname as keyof typeof HEADER_TITLE]}
      </p>
      <div className=" flex items-center gap-4">
        <button className="md:hidden text-muted-foreground hover:text-foreground transition-colors">
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default Header;
