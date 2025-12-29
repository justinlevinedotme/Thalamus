/**
 * @file types.ts
 * @description TypeScript type definitions for helper lines system including orientations, boxes, anchors, and line matches
 */

import type { Node } from "@xyflow/react";

export type Orientation = "horizontal" | "vertical";

export type Box = {
  x: number;
  y: number;
  x2: number;
  y2: number;
  width: number;
  height: number;
};

export type AnchorResolver = (node: Node, box: Box) => number;

export type Anchor = {
  orientation: Orientation;
  resolve: AnchorResolver;
};

export type HelperLine = {
  orientation: Orientation;
  position: number;
  nodeId: string;
  anchorName: string;
};

export type HelperLineMatch = {
  line: HelperLine;
  distance: number;
  anchorPosition: number;
};

export type HelperLinesState = {
  horizontal: HelperLine | null;
  vertical: HelperLine | null;
};
