import { cn } from "@/lib";
import React from "react";

type ButtonProps = {
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
};

const SIZE = {
  sm: "px-2 py-1 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};

const Button = ({
  onClick,
  disabled,
  className,
  size = "md",
  children,
}: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center gap-2 text-xs font-medium transition-all duration-300",
        SIZE[size],
        className
      )}
    >
      {children}
    </button>
  );
};

export default Button;
