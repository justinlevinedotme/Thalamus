import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Edge,
  type ReactFlowInstance,
} from "reactflow";
import "reactflow/dist/style.css";

import {
  type NodeKind,
  type RelationshipData,
  useGraphStore,
} from "../../store/graphStore";
import { nodeTypes } from "./nodeTypes";
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
    editingNodeId,
    stopEditingNode,
    addNode,
    setFlowInstance,
    undo,
    redo,
    isFocusMode,
    focusNodeId,
  } = useGraphStore();
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);
  const lastCenteredNodeId = useRef<string | null>(null);

  const handleInit = useCallback(
    (instance: ReactFlowInstance) => {
      setReactFlowInstance(instance);
      setFlowInstance(instance);
    },
    [setFlowInstance]
  );

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
    stopEditingNode();
  }, [selectEdge, selectNode, stopEditingNode]);

  const focusedSubgraph = useMemo(
    () =>
      isFocusMode ? getFocusSubgraph(nodes, edges, focusNodeId) : { nodes, edges },
    [edges, focusNodeId, isFocusMode, nodes]
  );

  const displayNodes = useMemo(
    () =>
      focusedSubgraph.nodes.map((node) => ({
        ...node,
        type: node.type ?? "editable",
        data: {
          label: node.data?.label ?? "Untitled",
          kind: (node.data?.kind ?? "idea") as NodeKind,
        },
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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (editingNodeId) {
        return;
      }
      if (target) {
        const tag = target.tagName;
        if (
          tag === "INPUT" ||
          tag === "TEXTAREA" ||
          target.isContentEditable
        ) {
          return;
        }
      }
      if (!event.metaKey && !event.ctrlKey) {
        return;
      }
      if (event.key.toLowerCase() !== "z") {
        return;
      }
      event.preventDefault();
      if (event.shiftKey) {
        redo();
      } else {
        undo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editingNodeId, redo, undo]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const nodeKind = event.dataTransfer.getData("application/reactflow");
      if (!nodeKind || !reactFlowInstance) {
        return;
      }
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      addNode({ kind: nodeKind as NodeKind, position });
    },
    [addNode, reactFlowInstance]
  );

  return (
    <div className="h-full w-full" id="graph-canvas">
      <ReactFlow
        nodes={displayNodes}
        edges={displayEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeClick={handleEdgeClick}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        onInit={handleInit}
        nodeTypes={nodeTypes}
        selectionOnDrag
        multiSelectionKeyCode="Shift"
        deleteKeyCode={["Backspace", "Delete"]}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        panOnScroll
        zoomOnScroll
        minZoom={0.2}
        maxZoom={2}
        fitView
      >
        <Background gap={24} size={1} />
        <MiniMap className="bg-white" pannable zoomable />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
