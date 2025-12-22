import { useCallback, useState } from "react";
import type { Node, NodeChange, NodePositionChange } from "reactflow";
import type { HelperLine, HelperLinesState } from "./types";
import {
  buildHelperLines,
  calculateSnapOffset,
  findClosestHelperLines,
} from "./utils";

export type UseHelperLinesResult = {
  helperLines: HelperLinesState;
  applyHelperLines: (
    changes: NodeChange[],
    nodes: Node[]
  ) => NodeChange[];
  resetHelperLines: () => void;
};

/**
 * Hook for managing helper lines during node dragging
 */
export function useHelperLines(): UseHelperLinesResult {
  const [helperLines, setHelperLines] = useState<HelperLinesState>({
    horizontal: null,
    vertical: null,
  });

  const applyHelperLines = useCallback(
    (changes: NodeChange[], nodes: Node[]): NodeChange[] => {
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

      // Process each dragging node
      const modifiedChanges = changes.map((change) => {
        if (
          change.type !== "position" ||
          !change.dragging ||
          !change.position
        ) {
          return change;
        }

        // Find the node being dragged
        const node = nodes.find((n) => n.id === change.id);
        if (!node) {
          return change;
        }

        // Create a temporary node with the new position
        const tempNode: Node = {
          ...node,
          position: change.position,
        };

        // Find closest helper lines
        const { horizontal, vertical } = findClosestHelperLines(
          tempNode,
          allHelperLines
        );

        // Calculate snap offset
        const offset = calculateSnapOffset(horizontal, vertical);

        // Update helper lines state (keep the closest ones across all dragged nodes)
        if (horizontal) {
          if (!newHorizontal) {
            newHorizontal = horizontal.line;
          }
        }
        if (vertical) {
          if (!newVertical) {
            newVertical = vertical.line;
          }
        }

        // Apply snap offset to the position
        if (offset.x !== 0 || offset.y !== 0) {
          return {
            ...change,
            position: {
              x: change.position.x + offset.x,
              y: change.position.y + offset.y,
            },
          };
        }

        return change;
      });

      // Update helper lines state
      setHelperLines({
        horizontal: newHorizontal,
        vertical: newVertical,
      });

      return modifiedChanges;
    },
    []
  );

  const resetHelperLines = useCallback(() => {
    setHelperLines({ horizontal: null, vertical: null });
  }, []);

  return {
    helperLines,
    applyHelperLines,
    resetHelperLines,
  };
}
