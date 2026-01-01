import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  type Connection,
  type Edge,
  type NodeChange,
  type OnNodeDrag,
  type ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import {
  type AppEdge,
  type AppNode,
  type NodeKind,
  type RelationshipData,
  useGraphStore,
} from "../../store/graphStore";
import { useEditorSettingsStore } from "../../store/editorSettingsStore";
import { useTheme } from "../../lib/theme";
import { nodeTypes } from "./nodeTypes";
import { getFocusSubgraph } from "../search/focus";
import CanvasContextMenu, { type ContextMenuState } from "./CanvasContextMenu";
import { useHelperLines, HelperLinesRenderer } from "./helperLines";
import { useSpatialIndex, queryNearbyNodes, useEdgeLookup, useCanvasKeyboard } from "./hooks";
import { CustomMarkerDefs } from "./CustomMarkerDefs";
import { GroupBackgrounds } from "./GroupBackgrounds";

export default function GraphCanvas() {
  const {
    nodes,
    edges,
    groups,
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
    deleteSelectedNodes,
    gridSettings,
  } = useGraphStore();

  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance<
    AppNode,
    AppEdge
  > | null>(null);
  const lastCenteredNodeId = useRef<string | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);
  const { helperLines, applyHelperLines, resetHelperLines } = useHelperLines<AppNode>();

  const groupDragRef = useRef<{
    groupId: string;
    draggedNodeId: string;
    initialPositions: Map<string, { x: number; y: number }>;
  } | null>(null);

  const { helperLinesEnabled, connectionSuggestionsEnabled } = useEditorSettingsStore();
  const { resolvedTheme } = useTheme();

  const [proximityTarget, setProximityTarget] = useState<{
    sourceNodeId: string;
    targetNodeId: string;
    sourceHandlePosition: { x: number; y: number };
    targetHandlePosition: { x: number; y: number };
  } | null>(null);

  const PROXIMITY_THRESHOLD = 80;

  const spatialIndex = useSpatialIndex(nodes);
  const edgeLookup = useEdgeLookup(edges);

  useCanvasKeyboard({
    editingNodeId,
    onDelete: deleteSelectedNodes,
    onUndo: undo,
    onRedo: redo,
  });

  useEffect(() => {
    if (!reactFlowInstance) return;
    if (!selectedNodeId) {
      lastCenteredNodeId.current = null;
      return;
    }
    if (lastCenteredNodeId.current === selectedNodeId) return;
    const selectedNode = nodes.find((node) => node.id === selectedNodeId);
    if (!selectedNode) return;
    reactFlowInstance.fitView({
      nodes: [selectedNode],
      duration: 300,
      padding: 0.4,
    });
    lastCenteredNodeId.current = selectedNodeId;
  }, [nodes, reactFlowInstance, selectedNodeId]);

  const handleInit = useCallback(
    (instance: ReactFlowInstance<AppNode, AppEdge>) => {
      setReactFlowInstance(instance);
      setFlowInstance(instance);
    },
    [setFlowInstance]
  );

  const handleEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: AppEdge) => {
      selectEdge(edge.id);
      selectNode(undefined);
    },
    [selectEdge, selectNode]
  );

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: AppNode) => {
      selectNode(node.id);
      selectEdge(undefined);
    },
    [selectEdge, selectNode]
  );

  const handlePaneClick = useCallback(
    (_event: MouseEvent | React.MouseEvent) => {
      selectEdge(undefined);
      selectNode(undefined);
      stopEditingNode();
      setContextMenu(null);
    },
    [selectEdge, selectNode, stopEditingNode]
  );

  const handleNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: AppNode) => {
      event.preventDefault();
      const selectedNodes = nodes.filter((n) => n.selected);
      if (selectedNodes.length > 1 && node.selected) {
        setContextMenu({
          type: "selection",
          position: { x: event.clientX, y: event.clientY },
        });
      } else {
        setContextMenu({
          type: "node",
          nodeId: node.id,
          position: { x: event.clientX, y: event.clientY },
        });
      }
    },
    [nodes]
  );

  const handleEdgeContextMenu = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.preventDefault();
    setContextMenu({
      type: "edge",
      edgeId: edge.id,
      position: { x: event.clientX, y: event.clientY },
    });
  }, []);

  const handlePaneContextMenu = useCallback((event: MouseEvent | React.MouseEvent) => {
    event.preventDefault();
    setContextMenu({
      type: "pane",
      position: { x: event.clientX, y: event.clientY },
    });
  }, []);

  const handleSelectionContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu({
      type: "selection",
      position: { x: event.clientX, y: event.clientY },
    });
  }, []);

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const focusedSubgraph = useMemo(
    () => (isFocusMode ? getFocusSubgraph(nodes, edges, focusNodeId) : { nodes, edges }),
    [edges, focusNodeId, isFocusMode, nodes]
  );

  const displayNodes = useMemo(
    (): AppNode[] =>
      focusedSubgraph.nodes.map((node) => ({
        ...node,
        type: node.type ?? "editable",
        data: {
          ...node.data,
          label: node.data?.label ?? "Untitled",
          body: node.data?.body,
          kind: (node.data?.kind ?? "idea") as NodeKind,
          style: node.data?.style,
          sourceHandles: node.data?.sourceHandles,
          targetHandles: node.data?.targetHandles,
          groupId: node.data?.groupId,
        },
      })),
    [focusedSubgraph.nodes]
  );

  const defaultEdgeColor = resolvedTheme === "dark" ? "#6b7280" : "#94A3B8";

  const displayEdges = useMemo(
    (): AppEdge[] =>
      focusedSubgraph.edges.map((edge) => {
        const isSelected = edge.id === selectedEdgeId;
        const baseColor = edge.data?.style?.color ?? defaultEdgeColor;
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
          markerStart: edge.markerStart,
          markerEnd: edge.markerEnd,
          labelStyle: labelStyle ? { fill: labelStyle.textColor, fontWeight: 500 } : undefined,
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
    [focusedSubgraph.edges, selectedEdgeId, defaultEdgeColor]
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const nodeKind = event.dataTransfer.getData("application/reactflow");
      if (!nodeKind || !reactFlowInstance) return;
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      addNode({ kind: nodeKind as NodeKind, position });
    },
    [addNode, reactFlowInstance]
  );

  const handleNodeDragStart: OnNodeDrag<AppNode> = useCallback(
    (_event, draggedNode) => {
      const groupId = draggedNode.data?.groupId;
      if (!groupId) {
        groupDragRef.current = null;
        return;
      }

      const groupNodes = nodes.filter((n) => n.data?.groupId === groupId);
      if (groupNodes.length <= 1) {
        groupDragRef.current = null;
        return;
      }

      const initialPositions = new Map<string, { x: number; y: number }>();
      for (const node of groupNodes) {
        initialPositions.set(node.id, { ...node.position });
      }

      groupDragRef.current = {
        groupId,
        draggedNodeId: draggedNode.id,
        initialPositions,
      };

      const selectionChanges: NodeChange<AppNode>[] = nodes.map((node) => ({
        type: "select" as const,
        id: node.id,
        selected: node.data?.groupId === groupId,
      }));
      onNodesChange(selectionChanges);
    },
    [nodes, onNodesChange]
  );

  const handleNodeDrag: OnNodeDrag<AppNode> = useCallback(
    (_event, draggedNode) => {
      if (groupDragRef.current && groupDragRef.current.draggedNodeId === draggedNode.id) {
        const { initialPositions, draggedNodeId } = groupDragRef.current;
        const draggedInitialPos = initialPositions.get(draggedNodeId);

        if (draggedInitialPos) {
          const deltaX = draggedNode.position.x - draggedInitialPos.x;
          const deltaY = draggedNode.position.y - draggedInitialPos.y;

          const positionChanges: NodeChange<AppNode>[] = [];
          for (const [nodeId, initialPos] of initialPositions) {
            if (nodeId !== draggedNodeId) {
              positionChanges.push({
                type: "position",
                id: nodeId,
                position: { x: initialPos.x + deltaX, y: initialPos.y + deltaY },
                dragging: true,
              });
            }
          }

          if (positionChanges.length > 0) {
            onNodesChange(positionChanges);
          }
        }
      }

      if (!connectionSuggestionsEnabled || !reactFlowInstance) return;

      const draggedInternalNode = reactFlowInstance.getInternalNode(draggedNode.id);
      if (!draggedInternalNode) return;

      const draggedTargetBounds = draggedInternalNode.internals.handleBounds?.target ?? [];
      const draggedTargetPositions = draggedTargetBounds.map((handle) => ({
        x: draggedNode.position.x + handle.x + handle.width / 2,
        y: draggedNode.position.y + handle.y + handle.height / 2,
      }));

      if (draggedTargetPositions.length === 0) {
        const draggedHeight = draggedNode.height ?? 48;
        const draggedTargetHandles = draggedNode.data?.targetHandles ?? [{ id: "target" }];
        draggedTargetHandles.forEach((_: unknown, index: number) => {
          draggedTargetPositions.push({
            x: draggedNode.position.x,
            y:
              draggedNode.position.y +
              ((index + 1) / (draggedTargetHandles.length + 1)) * draggedHeight,
          });
        });
      }

      let closestMatch: {
        sourceNodeId: string;
        sourceHandlePos: { x: number; y: number };
        targetHandlePos: { x: number; y: number };
        distance: number;
      } | null = null;

      const nearbyNodeIds = queryNearbyNodes(
        spatialIndex,
        draggedNode.position.x,
        draggedNode.position.y,
        PROXIMITY_THRESHOLD + 200
      );

      for (const nodeId of nearbyNodeIds) {
        if (nodeId === draggedNode.id) continue;
        if (edgeLookup.has(`${nodeId}-${draggedNode.id}`)) continue;

        const node = nodes.find((n) => n.id === nodeId);
        if (!node) continue;

        const internalNode = reactFlowInstance.getInternalNode(nodeId);
        const sourceBounds = internalNode?.internals.handleBounds?.source ?? [];

        let sourcePositions: { x: number; y: number }[];
        if (sourceBounds.length > 0) {
          sourcePositions = sourceBounds.map((handle) => ({
            x: node.position.x + handle.x + handle.width / 2,
            y: node.position.y + handle.y + handle.height / 2,
          }));
        } else {
          const nodeWidth = node.width ?? 144;
          const nodeHeight = node.height ?? 48;
          const sourceHandles = node.data?.sourceHandles ?? [{ id: "source" }];
          sourcePositions = sourceHandles.map((_, index) => ({
            x: node.position.x + nodeWidth,
            y: node.position.y + ((index + 1) / (sourceHandles.length + 1)) * nodeHeight,
          }));
        }

        for (const sourcePos of sourcePositions) {
          for (const targetPos of draggedTargetPositions) {
            const distance = Math.sqrt(
              Math.pow(sourcePos.x - targetPos.x, 2) + Math.pow(sourcePos.y - targetPos.y, 2)
            );
            if (
              distance < PROXIMITY_THRESHOLD &&
              (!closestMatch || distance < closestMatch.distance)
            ) {
              closestMatch = {
                sourceNodeId: nodeId,
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
          sourceNodeId: closestMatch.sourceNodeId,
          targetNodeId: draggedNode.id,
          sourceHandlePosition: closestMatch.sourceHandlePos,
          targetHandlePosition: closestMatch.targetHandlePos,
        });
      } else {
        setProximityTarget(null);
      }
    },
    [
      connectionSuggestionsEnabled,
      reactFlowInstance,
      nodes,
      spatialIndex,
      edgeLookup,
      PROXIMITY_THRESHOLD,
      onNodesChange,
    ]
  );

  const handleNodeDragStop: OnNodeDrag<AppNode> = useCallback(
    (_event, _node) => {
      groupDragRef.current = null;
      if (proximityTarget) {
        connectNodes(proximityTarget.sourceNodeId, proximityTarget.targetNodeId);
        setProximityTarget(null);
      }
      resetHelperLines();
    },
    [connectNodes, proximityTarget, resetHelperLines]
  );

  const handleNodesChange = useCallback(
    (changes: NodeChange<AppNode>[]) => {
      let modifiedChanges: NodeChange<AppNode>[] = changes;

      const selectionChanges = changes.filter(
        (c): c is NodeChange & { type: "select"; selected: boolean } => c.type === "select"
      );

      if (selectionChanges.length > 0) {
        const nodesBeingSelected = selectionChanges.filter((c) => c.selected);

        if (nodesBeingSelected.length === 1) {
          const selectedNodeId = nodesBeingSelected[0].id;
          const selectedNode = nodes.find((n) => n.id === selectedNodeId);
          const groupId = selectedNode?.data?.groupId;

          if (groupId) {
            const groupNodeIds = nodes.filter((n) => n.data?.groupId === groupId).map((n) => n.id);
            const nodesBeingDeselected = selectionChanges.filter((c) => !c.selected);
            const isRegularClick = nodesBeingDeselected.length > 0;

            if (isRegularClick) {
              const additionalSelections: NodeChange<AppNode>[] = groupNodeIds
                .filter((id) => id !== selectedNodeId)
                .map((id) => ({ type: "select" as const, id, selected: true }));

              modifiedChanges = changes.filter((c) => {
                if (c.type === "select" && !c.selected) {
                  return !groupNodeIds.includes(c.id);
                }
                return true;
              });

              modifiedChanges = [...modifiedChanges, ...additionalSelections];
            }
          }
        }
      }

      if (helperLinesEnabled && !groupDragRef.current) {
        modifiedChanges = applyHelperLines(modifiedChanges, nodes);
      }

      onNodesChange(modifiedChanges);
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
        onSelectionContextMenu={handleSelectionContextMenu}
        onInit={handleInit}
        nodeTypes={nodeTypes}
        selectionOnDrag
        multiSelectionKeyCode={editingNodeId ? null : "Shift"}
        deleteKeyCode={null}
        selectionKeyCode={editingNodeId ? null : "Shift"}
        panActivationKeyCode={editingNodeId ? null : "Space"}
        disableKeyboardA11y={!!editingNodeId}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onNodeDragStart={handleNodeDragStart}
        onNodeDrag={handleNodeDrag}
        onNodeDragStop={handleNodeDragStop}
        panOnScroll
        zoomOnScroll
        minZoom={0.2}
        maxZoom={2}
        fitView
        colorMode={resolvedTheme}
        proOptions={{ hideAttribution: true }}
        snapToGrid={gridSettings.snapEnabled}
        snapGrid={[gridSettings.gridSize, gridSettings.gridSize]}
        defaultEdgeOptions={{ zIndex: 0 }}
        elevateNodesOnSelect={false}
      >
        {gridSettings.gridVisible && (
          <Background
            variant={
              gridSettings.gridStyle === "lines" ? BackgroundVariant.Lines : BackgroundVariant.Dots
            }
            gap={gridSettings.gridSize}
            size={gridSettings.gridStyle === "lines" ? 0.5 : 1}
            color={gridSettings.gridStyle === "lines" ? "rgba(255, 255, 255, 0.05)" : undefined}
            className={gridSettings.gridStyle === "lines" ? "opacity-50" : undefined}
          />
        )}
        <GroupBackgrounds groups={groups} nodes={nodes} />
        <Controls showInteractive={false} />
        {helperLinesEnabled && <HelperLinesRenderer helperLines={helperLines} />}
      </ReactFlow>
      {proximityTarget &&
        reactFlowInstance &&
        (() => {
          const sourceScreen = reactFlowInstance.flowToScreenPosition(
            proximityTarget.sourceHandlePosition
          );
          const targetScreen = reactFlowInstance.flowToScreenPosition(
            proximityTarget.targetHandlePosition
          );
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
              <circle cx={x1} cy={y1} r={8} fill="#3B82F6" opacity={0.2} />
              <circle cx={x1} cy={y1} r={4} fill="#3B82F6" opacity={0.6} />
              <circle cx={x2} cy={y2} r={8} fill="#3B82F6" opacity={0.2} />
              <circle cx={x2} cy={y2} r={4} fill="#3B82F6" opacity={0.6} />
            </svg>
          );
        })()}
      <div className="absolute bottom-2 right-2 z-10 flex flex-col items-end gap-0.5">
        <span className="text-xs font-medium text-muted-foreground">Thalamus</span>
        <a
          href="https://reactflow.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground/70 transition hover:text-foreground"
        >
          Powered by React Flow
        </a>
      </div>
      <CanvasContextMenu menu={contextMenu} onClose={handleCloseContextMenu} />
    </div>
  );
}
