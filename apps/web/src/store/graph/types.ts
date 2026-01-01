/**
 * @file types.ts
 * @description Type definitions for the graph editor store
 */

import type { Edge, Node, ReactFlowInstance } from "@xyflow/react";

export type RelationshipDirection = "forward" | "backward" | "both" | "none";
export type RelationshipType = "causes" | "supports" | "contradicts" | "related";
export type NodeKind =
  | "idea"
  | "question"
  | "evidence"
  | "goal"
  | "text"
  | "shape"
  | "pathKey"
  | "nodeKey"
  | "composed";

export type NodeShape = "rounded" | "pill" | "circle" | "square";
export type NodeSize = "sm" | "md" | "lg";

export type NodeHandle = {
  id: string;
};

export type EdgePadding = "none" | "sm" | "md" | "lg";

// Grid settings for snap-to-grid and grid visibility
export type GridSize = 12 | 24 | 36 | 48;
export type GridStyle = "dots" | "lines";

export type GridSettings = {
  snapEnabled: boolean;
  gridVisible: boolean;
  gridSize: GridSize;
  gridStyle: GridStyle;
};

export type NodeIcon =
  | { type: "emoji"; value: string }
  | { type: "lucide"; value: string }
  | { type: "simple"; value: string };

export type NodeGroup = {
  id: string;
  label: string;
  color: string;
};

export type NodeBorderStyle = "solid" | "dashed" | "dotted";

export type NodeStyle = {
  color: string;
  shape: NodeShape;
  size: NodeSize;
  edgePadding?: EdgePadding;
  textColor?: string;
  bodyTextColor?: string;
  icon?: NodeIcon;
  iconColor?: string;
  separatorColor?: string; // For key nodes separator line
  // Border properties
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: NodeBorderStyle;
};

export type EdgeCurvature = "bezier" | "smoothstep" | "straight";
export type EdgeLineStyle = "solid" | "dashed";
export type EdgeMarkerType = "arrow" | "arrowclosed" | "circle" | "diamond" | "none";
export type EdgeMarkerSize = "xs" | "sm" | "md" | "lg";

export type EdgeLabelStyle = {
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  showBorder: boolean;
};

export type ControlPoint = {
  x: number;
  y: number;
};

export type EdgeStyle = {
  color: string;
  thickness: number;
  curvature: EdgeCurvature;
  lineStyle: EdgeLineStyle;
  labelStyle?: EdgeLabelStyle;
  controlPoints?: ControlPoint[];
  markerStart?: EdgeMarkerType;
  markerEnd?: EdgeMarkerType;
  markerSize?: EdgeMarkerSize;
};

export type RelationshipData = {
  relationType?: RelationshipType;
  direction?: RelationshipDirection;
  style?: EdgeStyle;
};

// Node data type - extends Record<string, unknown> for v12 compatibility
export type GraphNodeData = {
  label: string;
  body?: string;
  kind: NodeKind;
  style?: NodeStyle;
  sourceHandles?: NodeHandle[];
  targetHandles?: NodeHandle[];
  groupId?: string;
  [key: string]: unknown; // Index signature for v12 compatibility
};

// App-wide node type for React Flow v12
export type AppNode = Node<GraphNodeData>;

// Edge type alias for app
export type AppEdge = Edge<RelationshipData>;

export type GraphSnapshot = {
  nodes: AppNode[];
  edges: AppEdge[];
  groups: NodeGroup[];
  gridSettings: GridSettings;
};

export type GraphState = {
  nodes: AppNode[];
  edges: AppEdge[];
  groups: NodeGroup[];
  gridSettings: GridSettings;
  graphTitle: string;
  selectedEdgeId?: string;
  selectedNodeId?: string;
  editingNodeId?: string;
  flowInstance: ReactFlowInstance<AppNode, AppEdge> | null;
  isFocusMode: boolean;
  focusNodeId?: string;
  historyPast: GraphSnapshot[];
  historyFuture: GraphSnapshot[];
  canUndo: boolean;
  canRedo: boolean;
  // Version counter for efficient dirty detection - increments on every data change
  dataVersion: number;
};

