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
} from "reactflow";

export type RelationshipDirection = "forward" | "backward" | "none";
export type RelationshipType = "causes" | "supports" | "contradicts" | "related";

export type RelationshipData = {
  relationType?: RelationshipType;
  direction?: RelationshipDirection;
};

type GraphNodeData = {
  label: string;
};

type GraphState = {
  nodes: Node<GraphNodeData>[];
  edges: Edge<RelationshipData>[];
  graphTitle: string;
  selectedEdgeId?: string;
  selectedNodeId?: string;
  isFocusMode: boolean;
  focusNodeId?: string;
  setNodes: (nodes: Node<GraphNodeData>[]) => void;
  setEdges: (edges: Edge<RelationshipData>[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  setGraphTitle: (title: string) => void;
  selectEdge: (edgeId?: string) => void;
  selectNode: (nodeId?: string) => void;
  setFocusNode: (nodeId?: string) => void;
  clearFocus: () => void;
  updateEdgeLabel: (edgeId: string, label: string) => void;
  updateEdgeData: (edgeId: string, data: RelationshipData) => void;
  addNode: (position?: { x: number; y: number }) => void;
};

const defaultEdgeData: RelationshipData = {
  relationType: "related",
  direction: "forward",
};

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
  isFocusMode: false,
  focusNodeId: undefined,
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  onNodesChange: (changes) =>
    set({ nodes: applyNodeChanges(changes, get().nodes) }),
  onEdgesChange: (changes) =>
    set({ edges: applyEdgeChanges(changes, get().edges) }),
  onConnect: (connection) =>
    set({
      edges: addEdge(
        {
          ...connection,
          label: "relationship",
          data: defaultEdgeData,
          ...markerForDirection(defaultEdgeData.direction ?? "forward"),
        },
        get().edges
      ),
    }),
  setGraphTitle: (graphTitle) => set({ graphTitle }),
  selectEdge: (edgeId) => set({ selectedEdgeId: edgeId }),
  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),
  setFocusNode: (nodeId) =>
    set({
      focusNodeId: nodeId,
      isFocusMode: Boolean(nodeId),
    }),
  clearFocus: () => set({ focusNodeId: undefined, isFocusMode: false }),
  updateEdgeLabel: (edgeId, label) =>
    set({
      edges: get().edges.map((edge) =>
        edge.id === edgeId ? { ...edge, label } : edge
      ),
    }),
  updateEdgeData: (edgeId, data) =>
    set({
      edges: get().edges.map((edge) => {
        if (edge.id !== edgeId) {
          return edge;
        }
        const nextData = { ...edge.data, ...data };
        return {
          ...edge,
          data: nextData,
          ...markerForDirection(nextData.direction ?? "forward"),
        };
      }),
    }),
  addNode: (position) => {
    const id = crypto.randomUUID();
    const nextNode: Node<GraphNodeData> = {
      id,
      position: position ?? { x: 0, y: 0 },
      data: { label: "New node" },
    };
    set({ nodes: [...get().nodes, nextNode] });
  },
}));
