"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import queryClient from "./client-query";
import { Toaster } from "sonner";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-center" richColors theme="dark" />
    </QueryClientProvider>
  );
}
