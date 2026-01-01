/**
 * @file verify-button.tsx
 * @description A button that shows animated states for verification flows.
 * Idle → Loading → Success (green) or Error (red)
 */

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const POP_SPRING = { type: "spring", stiffness: 500, damping: 25 } as const;
const FADE_QUICK = { duration: 0.1, ease: "easeOut" } as const;

export interface VerifyButtonProps {
  /** Callback when clicked */
  onClick: () => Promise<boolean> | boolean | void;
  /** Text to show while idle */
  children: React.ReactNode;
  /** Text to show while loading (default: "Verifying...") */
  loadingText?: string;
  /** Text to show on success (default: "Verified") */
  successText?: string;
  /** Text to show on error (default: "Failed") */
  errorText?: string;
  /** How long to show success/error state in ms (default: 1200) */
  resultDuration?: number;
  /** Callback after success state completes */
  onSuccess?: () => void;
  /** Callback after error state completes */
  onError?: () => void;
  /** Additional class names */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
}

function VerifyButton({
  className,
  children,
  onClick,
  loadingText = "Verifying...",
  successText = "Verified",
  errorText = "Failed",
  resultDuration = 1200,
  onSuccess,
  onError,
  disabled,
}: VerifyButtonProps) {
  const [state, setState] = React.useState<"idle" | "loading" | "success" | "error">("idle");

  const handleClick = async () => {
    if (state !== "idle" || disabled) return;

    setState("loading");

    try {
      const result = await onClick();

      if (result === false) {
        setState("error");
        setTimeout(() => {
          setState("idle");
          onError?.();
        }, resultDuration);
      } else {
        setState("success");
        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
          navigator.vibrate?.(60);
        }
        setTimeout(() => {
          setState("idle");
          onSuccess?.();
        }, resultDuration);
      }
    } catch {
      setState("error");
      setTimeout(() => {
        setState("idle");
        onError?.();
      }, resultDuration);
    }
  };

  return (
    <button
      type="button"
      className={cn(
        "relative inline-flex h-9 min-w-[120px] select-none items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium shadow-sm",
        "transition-all duration-150 ease-out",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        state === "idle" &&
          "bg-primary text-primary-foreground hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.98]",
        state === "idle" && disabled && "opacity-50 pointer-events-none",
        state === "loading" && "bg-primary text-primary-foreground pointer-events-none",
        state === "success" && "bg-emerald-500 text-white pointer-events-none scale-[1.02]",
        state === "error" && "bg-red-500 text-white pointer-events-none",
        className
      )}
      onClick={handleClick}
      disabled={disabled && state === "idle"}
    >
      <AnimatePresence mode="popLayout">
        {state === "loading" && (
          <motion.span
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={FADE_QUICK}
            className="flex items-center gap-2"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{loadingText}</span>
          </motion.span>
        )}

        {state === "success" && (
          <motion.span
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={POP_SPRING}
            className="flex items-center gap-2 font-semibold"
          >
            <Check className="h-4 w-4" />
            <span>{successText}</span>
          </motion.span>
        )}

        {state === "error" && (
          <motion.span
            key="error"
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 4 }}
            transition={POP_SPRING}
            className="flex items-center gap-2 font-semibold"
          >
            <X className="h-4 w-4" />
            <span>{errorText}</span>
          </motion.span>
        )}

        {state === "idle" && (
          <motion.span
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={FADE_QUICK}
          >
            {children}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

export { VerifyButton };
