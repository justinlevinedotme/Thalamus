/**
 * @file PasswordStrengthIndicator.tsx
 * @description Visual indicator showing password strength requirements and their status.
 * Displays a checklist of requirements with pass/fail icons.
 */

import { Check, X } from "lucide-react";
import { validatePassword } from "./constants";
import { cn } from "../../lib/utils";

export interface PasswordStrengthIndicatorProps {
  /** The password to validate */
  password: string;
  /** Additional CSS classes */
  className?: string;
  /** Show in compact inline style vs boxed style */
  variant?: "inline" | "boxed";
}

/**
 * Displays password strength requirements with visual feedback.
 * Shows check/x icons for each requirement based on current password.
 */
export function PasswordStrengthIndicator({
  password,
  className,
  variant = "inline",
}: PasswordStrengthIndicatorProps) {
  const validation = validatePassword(password);

  if (variant === "boxed") {
    return (
      <div className={cn("space-y-1.5 rounded-md bg-secondary p-3", className)}>
        <p className="text-xs font-medium text-muted-foreground">Password requirements:</p>
        <div className="grid gap-1">
          {validation.map((req) => (
            <div
              key={req.id}
              className={cn(
                "flex items-center gap-2 text-xs transition-colors",
                req.passed ? "text-green-600" : "text-muted-foreground"
              )}
            >
              {req.passed ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
              {req.label}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("mt-2 space-y-1", className)}>
      {validation.map((req) => (
        <div
          key={req.id}
          className={cn(
            "flex items-center gap-2 text-xs transition-colors",
            req.passed ? "text-green-600" : "text-muted-foreground"
          )}
        >
          {req.passed ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
          <span>{req.label}</span>
        </div>
      ))}
    </div>
  );
}
