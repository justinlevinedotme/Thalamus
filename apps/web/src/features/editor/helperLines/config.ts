/**
 * @file config.ts
 * @description Configuration constants for helper lines including snap threshold and anchor point definitions
 */

import type { Anchor } from "./types";

// Distance threshold for snapping (in pixels)
export const SNAP_THRESHOLD = 5;

// All anchor points on a node that can snap to helper lines
export const ANCHORS: Record<string, Anchor> = {
  top: {
    orientation: "horizontal",
    resolve: (_, box) => box.y,
  },
  bottom: {
    orientation: "horizontal",
    resolve: (_, box) => box.y2,
  },
  left: {
    orientation: "vertical",
    resolve: (_, box) => box.x,
  },
  right: {
    orientation: "vertical",
    resolve: (_, box) => box.x2,
  },
  centerX: {
    orientation: "vertical",
    resolve: (_, box) => (box.x + box.x2) / 2,
  },
  centerY: {
    orientation: "horizontal",
    resolve: (_, box) => (box.y + box.y2) / 2,
  },
};
