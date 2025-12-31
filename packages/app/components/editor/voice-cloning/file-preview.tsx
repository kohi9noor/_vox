"use client";
import { Music, X } from "lucide-react";

interface FilePreviewProps {
  file: File | null;
  onRemove: () => void;
}

const FilePreview = ({ file, onRemove }: FilePreviewProps) => {
  return (
    <div className="border border-border/60 bg-secondary/5 rounded-3xl p-6 flex items-center justify-between animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Music className="w-6 h-6 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium truncate max-w-50">
            {file?.name || "voice-sample.wav"}
          </p>
          <p className="text-xs text-muted-foreground">
            {(file?.size ? file.size / 1024 / 1024 : 0.5).toFixed(2)} MB • Ready
            to clone
          </p>
        </div>
      </div>
      <button
        onClick={onRemove}
        className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

export default FilePreview;
