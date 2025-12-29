/**
 * @file useHelperLines.ts
 * @description React hook for managing helper lines state and applying snap-to-align behavior during node dragging
 */

import { useCallback, useState } from "react";
import type { Node, NodeChange, NodePositionChange } from "@xyflow/react";
import type { HelperLine, HelperLinesState } from "./types";
import { buildHelperLines, calculateSnapOffset, findClosestHelperLines } from "./utils";

export type UseHelperLinesResult<T extends Node = Node> = {
  helperLines: HelperLinesState;
  applyHelperLines: (changes: NodeChange<T>[], nodes: T[]) => NodeChange<T>[];
  resetHelperLines: () => void;
};

/**
 * Hook for managing helper lines during node dragging
 */
export function useHelperLines<T extends Node = Node>(): UseHelperLinesResult<T> {
  const [helperLines, setHelperLines] = useState<HelperLinesState>({
    horizontal: null,
    vertical: null,
  });

  const applyHelperLines = useCallback((changes: NodeChange<T>[], nodes: T[]): NodeChange<T>[] => {
    // Find position changes that are actively dragging
    const positionChanges = changes.filter(
      (change): change is NodePositionChange =>
        change.type === "position" && change.dragging === true
    );

    if (positionChanges.length === 0) {
      return changes;
    }

    // Get the IDs of nodes being dragged
    const draggingNodeIds = positionChanges.map((c) => c.id);

    // Build helper lines from all non-dragged nodes
    const allHelperLines = buildHelperLines(nodes, draggingNodeIds);

    let newHorizontal: HelperLine | null = null;
    let newVertical: HelperLine | null = null;

    // When multiple nodes are being dragged (group/multi-select),
    // calculate snap offset based on the FIRST dragged node only,
    // then apply the same offset to ALL dragged nodes.
    // This prevents group nodes from snapping to different positions.
    let sharedOffset: { x: number; y: number } | null = null;

    if (positionChanges.length > 1) {
      // Multi-node drag: calculate offset from first node
      const firstChange = positionChanges[0];
      if (firstChange.position) {
        const firstNode = nodes.find((n) => n.id === firstChange.id);
        if (firstNode) {
          const tempNode: Node = {
            ...firstNode,
            position: firstChange.position,
          };
          const { horizontal, vertical } = findClosestHelperLines(tempNode, allHelperLines);
          sharedOffset = calculateSnapOffset(horizontal, vertical);
          if (horizontal) newHorizontal = horizontal.line;
          if (vertical) newVertical = vertical.line;
        }
      }
    }

    // Process each dragging node
    const modifiedChanges = changes.map((change) => {
      if (change.type !== "position" || !change.dragging || !change.position) {
        return change;
      }

      // If we have a shared offset (multi-node drag), apply it to all
      if (sharedOffset && (sharedOffset.x !== 0 || sharedOffset.y !== 0)) {
        return {
          ...change,
          position: {
            x: change.position.x + sharedOffset.x,
            y: change.position.y + sharedOffset.y,
          },
        };
      }

      // Single node drag: calculate offset for this specific node
      if (positionChanges.length === 1) {
        const node = nodes.find((n) => n.id === change.id);
        if (!node) {
          return change;
        }

        const tempNode: Node = {
          ...node,
          position: change.position,
        };

        const { horizontal, vertical } = findClosestHelperLines(tempNode, allHelperLines);

        const offset = calculateSnapOffset(horizontal, vertical);

        if (horizontal) newHorizontal = horizontal.line;
        if (vertical) newVertical = vertical.line;

        if (offset.x !== 0 || offset.y !== 0) {
          return {
            ...change,
            position: {
              x: change.position.x + offset.x,
              y: change.position.y + offset.y,
            },
          };
        }
      }

      return change;
    });

    // Update helper lines state
    setHelperLines({
      horizontal: newHorizontal,
      vertical: newVertical,
    });

    return modifiedChanges;
  }, []);

  const resetHelperLines = useCallback(() => {
    setHelperLines({ horizontal: null, vertical: null });
  }, []);

  return {
    helperLines,
    applyHelperLines,
    resetHelperLines,
  };
}
