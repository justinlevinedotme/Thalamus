import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";
import { buttonVariants } from "./button";

const toggleGroupVariants = cva("inline-flex rounded-md", {
  variants: {
    variant: {
      default: "bg-transparent",
      outline: "border border-slate-200",
    },
    size: {
      default: "h-9",
      sm: "h-8",
      lg: "h-10",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

// Context to track selected value
const ToggleGroupContext = React.createContext<{
  value?: string | string[];
  type?: "single" | "multiple";
}>({});

const ToggleGroup = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> &
    VariantProps<typeof toggleGroupVariants>
>(({ className, variant, size, ...props }, ref) => (
  <ToggleGroupContext.Provider value={{ value: props.value, type: props.type }}>
    <ToggleGroupPrimitive.Root
      ref={ref}
      className={cn(toggleGroupVariants({ variant, size, className }))}
      {...props}
    />
  </ToggleGroupContext.Provider>
));
ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName;

const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> &
    VariantProps<typeof buttonVariants>
>(({ className, variant, size, value, ...props }, ref) => {
  const context = React.useContext(ToggleGroupContext);

  const isSelected = context.type === "multiple"
    ? Array.isArray(context.value) && context.value.includes(value)
    : context.value === value;

  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      value={value}
      className={cn(
        buttonVariants({ variant, size }),
        isSelected && "!bg-slate-200 !text-slate-900",
        className
      )}
      {...props}
    />
  );
});
ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;

export { ToggleGroup, ToggleGroupItem };
