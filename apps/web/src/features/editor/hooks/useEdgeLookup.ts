import { useMemo } from "react";
import type { Edge } from "@xyflow/react";

export function useEdgeLookup(edges: Edge[]): Set<string> {
  return useMemo(() => {
    const lookup = new Set<string>();
    for (const edge of edges) {
      lookup.add(`${edge.source}-${edge.target}`);
      lookup.add(`${edge.target}-${edge.source}`);
    }
    return lookup;
  }, [edges]);
}
