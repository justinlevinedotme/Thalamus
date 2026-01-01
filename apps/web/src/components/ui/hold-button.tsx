/**
 * @file hold-button.tsx
 * @description A button that requires holding for a duration before triggering.
 * Used for destructive actions to prevent accidental clicks.
 */

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const POP_SPRING = { type: "spring", stiffness: 500, damping: 25 } as const;
const FADE_QUICK = { duration: 0.1, ease: "easeOut" } as const;

export interface HoldButtonProps {
  /** Duration in milliseconds to hold before triggering (default: 2000) */
  holdDuration?: number;
  /** Callback when hold completes */
  onHoldComplete: () => void;
  /** Text to show while idle */
  children: React.ReactNode;
  /** Text to show while holding (default: "Sure?") */
  holdingText?: string;
  /** Text to show while processing (default: "Deleting...") */
  processingText?: string;
  /** Text to show when complete (default: "Deleted") */
  completeText?: string;
  /** How long to show the complete state in ms (default: 2000) */
  completeStateDuration?: number;
  /** Additional class names */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
}

function HoldButton({
  className,
  children,
  holdDuration = 2000,
  onHoldComplete,
  holdingText = "Sure?",
  processingText = "Deleting...",
  completeText = "Deleted",
  completeStateDuration = 1200,
  disabled,
}: HoldButtonProps) {
  const [state, setState] = React.useState<"idle" | "holding" | "processing" | "complete">("idle");
  const [progress, setProgress] = React.useState(0);

  const holdTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressIntervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = React.useRef<number>(0);

  const startHolding = () => {
    if (state !== "idle" || disabled) return;

    setState("holding");
    setProgress(0);
    startTimeRef.current = Date.now();

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min((elapsed / holdDuration) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      }
    }, 16);

    holdTimerRef.current = setTimeout(() => {
      confirmAction();
    }, holdDuration);
  };

  const cancelHolding = () => {
    if (state !== "holding") return;
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    setProgress(0);
    setState("idle");
  };

  const confirmAction = () => {
    setState("processing");
    setProgress(100);
    onHoldComplete();

    setTimeout(() => {
      setState("complete");
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate?.(60);
      }
      setTimeout(() => {
        setState("idle");
        setProgress(0);
      }, completeStateDuration);
    }, 300);
  };

  React.useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  return (
    <button
      type="button"
      className={cn(
        "relative inline-flex h-9 min-w-[120px] select-none items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium shadow-sm",
        "transition-all duration-150 ease-out",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        "disabled:pointer-events-none disabled:opacity-50",
        state === "idle" &&
          "bg-primary text-primary-foreground hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.98]",
        state === "holding" && "bg-primary cursor-grabbing scale-[0.98]",
        state === "processing" && "bg-red-600 text-white",
        state === "complete" && "bg-emerald-500 text-white scale-[1.02]",
        className
      )}
      onMouseDown={startHolding}
      onMouseUp={cancelHolding}
      onMouseLeave={cancelHolding}
      onTouchStart={startHolding}
      onTouchEnd={cancelHolding}
      disabled={disabled || state === "processing"}
    >
      {state === "holding" && (
        <span
          className="absolute inset-0 bg-red-600 origin-left"
          style={{ transform: `scaleX(${progress / 100})` }}
        />
      )}

      <AnimatePresence mode="popLayout">
        {state === "idle" && (
          <motion.span
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={FADE_QUICK}
            className="relative z-10"
          >
            {children}
          </motion.span>
        )}

        {state === "holding" && (
          <motion.span
            key="holding"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={POP_SPRING}
            className="relative z-10 text-white font-medium"
          >
            {holdingText}
          </motion.span>
        )}

        {state === "processing" && (
          <motion.span
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={FADE_QUICK}
            className="relative z-10"
          >
            {processingText}
          </motion.span>
        )}

        {state === "complete" && (
          <motion.span
            key="complete"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={POP_SPRING}
            className="relative z-10 flex items-center gap-2 font-semibold"
          >
            <Check className="h-4 w-4 shrink-0 text-white" />
            <span>{completeText}</span>
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

export { HoldButton };
