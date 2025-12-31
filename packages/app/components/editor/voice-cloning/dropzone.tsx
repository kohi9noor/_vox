"use client";

import React from "react";
import { Upload } from "lucide-react";

interface DropzoneProps {
  onDrop: (e: React.DragEvent) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Dropzone = ({ onDrop, onFileChange }: DropzoneProps) => {
  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      className="relative group border-2 border-dashed border-border/60 hover:border-primary/40 bg-secondary/5 rounded-3xl p-12 transition-all duration-300 flex flex-col items-center justify-center gap-4 cursor-pointer"
    >
      <input
        type="file"
        accept="audio/*"
        onChange={onFileChange}
        className="absolute inset-0 opacity-0 cursor-pointer"
      />
      <div className="p-4 bg-primary/10 rounded-2xl group-hover:scale-110 transition-transform duration-300">
        <Upload className="w-8 h-8 text-primary" />
      </div>
      <div className="text-center">
        <p className="text-base font-medium">
          Click to upload or drag and drop
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          WAV, MP3 or M4A (Max 10MB)
        </p>
      </div>
    </div>
  );
};

export default Dropzone;
