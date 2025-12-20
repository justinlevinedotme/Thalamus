import { useCallback, useMemo } from "react";
import ReactFlow, { Background, Controls, type Edge } from "reactflow";
import "reactflow/dist/style.css";

import {
  type RelationshipData,
  useGraphStore,
} from "../../store/graphStore";

export default function GraphCanvas() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    selectEdge,
  } = useGraphStore();

  const handleEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge<RelationshipData>) => {
      selectEdge(edge.id);
    },
    [selectEdge]
  );

  const handlePaneClick = useCallback(() => {
    selectEdge(undefined);
  }, [selectEdge]);

  const edgesWithDefaults = useMemo(
    () =>
      edges.map((edge) => ({
        ...edge,
        data: {
          relationType: edge.data?.relationType ?? "related",
          direction: edge.data?.direction ?? "forward",
        },
      })),
    [edges]
  );

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edgesWithDefaults}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeClick={handleEdgeClick}
        onPaneClick={handlePaneClick}
        fitView
      >
        <Background gap={24} size={1} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