export type NodeActions = {
  setNodes: (nodes: AppNode[]) => void;
  onNodesChange: (changes: import("@xyflow/react").NodeChange<AppNode>[]) => void;
  selectNode: (nodeId?: string) => void;
  startEditingNode: (nodeId: string) => void;
  stopEditingNode: () => void;
  updateNodeLabel: (nodeId: string, label: string) => void;
  updateNodeBody: (nodeId: string, body: string) => void;
  updateNodeStyle: (nodeId: string, style: Partial<NodeStyle>) => void;
  updateNodeHandles: (nodeId: string, sourceCount: number, targetCount: number) => void;
  updateNodeLayout: (nodeId: string, layout: unknown) => void;
  setNodeKind: (nodeId: string, kind: NodeKind) => void;
  addNode: (input?: {
    position?: { x: number; y: number };
    label?: string;
    kind?: NodeKind;
    layout?: unknown;
  }) => void;
  addNodeAtCenter: (kind?: NodeKind) => void;
  duplicateNode: (nodeId: string) => void;
  deleteNode: (nodeId: string) => void;
  updateAllNodeStyles: (style: Partial<NodeStyle>) => void;
  updateSelectedNodesStyle: (style: Partial<NodeStyle>) => void;
  deleteSelectedNodes: () => void;
  sendNodeToFront: (nodeId: string) => void;
  sendNodeToBack: (nodeId: string) => void;
};

export type EdgeActions = {
  setEdges: (edges: AppEdge[]) => void;
  onEdgesChange: (changes: import("@xyflow/react").EdgeChange<AppEdge>[]) => void;
  onConnect: (connection: import("@xyflow/react").Connection) => void;
  selectEdge: (edgeId?: string) => void;
  updateEdgeLabel: (edgeId: string, label: string) => void;
  updateEdgeData: (edgeId: string, data: Partial<RelationshipData>) => void;
  updateEdgeStyle: (edgeId: string, style: Partial<EdgeStyle>) => void;
  deleteEdge: (edgeId: string) => void;
  reconnectEdge: (oldEdge: AppEdge, newConnection: import("@xyflow/react").Connection) => void;
  connectNodes: (sourceId: string, targetId: string) => void;
  updateAllEdgeStyles: (style: Partial<EdgeStyle>) => void;
  updateEdgeControlPoints: (edgeId: string, controlPoints: ControlPoint[]) => void;
  clearAllEdgeLabels: () => void;
};

export type HistoryActions = {
  undo: () => void;
  redo: () => void;
};

export type LayoutActions = {
  autoLayout: (options?: import("../../lib/autoLayout").LayoutOptions) => Promise<void>;
  groupSelectedNodes: () => void;
  ungroupNodes: (groupId: string) => void;
  setGroups: (groups: NodeGroup[]) => void;
  setGridSettings: (settings: Partial<GridSettings>) => void;
  snapAllNodesToGrid: () => void;
  distributeNodesHorizontally: () => void;
  distributeNodesVertically: () => void;
  alignNodesLeft: () => void;
  alignNodesRight: () => void;
  alignNodesCenter: () => void;
  alignNodesTop: () => void;
  alignNodesBottom: () => void;
  alignNodesMiddle: () => void;
  selectGroupNodes: (groupId: string) => void;
  getSelectedGroupId: () => string | undefined;
};

export type ClipboardActions = {
  copySelectedNodes: () => void;
  cutSelectedNodes: () => void;
  pasteNodes: () => void;
};

export type CoreActions = {
  setGraphTitle: (title: string) => void;
  setFlowInstance: (instance: ReactFlowInstance<AppNode, AppEdge> | null) => void;
  setFocusNode: (nodeId?: string) => void;
  clearFocus: () => void;
};

export type GraphActions = NodeActions &
  EdgeActions &
  HistoryActions &
  LayoutActions &
  ClipboardActions &
  CoreActions;

export type GraphStore = GraphState & GraphActions;
