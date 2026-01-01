/**
 * @file alert.tsx
 * @description Semantic alert component for displaying contextual messages.
 * Simple style: neutral background with colored icon.
 */

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AlertTriangle, Info, CheckCircle2, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-md border border-border bg-card p-4 text-sm text-foreground [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:size-5 [&>svg+div]:pl-8",
  {
    variants: {
      variant: {
        default: "[&>svg]:text-muted-foreground",
        info: "[&>svg]:text-blue-500",
        warning: "[&>svg]:text-amber-500",
        destructive: "[&>svg]:text-red-600",
        success: "[&>svg]:text-green-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const alertIconMap = {
  default: null,
  info: Info,
  warning: AlertTriangle,
  destructive: XCircle,
  success: CheckCircle2,
};

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {
  /** Override the default icon for the variant */
  icon?: React.ReactNode;
  /** Hide the icon entirely */
  hideIcon?: boolean;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", icon, hideIcon, children, ...props }, ref) => {
    const IconComponent = alertIconMap[variant || "default"];
    const showIcon = !hideIcon && (icon || IconComponent);

    return (
      <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props}>
        {showIcon && (icon || (IconComponent && <IconComponent />))}
        <div>{children}</div>
      </div>
    );
  }
);
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn("font-medium leading-tight tracking-tight", className)}
      {...props}
    />
  )
);
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("mt-1 text-sm opacity-80", className)} {...props} />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription, alertVariants };
