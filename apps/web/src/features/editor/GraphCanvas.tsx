import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  type Edge,
  type Node,
  type NodeDragHandler,
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
import CanvasContextMenu, { type ContextMenuState } from "./CanvasContextMenu";

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
    selectedEdgeId,
    editingNodeId,
    stopEditingNode,
    addNode,
    setFlowInstance,
    undo,
    redo,
    isFocusMode,
    focusNodeId,
    connectNodes,
  } = useGraphStore();
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);
  const lastCenteredNodeId = useRef<string | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);
  const [proximityTarget, setProximityTarget] = useState<{
    sourceId: string;
    targetId: string;
    sourcePosition: { x: number; y: number };
    targetPosition: { x: number; y: number };
  } | null>(null);
  const PROXIMITY_THRESHOLD = 100;

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
    setContextMenu(null);
  }, [selectEdge, selectNode, stopEditingNode]);

  const handleNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      setContextMenu({
        type: "node",
        nodeId: node.id,
        position: { x: event.clientX, y: event.clientY },
      });
    },
    []
  );

  const handleEdgeContextMenu = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.preventDefault();
      setContextMenu({
        type: "edge",
        edgeId: edge.id,
        position: { x: event.clientX, y: event.clientY },
      });
    },
    []
  );

  const handlePaneContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu({
      type: "pane",
      position: { x: event.clientX, y: event.clientY },
    });
  }, []);

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

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
          body: node.data?.body,
          kind: (node.data?.kind ?? "idea") as NodeKind,
          style: node.data?.style,
        },
        selected: node.id === selectedNodeId,
      })),
    [focusedSubgraph.nodes, selectedNodeId]
  );

  const displayEdges = useMemo(
    () =>
      focusedSubgraph.edges.map((edge) => {
        const isSelected = edge.id === selectedEdgeId;
        const baseColor = edge.data?.style?.color ?? "#94A3B8";
        const baseThickness = edge.data?.style?.thickness ?? 2;
        const lineStyle = edge.data?.style?.lineStyle ?? "solid";
        const labelStyle = edge.data?.style?.labelStyle;

        return {
          ...edge,
          style: {
            stroke: baseColor,
            strokeWidth: isSelected ? baseThickness + 2 : baseThickness,
            strokeDasharray: lineStyle === "dashed" ? "8 4" : undefined,
            filter: isSelected ? "drop-shadow(0 0 3px rgba(100, 116, 139, 0.5))" : undefined,
          },
          labelStyle: labelStyle
            ? {
                fill: labelStyle.textColor,
                fontWeight: 500,
              }
            : undefined,
          labelBgStyle: labelStyle
            ? {
                fill: labelStyle.backgroundColor,
                stroke: labelStyle.showBorder ? labelStyle.borderColor : "transparent",
                strokeWidth: labelStyle.showBorder ? 1 : 0,
              }
            : undefined,
          labelBgPadding: [6, 4] as [number, number],
          labelBgBorderRadius: 4,
          className: isSelected ? "react-flow__edge-selected" : undefined,
          type: edge.data?.style?.curvature
            ? edge.data.style.curvature === "bezier"
              ? "default"
              : edge.data.style.curvature
            : edge.type,
          data: {
            relationType: edge.data?.relationType ?? "related",
            direction: edge.data?.direction ?? "forward",
            style: edge.data?.style,
          },
        };
      }),
    [focusedSubgraph.edges, selectedEdgeId]
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

  const handleNodeDrag: NodeDragHandler = useCallback(
    (_event, draggedNode) => {
      const draggedCenter = {
        x: draggedNode.position.x + (draggedNode.width ?? 150) / 2,
        y: draggedNode.position.y + (draggedNode.height ?? 50) / 2,
      };

      let closestNode: Node | null = null;
      let closestDistance = PROXIMITY_THRESHOLD;

      for (const node of nodes) {
        if (node.id === draggedNode.id) {
          continue;
        }
        // Check if edge already exists
        const edgeExists = edges.some(
          (e) =>
            (e.source === draggedNode.id && e.target === node.id) ||
            (e.source === node.id && e.target === draggedNode.id)
        );
        if (edgeExists) {
          continue;
        }

        const nodeCenter = {
          x: node.position.x + (node.width ?? 150) / 2,
          y: node.position.y + (node.height ?? 50) / 2,
        };
        const distance = Math.sqrt(
          Math.pow(draggedCenter.x - nodeCenter.x, 2) +
            Math.pow(draggedCenter.y - nodeCenter.y, 2)
        );
        if (distance < closestDistance) {
          closestDistance = distance;
          closestNode = node;
        }
      }

      if (closestNode) {
        setProximityTarget({
          sourceId: draggedNode.id,
          targetId: closestNode.id,
          sourcePosition: {
            x: draggedNode.position.x + (draggedNode.width ?? 150) / 2,
            y: draggedNode.position.y + (draggedNode.height ?? 50) / 2,
          },
          targetPosition: {
            x: closestNode.position.x + (closestNode.width ?? 150) / 2,
            y: closestNode.position.y + (closestNode.height ?? 50) / 2,
          },
        });
      } else {
        setProximityTarget(null);
      }
    },
    [nodes, edges, PROXIMITY_THRESHOLD]
  );

  const handleNodeDragStop: NodeDragHandler = useCallback(
    (_event, _node) => {
      if (proximityTarget) {
        connectNodes(proximityTarget.sourceId, proximityTarget.targetId);
        setProximityTarget(null);
      }
    },
    [connectNodes, proximityTarget]
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
        onNodeContextMenu={handleNodeContextMenu}
        onEdgeContextMenu={handleEdgeContextMenu}
        onPaneContextMenu={handlePaneContextMenu}
        onInit={handleInit}
        nodeTypes={nodeTypes}
        selectionOnDrag
        multiSelectionKeyCode="Shift"
        deleteKeyCode={["Backspace", "Delete"]}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onNodeDrag={handleNodeDrag}
        onNodeDragStop={handleNodeDragStop}
        panOnScroll
        zoomOnScroll
        minZoom={0.2}
        maxZoom={2}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={24} size={1} />
        <Controls showInteractive={false} />
      </ReactFlow>
      {/* Proximity Connect Indicator */}
      {proximityTarget && reactFlowInstance && (() => {
        const sourceScreen = reactFlowInstance.flowToScreenPosition(proximityTarget.sourcePosition);
        const targetScreen = reactFlowInstance.flowToScreenPosition(proximityTarget.targetPosition);
        const canvasBounds = document.getElementById("graph-canvas")?.getBoundingClientRect();
        if (!canvasBounds) return null;
        const x1 = sourceScreen.x - canvasBounds.left;
        const y1 = sourceScreen.y - canvasBounds.top;
        const x2 = targetScreen.x - canvasBounds.left;
        const y2 = targetScreen.y - canvasBounds.top;
        return (
          <svg className="pointer-events-none absolute inset-0 z-20 h-full w-full overflow-visible">
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#3B82F6"
              strokeWidth={2}
              strokeDasharray="6 4"
            />
            <circle cx={x2} cy={y2} r={12} fill="#3B82F6" opacity={0.2} />
            <circle cx={x2} cy={y2} r={6} fill="#3B82F6" opacity={0.4} />
            <circle cx={x2} cy={y2} r={3} fill="#3B82F6" />
          </svg>
        );
      })()}
      {/* Custom attribution */}
      <div className="absolute bottom-2 right-2 z-10 flex flex-col items-end gap-0.5">
        <span className="text-xs font-medium text-slate-500">Thalamus</span>
        <a
          href="https://reactflow.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-slate-400 transition hover:text-slate-600"
        >
          Powered by React Flow
        </a>
      </div>
      {/* Context Menu */}
      <CanvasContextMenu menu={contextMenu} onClose={handleCloseContextMenu} />
    </div>
  );
}
