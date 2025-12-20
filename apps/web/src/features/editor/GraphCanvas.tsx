import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  type Edge,
  type ReactFlowInstance,
} from "reactflow";
import "reactflow/dist/style.css";

import {
  type RelationshipData,
  useGraphStore,
} from "../../store/graphStore";
import { getFocusSubgraph } from "../search/focus";

export default function GraphCanvas() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    selectEdge,
    selectNode,
    selectedNodeId,
    isFocusMode,
    focusNodeId,
  } = useGraphStore();
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);
  const lastCenteredNodeId = useRef<string | null>(null);

  const handleEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge<RelationshipData>) => {
      selectEdge(edge.id);
      selectNode(undefined);
    },
    [selectEdge, selectNode]
  );

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: { id: string }) => {
      selectNode(node.id);
      selectEdge(undefined);
    },
    [selectEdge, selectNode]
  );

  const handlePaneClick = useCallback(() => {
    selectEdge(undefined);
    selectNode(undefined);
  }, [selectEdge, selectNode]);

  const focusedSubgraph = useMemo(
    () =>
      isFocusMode ? getFocusSubgraph(nodes, edges, focusNodeId) : { nodes, edges },
    [edges, focusNodeId, isFocusMode, nodes]
  );

  const displayNodes = useMemo(
    () =>
      focusedSubgraph.nodes.map((node) => ({
        ...node,
        selected: node.id === selectedNodeId,
      })),
    [focusedSubgraph.nodes, selectedNodeId]
  );

  const displayEdges = useMemo(
    () =>
      focusedSubgraph.edges.map((edge) => ({
        ...edge,
        data: {
          relationType: edge.data?.relationType ?? "related",
          direction: edge.data?.direction ?? "forward",
        },
      })),
    [focusedSubgraph.edges]
  );

  useEffect(() => {
    if (!reactFlowInstance) {
      return;
    }
    if (!selectedNodeId) {
      lastCenteredNodeId.current = null;
      return;
    }
    if (lastCenteredNodeId.current === selectedNodeId) {
      return;
    }
    const selectedNode = nodes.find((node) => node.id === selectedNodeId);
    if (!selectedNode) {
      return;
    }
    reactFlowInstance.fitView({
      nodes: [selectedNode],
      duration: 300,
      padding: 0.4,
    });
    lastCenteredNodeId.current = selectedNodeId;
  }, [nodes, reactFlowInstance, selectedNodeId]);

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={displayNodes}
        edges={displayEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeClick={handleEdgeClick}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        onInit={setReactFlowInstance}
        fitView
      >
        <Background gap={24} size={1} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
