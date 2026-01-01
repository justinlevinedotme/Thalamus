/**
 * @file speed-dial.tsx
 * @description Speed dial floating action button component
 */
import { useState, useRef, useEffect, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { cn } from "../../lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

export interface SpeedDialAction {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  kbd?: string;
}

interface SpeedDialProps {
  actions: SpeedDialAction[];
  className?: string;
}

export function SpeedDial({ actions, className }: SpeedDialProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleActionClick = (action: SpeedDialAction) => {
    action.onClick();
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Action buttons - appear to the right of the main button */}
      <div
        className={cn(
          "absolute left-full top-0 ml-2 flex flex-row gap-2 transition-all duration-200",
          isOpen
            ? "pointer-events-auto opacity-100 translate-x-0"
            : "pointer-events-none opacity-0 -translate-x-2"
        )}
      >
        {actions.map((action, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <button
                type="button"
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-md bg-background border border-border text-foreground shadow-sm transition-all duration-200 hover:bg-secondary hover:border-border",
                  isOpen ? "scale-100 opacity-100" : "scale-75 opacity-0"
                )}
                style={{
                  transitionDelay: isOpen ? `${index * 50}ms` : "0ms",
                }}
                onClick={() => handleActionClick(action)}
                aria-label={action.label}
              >
                {action.icon}
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="flex items-center gap-2">
              {action.label}
              {action.kbd && (
                <kbd className="ml-1 rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {action.kbd}
                </kbd>
              )}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

      {/* Main FAB button */}
      <button
        type="button"
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-md transition-all duration-200",
          isOpen
            ? "bg-foreground/80 text-background hover:bg-foreground/70 rotate-45"
            : "bg-foreground text-background hover:bg-foreground/90"
        )}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close menu" : "Add item"}
        aria-expanded={isOpen}
      >
        <Plus className="h-5 w-5 transition-transform duration-200" />
      </button>
    </div>
  );
}
