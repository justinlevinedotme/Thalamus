import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  type Connection,
  type Edge,
  type Node,
  type NodeChange,
  type NodeDragHandler,
  type ReactFlowInstance,
} from "reactflow";
import "reactflow/dist/style.css";

import {
  type EdgeMarkerSize,
  type EdgeMarkerType,
  getMarkerId,
  type NodeKind,
  type RelationshipData,
  useGraphStore,
} from "../../store/graphStore";
import { useEditorSettingsStore } from "../../store/editorSettingsStore";
import { nodeTypes } from "./nodeTypes";
import { getFocusSubgraph } from "../search/focus";
import CanvasContextMenu, { type ContextMenuState } from "./CanvasContextMenu";
import { useHelperLines, HelperLinesRenderer } from "./helperLines";

// Custom marker definitions for circle and diamond
function CustomMarkerDefs({ edges }: { edges: Array<{ data?: RelationshipData }> }) {
  // Collect unique marker configurations needed
  const markerConfigs = useMemo(() => {
    const configs = new Set<string>();

    for (const edge of edges) {
      const style = edge.data?.style;
      const color = style?.color ?? "#94A3B8";
      const size = style?.markerSize ?? "md";

      const customMarkerTypes: EdgeMarkerType[] = ["circle", "diamond"];
      const markers = [style?.markerStart, style?.markerEnd].filter(Boolean) as EdgeMarkerType[];

      for (const marker of markers) {
        if (customMarkerTypes.includes(marker)) {
          configs.add(JSON.stringify({ type: marker, color, size }));
        }
      }
    }

    return Array.from(configs).map((c) => JSON.parse(c) as { type: EdgeMarkerType; color: string; size: EdgeMarkerSize });
  }, [edges]);

  const sizeToValue = (size: EdgeMarkerSize): number => {
    switch (size) {
      case "xs": return 8;
      case "sm": return 15;
      case "lg": return 35;
      default: return 25;
    }
  };

  if (markerConfigs.length === 0) return null;

  return (
    <svg style={{ position: "absolute", top: 0, left: 0, width: 0, height: 0 }}>
      <defs>
        {markerConfigs.map(({ type, color, size }) => {
          const id = getMarkerId(type, color, size);
          const markerSize = sizeToValue(size);

          if (type === "circle") {
            return (
              <marker
                key={id}
                id={id}
                markerWidth={markerSize}
                markerHeight={markerSize}
                viewBox={`0 0 ${markerSize} ${markerSize}`}
                refX={markerSize / 2}
                refY={markerSize / 2}
                orient="auto"
                markerUnits="userSpaceOnUse"
              >
                <circle
                  cx={markerSize / 2}
                  cy={markerSize / 2}
                  r={markerSize / 2 - 1}
                  fill={color}
                />
              </marker>
            );
          }

          if (type === "diamond") {
            const half = markerSize / 2;
            return (
              <marker
                key={id}
                id={id}
                markerWidth={markerSize}
                markerHeight={markerSize}
                viewBox={`0 0 ${markerSize} ${markerSize}`}
                refX={half}
                refY={half}
                orient="auto"
                markerUnits="userSpaceOnUse"
              >
                <path
                  d={`M ${half} 0 L ${markerSize} ${half} L ${half} ${markerSize} L 0 ${half} Z`}
                  fill={color}
                />
              </marker>
            );
          }

          return null;
        })}
      </defs>
    </svg>
  );
}

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
    reconnectEdge,
  } = useGraphStore();
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);
  const lastCenteredNodeId = useRef<string | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);
  const { helperLines, applyHelperLines, resetHelperLines } = useHelperLines();
  const { helperLinesEnabled, connectionSuggestionsEnabled } = useEditorSettingsStore();
  const [proximityTarget, setProximityTarget] = useState<{
    sourceNodeId: string;
    targetNodeId: string;
    sourceHandlePosition: { x: number; y: number };
    targetHandlePosition: { x: number; y: number };
  } | null>(null);
  const PROXIMITY_THRESHOLD = 80;

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
          sourceHandles: node.data?.sourceHandles,
          targetHandles: node.data?.targetHandles,
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
          // Explicitly pass through marker properties
          markerStart: edge.markerStart,
          markerEnd: edge.markerEnd,
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
      if (!connectionSuggestionsEnabled) {
        return;
      }

      const draggedHeight = draggedNode.height ?? 50;

      // Calculate the dragged node's target handle positions (left side)
      const draggedTargetHandles = draggedNode.data?.targetHandles ?? [{ id: "target" }];
      const draggedTargetPositions = draggedTargetHandles.map((_: unknown, index: number) => ({
        x: draggedNode.position.x,
        y: draggedNode.position.y + ((index + 1) / (draggedTargetHandles.length + 1)) * draggedHeight,
      }));

      let closestMatch: {
        sourceNode: Node;
        sourceHandlePos: { x: number; y: number };
        targetHandlePos: { x: number; y: number };
        distance: number;
      } | null = null;

      for (const node of nodes) {
        if (node.id === draggedNode.id) {
          continue;
        }

        // Check if edge already exists between these nodes
        const edgeExists = edges.some(
          (e) =>
            (e.source === node.id && e.target === draggedNode.id) ||
            (e.source === draggedNode.id && e.target === node.id)
        );
        if (edgeExists) {
          continue;
        }

        const nodeWidth = node.width ?? 150;
        const nodeHeight = node.height ?? 50;

        // Calculate this node's source handle positions (right side)
        const sourceHandles = node.data?.sourceHandles ?? [{ id: "source" }];
        const sourcePositions = sourceHandles.map((_, index) => ({
          x: node.position.x + nodeWidth,
          y: node.position.y + ((index + 1) / (sourceHandles.length + 1)) * nodeHeight,
        }));

        // Find the closest source handle to any of the dragged node's target handles
        for (const sourcePos of sourcePositions) {
          for (const targetPos of draggedTargetPositions) {
            const distance = Math.sqrt(
              Math.pow(sourcePos.x - targetPos.x, 2) +
                Math.pow(sourcePos.y - targetPos.y, 2)
            );
            if (distance < PROXIMITY_THRESHOLD && (!closestMatch || distance < closestMatch.distance)) {
              closestMatch = {
                sourceNode: node,
                sourceHandlePos: sourcePos,
                targetHandlePos: targetPos,
                distance,
              };
            }
          }
        }
      }

      if (closestMatch) {
        setProximityTarget({
          sourceNodeId: closestMatch.sourceNode.id,
          targetNodeId: draggedNode.id,
          sourceHandlePosition: closestMatch.sourceHandlePos,
          targetHandlePosition: closestMatch.targetHandlePos,
        });
      } else {
        setProximityTarget(null);
      }
    },
    [connectionSuggestionsEnabled, nodes, edges, PROXIMITY_THRESHOLD]
  );

  const handleNodeDragStop: NodeDragHandler = useCallback(
    (_event, _node) => {
      if (proximityTarget) {
        connectNodes(proximityTarget.sourceNodeId, proximityTarget.targetNodeId);
        setProximityTarget(null);
      }
      resetHelperLines();
    },
    [connectNodes, proximityTarget, resetHelperLines]
  );

  // Wrap onNodesChange to apply helper lines snapping
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      if (helperLinesEnabled) {
        const modifiedChanges = applyHelperLines(changes, nodes);
        onNodesChange(modifiedChanges);
      } else {
        onNodesChange(changes);
      }
    },
    [applyHelperLines, helperLinesEnabled, nodes, onNodesChange]
  );

  const handleReconnect = useCallback(
    (oldEdge: Edge<RelationshipData>, newConnection: Connection) => {
      reconnectEdge(oldEdge, newConnection);
    },
    [reconnectEdge]
  );

  return (
    <div className="h-full w-full" id="graph-canvas">
      <CustomMarkerDefs edges={edges} />
      <ReactFlow
        nodes={displayNodes}
        edges={displayEdges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onReconnect={handleReconnect}
        onEdgeClick={handleEdgeClick}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        onNodeContextMenu={handleNodeContextMenu}
        onEdgeContextMenu={handleEdgeContextMenu}
        onPaneContextMenu={handlePaneContextMenu}
        onInit={handleInit}
        nodeTypes={nodeTypes}
        selectionOnDrag
        multiSelectionKeyCode={editingNodeId ? null : "Shift"}
        deleteKeyCode={editingNodeId ? null : ["Backspace", "Delete"]}
        selectionKeyCode={editingNodeId ? null : "Shift"}
        panActivationKeyCode={editingNodeId ? null : "Space"}
        disableKeyboardA11y={!!editingNodeId}
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
        {helperLinesEnabled && <HelperLinesRenderer helperLines={helperLines} />}
      </ReactFlow>
      {/* Proximity Connect Indicator */}
      {proximityTarget && reactFlowInstance && (() => {
        const sourceScreen = reactFlowInstance.flowToScreenPosition(proximityTarget.sourceHandlePosition);
        const targetScreen = reactFlowInstance.flowToScreenPosition(proximityTarget.targetHandlePosition);
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
            {/* Highlight at source handle */}
            <circle cx={x1} cy={y1} r={8} fill="#3B82F6" opacity={0.2} />
            <circle cx={x1} cy={y1} r={4} fill="#3B82F6" opacity={0.6} />
            {/* Highlight at target handle */}
            <circle cx={x2} cy={y2} r={8} fill="#3B82F6" opacity={0.2} />
            <circle cx={x2} cy={y2} r={4} fill="#3B82F6" opacity={0.6} />
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
