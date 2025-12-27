import type { Node } from "reactflow";
import type { Box, HelperLine, HelperLineMatch, Orientation } from "./types";
import { ANCHORS, SNAP_THRESHOLD } from "./config";

/**
 * Get the bounding box of a node
 */
export function getNodeBox(node: Node): Box {
  const width = node.width ?? 150;
  const height = node.height ?? 50;
  return {
    x: node.position.x,
    y: node.position.y,
    x2: node.position.x + width,
    y2: node.position.y + height,
    width,
    height,
  };
}

/**
 * Build helper lines from all nodes (excluding the dragged node)
 */
export function buildHelperLines(nodes: Node[], excludeNodeIds: string[]): HelperLine[] {
  const lines: HelperLine[] = [];

  for (const node of nodes) {
    if (excludeNodeIds.includes(node.id)) {
      continue;
    }

    const box = getNodeBox(node);

    for (const [anchorName, anchor] of Object.entries(ANCHORS)) {
      const position = anchor.resolve(node, box);
      lines.push({
        orientation: anchor.orientation,
        position,
        nodeId: node.id,
        anchorName,
      });
    }
  }

  return lines;
}

/**
 * Find the closest helper line for each orientation
 */
export function findClosestHelperLines(
  draggedNode: Node,
  helperLines: HelperLine[]
): { horizontal: HelperLineMatch | null; vertical: HelperLineMatch | null } {
  const box = getNodeBox(draggedNode);

  let closestHorizontal: HelperLineMatch | null = null;
  let closestVertical: HelperLineMatch | null = null;

  for (const line of helperLines) {
    // Check each anchor on the dragged node against this helper line
    for (const [, anchor] of Object.entries(ANCHORS)) {
      if (anchor.orientation !== line.orientation) {
        continue;
      }

      const anchorPosition = anchor.resolve(draggedNode, box);
      const distance = Math.abs(anchorPosition - line.position);

      if (distance > SNAP_THRESHOLD) {
        continue;
      }

      const match: HelperLineMatch = {
        line,
        distance,
        anchorPosition,
      };

      if (line.orientation === "horizontal") {
        if (!closestHorizontal || distance < closestHorizontal.distance) {
          closestHorizontal = match;
        }
      } else {
        if (!closestVertical || distance < closestVertical.distance) {
          closestVertical = match;
        }
      }
    }
  }

  return { horizontal: closestHorizontal, vertical: closestVertical };
}

/**
 * Calculate the snap offset for a node based on helper line matches
 */
export function calculateSnapOffset(
  horizontal: HelperLineMatch | null,
  vertical: HelperLineMatch | null
): { x: number; y: number } {
  let offsetX = 0;
  let offsetY = 0;

  if (vertical) {
    offsetX = vertical.line.position - vertical.anchorPosition;
  }

  if (horizontal) {
    offsetY = horizontal.line.position - horizontal.anchorPosition;
  }

  return { x: offsetX, y: offsetY };
}

/**
 * Get the line extent for rendering (find min/max across all nodes that share this line)
 */
export function getLineExtent(
  line: HelperLine,
  nodes: Node[],
  draggedNode: Node
): { start: number; end: number } {
  const orientation = line.orientation;
  const isHorizontal = orientation === "horizontal";

  // Find all nodes that are aligned to this line
  const alignedNodeIds = new Set<string>([draggedNode.id]);

  // The line's target node
  const targetNode = nodes.find((n) => n.id === line.nodeId);
  if (targetNode) {
    alignedNodeIds.add(targetNode.id);
  }

  // Calculate extent based on the aligned nodes
  let min = Infinity;
  let max = -Infinity;

  for (const node of nodes) {
    if (!alignedNodeIds.has(node.id)) continue;

    const box = getNodeBox(node);

    if (isHorizontal) {
      // For horizontal line, we need the x extent
      min = Math.min(min, box.x);
      max = Math.max(max, box.x2);
    } else {
      // For vertical line, we need the y extent
      min = Math.min(min, box.y);
      max = Math.max(max, box.y2);
    }
  }

  // Add some padding
  const padding = 20;
  return { start: min - padding, end: max + padding };
}
