/**
 * @file PasswordInput.tsx
 * @description Password input component with show/hide toggle button.
 * Used across login, signup, and password reset flows.
 */

import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input, type InputProps } from "../ui/input";
import { cn } from "../../lib/utils";

export interface PasswordInputProps extends Omit<InputProps, "type"> {
  /** Control visibility externally (optional) */
  showPassword?: boolean;
  /** Callback when visibility changes (optional) */
  onVisibilityChange?: (visible: boolean) => void;
}

/**
 * Password input with integrated show/hide toggle.
 * Supports both controlled and uncontrolled visibility modes.
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, showPassword: controlledShow, onVisibilityChange, ...props }, ref) => {
    const [internalShow, setInternalShow] = useState(false);

    // Use controlled visibility if provided, otherwise use internal state
    const isControlled = controlledShow !== undefined;
    const showPassword = isControlled ? controlledShow : internalShow;

    const toggleVisibility = () => {
      if (isControlled) {
        onVisibilityChange?.(!showPassword);
      } else {
        setInternalShow(!internalShow);
      }
    };

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={showPassword ? "text" : "password"}
          className={cn("pr-10", className)}
          {...props}
        />
        <button
          type="button"
          onClick={toggleVisibility}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
          tabIndex={-1}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";
