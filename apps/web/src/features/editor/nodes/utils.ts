import { flushSync } from "react-dom";
import type { EdgePadding, NodeSize } from "../../../store/graphStore";

// Default text color for nodes (ensures readability on light backgrounds)
export const DEFAULT_TEXT_COLOR = "#1f2937"; // gray-800

/**
 * Strip HTML tags for plain text display
 */
export const stripHtml = (html: string): string => {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
};

/**
 * Size class mappings for node padding and text size
 */
export const getSizeClasses = (size: NodeSize | undefined): string => {
  switch (size) {
    case "sm":
      return "text-xs px-2 py-1";
    case "lg":
      return "text-base px-4 py-3";
    case "md":
    default:
      return "text-sm px-3 py-2";
  }
};

/**
 * Icon size class based on node size
 */
export const getIconSizeClass = (size: NodeSize | undefined): string => {
  switch (size) {
    case "sm":
      return "h-3 w-3";
    case "lg":
      return "h-5 w-5";
    case "md":
    default:
      return "h-4 w-4";
  }
};

/**
 * Convert edge padding setting to pixel offset for handle positioning
 */
export const edgePaddingToOffset = (padding: EdgePadding | undefined): number => {
  switch (padding) {
    case "sm":
      return 8;
    case "md":
      return 16;
    case "lg":
      return 24;
    default:
      return 0;
  }
};

/**
 * Handle group selection on node mousedown
 * Selects all nodes in the same group when shift-clicking or clicking a grouped node
 */
export const handleGroupMouseDown = (
  e: React.MouseEvent,
  groupId: string | undefined,
  selectGroupNodes: (groupId: string) => void
): void => {
  if (groupId) {
    // Use flushSync to ensure group selection happens before React Flow's drag handling
    flushSync(() => {
      selectGroupNodes(groupId);
    });
  }
};
