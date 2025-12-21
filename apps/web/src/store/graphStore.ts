import { create } from "zustand";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  MarkerType,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  type ReactFlowInstance,
} from "reactflow";

export type RelationshipDirection = "forward" | "backward" | "none";
export type RelationshipType = "causes" | "supports" | "contradicts" | "related";
export type NodeKind = "idea" | "question" | "evidence" | "goal";

export type RelationshipData = {
  relationType?: RelationshipType;
  direction?: RelationshipDirection;
};

type GraphNodeData = {
  label: string;
  kind: NodeKind;
};

type GraphSnapshot = {
  nodes: Node<GraphNodeData>[];
  edges: Edge<RelationshipData>[];
};

type GraphState = {
  nodes: Node<GraphNodeData>[];
  edges: Edge<RelationshipData>[];
  graphTitle: string;
  selectedEdgeId?: string;
  selectedNodeId?: string;
  editingNodeId?: string;
  flowInstance: ReactFlowInstance | null;
  isFocusMode: boolean;
  focusNodeId?: string;
  historyPast: GraphSnapshot[];
  historyFuture: GraphSnapshot[];
  canUndo: boolean;
  canRedo: boolean;
  setNodes: (nodes: Node<GraphNodeData>[]) => void;
  setEdges: (edges: Edge<RelationshipData>[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  setGraphTitle: (title: string) => void;
  selectEdge: (edgeId?: string) => void;
  selectNode: (nodeId?: string) => void;
  startEditingNode: (nodeId: string) => void;
  stopEditingNode: () => void;
  setFlowInstance: (instance: ReactFlowInstance | null) => void;
  setFocusNode: (nodeId?: string) => void;
  clearFocus: () => void;
  updateNodeLabel: (nodeId: string, label: string) => void;
  updateEdgeLabel: (edgeId: string, label: string) => void;
  updateEdgeData: (edgeId: string, data: RelationshipData) => void;
  addNode: (input?: {
    position?: { x: number; y: number };
    label?: string;
    kind?: NodeKind;
  }) => void;
  addNodeAtCenter: (kind?: NodeKind) => void;
  undo: () => void;
  redo: () => void;
};

const defaultEdgeData: RelationshipData = {
  relationType: "related",
  direction: "forward",
};

const cloneGraph = (
  nodes: Node<GraphNodeData>[],
  edges: Edge<RelationshipData>[]
): GraphSnapshot => structuredClone({ nodes, edges });

const normalizeNodes = (nodes: Node<GraphNodeData>[]) =>
  nodes.map((node) => ({
    ...node,
    type: node.type ?? "editable",
    data: {
      label: node.data?.label ?? "Untitled",
      kind: node.data?.kind ?? "idea",
    },
  }));

const setHistory = (past: GraphSnapshot[], future: GraphSnapshot[]) => ({
  historyPast: past,
  historyFuture: future,
  canUndo: past.length > 0,
  canRedo: future.length > 0,
});

const shouldCommitNodeChanges = (changes: NodeChange[]) =>
  changes.some((change) => {
    if (change.type === "select") {
      return false;
    }
    if (change.type === "position") {
      return !change.dragging;
    }
    return true;
  });

const shouldCommitEdgeChanges = (changes: EdgeChange[]) =>
  changes.some((change) => change.type !== "select");

const markerForDirection = (direction: RelationshipDirection): {
  markerStart?: { type: MarkerType };
  markerEnd?: { type: MarkerType };
} => {
  if (direction === "backward") {
    return { markerStart: { type: MarkerType.ArrowClosed } };
  }
  if (direction === "none") {
    return {};
  }
  return { markerEnd: { type: MarkerType.ArrowClosed } };
};

export const useGraphStore = create<GraphState>((set, get) => ({
  nodes: [],
  edges: [],
  graphTitle: "Untitled Graph",
  selectedEdgeId: undefined,
  selectedNodeId: undefined,
  editingNodeId: undefined,
  flowInstance: null,
  isFocusMode: false,
  focusNodeId: undefined,
  historyPast: [],
  historyFuture: [],
  canUndo: false,
  canRedo: false,
  setNodes: (nodes) =>
    set({
      nodes: normalizeNodes(nodes),
      ...setHistory([], []),
    }),
  setEdges: (edges) =>
    set({
      edges,
      ...setHistory([], []),
    }),
  onNodesChange: (changes) =>
    set((state) => {
      const nextNodes = applyNodeChanges(changes, state.nodes);
      if (!shouldCommitNodeChanges(changes)) {
        return { nodes: nextNodes };
      }
      return {
        nodes: nextNodes,
        ...setHistory(
          [...state.historyPast, cloneGraph(state.nodes, state.edges)],
          []
        ),
      };
    }),
  onEdgesChange: (changes) =>
    set((state) => {
      const nextEdges = applyEdgeChanges(changes, state.edges);
      if (!shouldCommitEdgeChanges(changes)) {
        return { edges: nextEdges };
      }
      return {
        edges: nextEdges,
        ...setHistory(
          [...state.historyPast, cloneGraph(state.nodes, state.edges)],
          []
        ),
      };
    }),
  onConnect: (connection) =>
    set((state) => ({
      edges: addEdge(
        {
          ...connection,
          label: "relationship",
          data: defaultEdgeData,
          ...markerForDirection(defaultEdgeData.direction ?? "forward"),
        },
        state.edges
      ),
      ...setHistory(
        [...state.historyPast, cloneGraph(state.nodes, state.edges)],
        []
      ),
    })),
  setGraphTitle: (graphTitle) => set({ graphTitle }),
  selectEdge: (edgeId) => set({ selectedEdgeId: edgeId }),
  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),
  startEditingNode: (nodeId) => set({ editingNodeId: nodeId }),
  stopEditingNode: () => set({ editingNodeId: undefined }),
  setFlowInstance: (instance) => set({ flowInstance: instance }),
  setFocusNode: (nodeId) =>
    set({
      focusNodeId: nodeId,
      isFocusMode: Boolean(nodeId),
    }),
  clearFocus: () => set({ focusNodeId: undefined, isFocusMode: false }),
  updateNodeLabel: (nodeId, label) =>
    set((state) => {
      const target = state.nodes.find((node) => node.id === nodeId);
      if (!target || target.data.label === label) {
        return {};
      }
      return {
        nodes: state.nodes.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, label } }
            : node
        ),
        ...setHistory(
          [...state.historyPast, cloneGraph(state.nodes, state.edges)],
          []
        ),
      };
    }),
  updateEdgeLabel: (edgeId, label) =>
    set((state) => {
      const target = state.edges.find((edge) => edge.id === edgeId);
      if (!target || target.label === label) {
        return {};
      }
      return {
        edges: state.edges.map((edge) =>
          edge.id === edgeId ? { ...edge, label } : edge
        ),
        ...setHistory(
          [...state.historyPast, cloneGraph(state.nodes, state.edges)],
          []
        ),
      };
    }),
  updateEdgeData: (edgeId, data) =>
    set((state) => {
      const target = state.edges.find((edge) => edge.id === edgeId);
      if (!target) {
        return {};
      }
      const nextData = { ...target.data, ...data };
      return {
        edges: state.edges.map((edge) => {
        if (edge.id !== edgeId) {
          return edge;
        }
        return {
          ...edge,
          data: nextData,
          ...markerForDirection(nextData.direction ?? "forward"),
        };
      }),
        ...setHistory(
          [...state.historyPast, cloneGraph(state.nodes, state.edges)],
          []
        ),
      };
    }),
  addNode: (input) => {
    const id = crypto.randomUUID();
    const nextNode: Node<GraphNodeData> = {
      id,
      type: "editable",
      position: input?.position ?? { x: 0, y: 0 },
      data: {
        label: input?.label ?? "New node",
        kind: input?.kind ?? "idea",
      },
    };
    set((state) => ({
      nodes: [...state.nodes, nextNode],
      ...setHistory(
        [...state.historyPast, cloneGraph(state.nodes, state.edges)],
        []
      ),
    }));
  },
  addNodeAtCenter: (kind) => {
    const flowInstance = get().flowInstance;
    const canvas = document.getElementById("graph-canvas");
    if (!flowInstance || !canvas) {
      get().addNode({ kind });
      return;
    }
    const bounds = canvas.getBoundingClientRect();
    const position = flowInstance.screenToFlowPosition({
      x: bounds.left + bounds.width / 2,
      y: bounds.top + bounds.height / 2,
    });
    get().addNode({ kind, position });
  },
  undo: () =>
    set((state) => {
      if (state.historyPast.length === 0) {
        return {};
      }
      const previous = state.historyPast[state.historyPast.length - 1];
      const nextPast = state.historyPast.slice(0, -1);
      const nextFuture = [
        cloneGraph(state.nodes, state.edges),
        ...state.historyFuture,
      ];
      return {
        nodes: previous.nodes,
        edges: previous.edges,
        ...setHistory(nextPast, nextFuture),
      };
    }),
  redo: () =>
    set((state) => {
      if (state.historyFuture.length === 0) {
        return {};
      }
      const next = state.historyFuture[0];
      const nextFuture = state.historyFuture.slice(1);
      const nextPast = [
        ...state.historyPast,
        cloneGraph(state.nodes, state.edges),
      ];
      return {
        nodes: next.nodes,
        edges: next.edges,
        ...setHistory(nextPast, nextFuture),
      };
    }),
}));
