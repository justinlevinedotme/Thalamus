import type { AppEdge, AppNode } from "../../store/graphStore";

export type FocusResult = {
  nodes: AppNode[];
  edges: AppEdge[];
};

export function getFocusSubgraph(
  nodes: AppNode[],
  edges: AppEdge[],
  focusNodeId?: string
): FocusResult {
  if (!focusNodeId) {
    return { nodes, edges };
  }

  const relatedEdges = edges.filter(
    (edge) => edge.source === focusNodeId || edge.target === focusNodeId
  );
  const nodeIds = new Set([
    focusNodeId,
    ...relatedEdges.flatMap((edge) => [edge.source, edge.target]),
  ]);

  return {
    nodes: nodes.filter((node) => nodeIds.has(node.id)),
    edges: edges.filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target)),
  };
}
