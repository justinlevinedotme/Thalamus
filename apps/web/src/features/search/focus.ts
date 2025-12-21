import type { Edge, Node } from "reactflow";

import type { RelationshipData } from "../../store/graphStore";

export type FocusResult = {
  nodes: Node[];
  edges: Edge<RelationshipData>[];
};

export function getFocusSubgraph(
  nodes: Node[],
  edges: Edge<RelationshipData>[],
  focusNodeId?: string
): FocusResult {
  if (!focusNodeId) {
    return { nodes, edges };
  }

  const relatedEdges = edges.filter(
    (edge) => edge.source === focusNodeId || edge.target === focusNodeId
  );
  const nodeIds = new Set(
    [focusNodeId, ...relatedEdges.flatMap((edge) => [edge.source, edge.target])]
  );

  return {
    nodes: nodes.filter((node) => nodeIds.has(node.id)),
    edges: edges.filter(
      (edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target)
    ),
  };
}
