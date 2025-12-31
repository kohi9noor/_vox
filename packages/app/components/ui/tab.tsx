import { LucideIcon } from "lucide-react";
import Button from "./button";
import { cn } from "@/lib";

type TabButtonProps = {
  id: string;
  label: string;
  icon?: LucideIcon;
  activeTab: string;
  className?: string;
  onClick: () => void;
};

const TabButton = ({
  id,
  label,
  icon: Icon,
  activeTab,
  className,
  onClick,
}: TabButtonProps) => {
  return (
    <Button
      key={id}
      onClick={onClick}
      className={cn(
        activeTab === id
          ? "text-secondary"
          : "text-foreground/40 hover:text-foreground/60",
        className
      )}
      size="sm"
    >
      {Icon && <Icon size={20} />}
      <span className="text-xs">{label.split(" ")[0]}</span>
    </Button>
  );
};

export default TabButton;
