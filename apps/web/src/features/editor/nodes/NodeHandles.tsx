/**
 * @file NodeHandles.tsx
 * @description Handle components for node connections with automatic vertical distribution and edge padding support
 */

import { Handle, Position } from "@xyflow/react";
import type { NodeHandle, EdgePadding } from "../../../store/graphStore";
import { edgePaddingToOffset } from "./utils";

export interface NodeHandlesProps {
  sourceHandles?: NodeHandle[];
  targetHandles?: NodeHandle[];
  edgePadding?: EdgePadding;
}

/**
 * Renders source and target handles for a node
 * - Target handles appear on the left side
 * - Source handles appear on the right side
 * - Handles are evenly distributed vertically
 * - Edge padding offsets the handles from the node edge
 */
export function NodeHandles({
  sourceHandles = [{ id: "source" }],
  targetHandles = [{ id: "target" }],
  edgePadding,
}: NodeHandlesProps) {
  const paddingOffset = edgePaddingToOffset(edgePadding);

  return (
    <>
      {/* Target handles (left side) */}
      {targetHandles.map((handle, index) => (
        <Handle
          key={handle.id}
          id={handle.id}
          type="target"
          position={Position.Left}
          style={{
            top: `${((index + 1) / (targetHandles.length + 1)) * 100}%`,
            left: -paddingOffset,
          }}
        />
      ))}

      {/* Source handles (right side) */}
      {sourceHandles.map((handle, index) => (
        <Handle
          key={handle.id}
          id={handle.id}
          type="source"
          position={Position.Right}
          style={{
            top: `${((index + 1) / (sourceHandles.length + 1)) * 100}%`,
            right: -paddingOffset,
          }}
        />
      ))}
    </>
  );
}
