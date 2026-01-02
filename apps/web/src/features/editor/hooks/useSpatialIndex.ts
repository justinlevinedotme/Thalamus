import { useMemo } from "react";
import type { Node } from "@xyflow/react";

const CELL_SIZE = 100;

type SpatialIndex = {
  cells: Map<string, Set<string>>;
  nodePositions: Map<string, { x: number; y: number; width: number; height: number }>;
};

function buildSpatialIndex(nodes: Node[]): SpatialIndex {
  const cells = new Map<string, Set<string>>();
  const nodePositions = new Map<string, { x: number; y: number; width: number; height: number }>();

  for (const node of nodes) {
    const width = node.width ?? 144;
    const height = node.height ?? 48;
    nodePositions.set(node.id, { x: node.position.x, y: node.position.y, width, height });

    const minCellX = Math.floor(node.position.x / CELL_SIZE);
    const maxCellX = Math.floor((node.position.x + width) / CELL_SIZE);
    const minCellY = Math.floor(node.position.y / CELL_SIZE);
    const maxCellY = Math.floor((node.position.y + height) / CELL_SIZE);

    for (let cx = minCellX; cx <= maxCellX; cx++) {
      for (let cy = minCellY; cy <= maxCellY; cy++) {
        const key = `${cx},${cy}`;
        if (!cells.has(key)) {
          cells.set(key, new Set());
        }
        cells.get(key)!.add(node.id);
      }
    }
  }

  return { cells, nodePositions };
}

export function queryNearbyNodes(
  index: SpatialIndex,
  x: number,
  y: number,
  radius: number
): string[] {
  const results = new Set<string>();
  const minCellX = Math.floor((x - radius) / CELL_SIZE);
  const maxCellX = Math.floor((x + radius) / CELL_SIZE);
  const minCellY = Math.floor((y - radius) / CELL_SIZE);
  const maxCellY = Math.floor((y + radius) / CELL_SIZE);

  for (let cx = minCellX; cx <= maxCellX; cx++) {
    for (let cy = minCellY; cy <= maxCellY; cy++) {
      const key = `${cx},${cy}`;
      const cellNodes = index.cells.get(key);
      if (cellNodes) {
        for (const nodeId of cellNodes) {
          results.add(nodeId);
        }
      }
    }
  }

  return Array.from(results);
}

export function useSpatialIndex(nodes: Node[]): SpatialIndex {
  return useMemo(() => buildSpatialIndex(nodes), [nodes]);
}
