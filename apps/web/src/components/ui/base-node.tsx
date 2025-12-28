import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";
import type { NodeShape } from "../../store/graphStore";

// Shape class mappings
const getShapeClass = (shape: NodeShape | undefined): string => {
  switch (shape) {
    case "circle":
    case "pill":
      return "rounded-full";
    case "square":
      return "rounded-none";
    default:
      return "rounded-md";
  }
};

export interface BaseNodeProps extends ComponentProps<"div"> {
  selected?: boolean;
  shape?: NodeShape;
}

export function BaseNode({ className, selected, shape, ...props }: BaseNodeProps) {
  const shapeClass = getShapeClass(shape);

  return (
    <div
      className={cn(
        "bg-card text-card-foreground relative shadow-sm transition",
        shapeClass,
        // Selection styling
        selected && "ring-2 ring-muted-foreground ring-offset-0",
        className
      )}
      tabIndex={0}
      {...props}
    />
  );
}

export function BaseNodeHeader({ className, ...props }: ComponentProps<"header">) {
  return (
    <header
      {...props}
      className={cn("flex flex-row items-center justify-between gap-2 px-3 py-2", className)}
    />
  );
}

export function BaseNodeHeaderTitle({ className, ...props }: ComponentProps<"h3">) {
  return (
    <h3
      data-slot="base-node-title"
      className={cn("flex-1 font-semibold select-none", className)}
      {...props}
    />
  );
}

export function BaseNodeContent({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="base-node-content"
      className={cn("flex flex-col gap-y-2 p-3", className)}
      {...props}
    />
  );
}

export function BaseNodeFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="base-node-footer"
      className={cn("flex flex-col items-center gap-y-2 border-t px-3 pt-2 pb-3", className)}
      {...props}
    />
  );
}
