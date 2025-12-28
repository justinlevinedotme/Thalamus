import { create } from "zustand";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type EdgeChange,
  type NodeChange,
  type ReactFlowInstance,
} from "@xyflow/react";

import type {
  AxisConfig,
  TimelineTrack,
  TimelineNode,
  TimelineEdge,
  TimelineGridSettings,
  TimelineNodeData,
} from "./types";

// Default axis configuration
const defaultAxisConfig: AxisConfig = {
  type: "time",
  showGrid: true,
  tickCount: 10,
};

// Default grid settings
const defaultGridSettings: TimelineGridSettings = {
  snapToAxis: true,
  snapToTrack: true,
  showAxisGrid: true,
  showTrackDividers: true,
};

// Snapshot for undo/redo
interface TimelineSnapshot {
  nodes: TimelineNode[];
  edges: TimelineEdge[];
  tracks: TimelineTrack[];
  axisConfig: AxisConfig;
}

interface TimelineState {
  // Data
  nodes: TimelineNode[];
  edges: TimelineEdge[];
  tracks: TimelineTrack[];
  axisConfig: AxisConfig;
  gridSettings: TimelineGridSettings;

  // UI State
  selectedNodeId?: string;
  selectedTrackId?: string;
  flowInstance: ReactFlowInstance<TimelineNode, TimelineEdge> | null;

  // History
  historyPast: TimelineSnapshot[];
  historyFuture: TimelineSnapshot[];
  canUndo: boolean;
  canRedo: boolean;

  // Version for dirty detection
  dataVersion: number;

  // Node actions
  setNodes: (nodes: TimelineNode[]) => void;
  onNodesChange: (changes: NodeChange<TimelineNode>[]) => void;
  addEvent: (trackId: string, axisPosition: number, label: string) => void;
  addSpan: (trackId: string, start: number, end: number, label: string) => void;
  updateNodeData: (nodeId: string, data: Partial<TimelineNodeData>) => void;
  deleteNode: (nodeId: string) => void;
  selectNode: (nodeId?: string) => void;

  // Edge actions
  setEdges: (edges: TimelineEdge[]) => void;
  onEdgesChange: (changes: EdgeChange<TimelineEdge>[]) => void;
  onConnect: (connection: Connection) => void;

  // Track actions
  setTracks: (tracks: TimelineTrack[]) => void;
  addTrack: (label: string, color?: string) => void;
  updateTrack: (trackId: string, data: Partial<TimelineTrack>) => void;
  removeTrack: (trackId: string) => void;
  reorderTracks: (fromIndex: number, toIndex: number) => void;
  selectTrack: (trackId?: string) => void;

  // Axis actions
  setAxisConfig: (config: Partial<AxisConfig>) => void;

  // Grid actions
  setGridSettings: (settings: Partial<TimelineGridSettings>) => void;

  // Flow instance
  setFlowInstance: (instance: ReactFlowInstance<TimelineNode, TimelineEdge> | null) => void;

  // History
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;

  // Reset
  reset: () => void;
}

// Generate unique IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

// Timeline line offset from bottom of track
const TIMELINE_OFFSET = 16;

// Calculate Y position for events - positioned so marker lands on timeline
// Timeline line is at trackY + trackHeight - TIMELINE_OFFSET
// Event marker is at bottom of node, so we position node above the line
const getEventY = (tracks: TimelineTrack[], trackId: string, trackHeight = 80): number => {
  const trackIndex = tracks.findIndex((t) => t.id === trackId);
  if (trackIndex === -1) return 100;
  // Position at top of track with some padding
  return 100 + trackIndex * trackHeight + 4;
};

// Calculate Y position for spans - centered in track
const getSpanY = (tracks: TimelineTrack[], trackId: string, trackHeight = 80): number => {
  const trackIndex = tracks.findIndex((t) => t.id === trackId);
  if (trackIndex === -1) return 100;
  // Center span vertically in track (span is 48px tall)
  return 100 + trackIndex * trackHeight + (trackHeight - 48) / 2;
};

export const useTimelineStore = create<TimelineState>((set, get) => ({
  // Initial state
  nodes: [],
  edges: [],
  tracks: [],
  axisConfig: defaultAxisConfig,
  gridSettings: defaultGridSettings,
  selectedNodeId: undefined,
  selectedTrackId: undefined,
  flowInstance: null,
  historyPast: [],
  historyFuture: [],
  canUndo: false,
  canRedo: false,
  dataVersion: 0,

  // Node actions
  setNodes: (nodes) =>
    set((state) => ({
      nodes,
      dataVersion: state.dataVersion + 1,
    })),

  onNodesChange: (changes) =>
    set((state) => {
      const updated = applyNodeChanges(changes, state.nodes);
      return {
        nodes: updated,
        dataVersion: state.dataVersion + 1,
      };
    }),

  addEvent: (trackId, axisPosition, label) => {
    const state = get();
    state.pushHistory();

    const newNode: TimelineNode = {
      id: generateId(),
      type: "timelineEvent",
      position: {
        x: axisPosition * 1000, // Scale position to canvas
        y: getEventY(state.tracks, trackId),
      },
      data: {
        type: "event",
        axisPosition,
        trackId,
        label,
      },
    };

    set((s) => ({
      nodes: [...s.nodes, newNode],
      dataVersion: s.dataVersion + 1,
    }));
  },

  addSpan: (trackId, start, end, label) => {
    const state = get();
    state.pushHistory();

    const newNode: TimelineNode = {
      id: generateId(),
      type: "timelineSpan",
      position: {
        x: start * 1000,
        y: getSpanY(state.tracks, trackId),
      },
      data: {
        type: "span",
        startPosition: start,
        endPosition: end,
        trackId,
        label,
      },
    };

    set((s) => ({
      nodes: [...s.nodes, newNode],
      dataVersion: s.dataVersion + 1,
    }));
  },

  updateNodeData: (nodeId, data) => {
    const state = get();
    state.pushHistory();

    set((s) => ({
      nodes: s.nodes.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...data } as TimelineNodeData } : node
      ),
      dataVersion: s.dataVersion + 1,
    }));
  },

  deleteNode: (nodeId) => {
    const state = get();
    state.pushHistory();

    set((s) => ({
      nodes: s.nodes.filter((n) => n.id !== nodeId),
      edges: s.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNodeId: s.selectedNodeId === nodeId ? undefined : s.selectedNodeId,
      dataVersion: s.dataVersion + 1,
    }));
  },

  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),

  // Edge actions
  setEdges: (edges) =>
    set((state) => ({
      edges,
      dataVersion: state.dataVersion + 1,
    })),

  onEdgesChange: (changes) =>
    set((state) => {
      const updated = applyEdgeChanges(changes, state.edges);
      return {
        edges: updated,
        dataVersion: state.dataVersion + 1,
      };
    }),

  onConnect: (connection) => {
    const state = get();
    state.pushHistory();

    set((s) => ({
      edges: addEdge(connection, s.edges),
      dataVersion: s.dataVersion + 1,
    }));
  },

  // Track actions
  setTracks: (tracks) =>
    set((state) => ({
      tracks,
      dataVersion: state.dataVersion + 1,
    })),

  addTrack: (label, color) => {
    const state = get();
    state.pushHistory();

    const newTrack: TimelineTrack = {
      id: generateId(),
      label,
      color,
    };

    set((s) => ({
      tracks: [...s.tracks, newTrack],
      dataVersion: s.dataVersion + 1,
    }));
  },

  updateTrack: (trackId, data) => {
    const state = get();
    state.pushHistory();

    set((s) => ({
      tracks: s.tracks.map((track) => (track.id === trackId ? { ...track, ...data } : track)),
      dataVersion: s.dataVersion + 1,
    }));
  },

  removeTrack: (trackId) => {
    const state = get();
    state.pushHistory();

    set((s) => ({
      tracks: s.tracks.filter((t) => t.id !== trackId),
      // Also remove nodes in this track
      nodes: s.nodes.filter((n) => n.data.trackId !== trackId),
      selectedTrackId: s.selectedTrackId === trackId ? undefined : s.selectedTrackId,
      dataVersion: s.dataVersion + 1,
    }));
  },

  reorderTracks: (fromIndex, toIndex) => {
    const state = get();
    state.pushHistory();

    const newTracks = [...state.tracks];
    const [removed] = newTracks.splice(fromIndex, 1);
    newTracks.splice(toIndex, 0, removed);

    // Update node Y positions based on new track order
    const updatedNodes = state.nodes.map((node) => ({
      ...node,
      position: {
        ...node.position,
        y:
          node.data.type === "span"
            ? getSpanY(newTracks, node.data.trackId)
            : getEventY(newTracks, node.data.trackId),
      },
    }));

    set({
      tracks: newTracks,
      nodes: updatedNodes,
      dataVersion: state.dataVersion + 1,
    });
  },

  selectTrack: (trackId) => set({ selectedTrackId: trackId }),

  // Axis actions
  setAxisConfig: (config) =>
    set((state) => ({
      axisConfig: { ...state.axisConfig, ...config },
      dataVersion: state.dataVersion + 1,
    })),

  // Grid actions
  setGridSettings: (settings) =>
    set((state) => ({
      gridSettings: { ...state.gridSettings, ...settings },
      dataVersion: state.dataVersion + 1,
    })),

  // Flow instance
  setFlowInstance: (instance) => set({ flowInstance: instance }),

  // History
  pushHistory: () => {
    const state = get();
    const snapshot: TimelineSnapshot = {
      nodes: state.nodes,
      edges: state.edges,
      tracks: state.tracks,
      axisConfig: state.axisConfig,
    };

    set({
      historyPast: [...state.historyPast.slice(-49), snapshot],
      historyFuture: [],
      canUndo: true,
      canRedo: false,
    });
  },

  undo: () => {
    const state = get();
    if (state.historyPast.length === 0) return;

    const previous = state.historyPast[state.historyPast.length - 1];
    const currentSnapshot: TimelineSnapshot = {
      nodes: state.nodes,
      edges: state.edges,
      tracks: state.tracks,
      axisConfig: state.axisConfig,
    };

    set({
      nodes: previous.nodes,
      edges: previous.edges,
      tracks: previous.tracks,
      axisConfig: previous.axisConfig,
      historyPast: state.historyPast.slice(0, -1),
      historyFuture: [currentSnapshot, ...state.historyFuture],
      canUndo: state.historyPast.length > 1,
      canRedo: true,
      dataVersion: state.dataVersion + 1,
    });
  },

  redo: () => {
    const state = get();
    if (state.historyFuture.length === 0) return;

    const next = state.historyFuture[0];
    const currentSnapshot: TimelineSnapshot = {
      nodes: state.nodes,
      edges: state.edges,
      tracks: state.tracks,
      axisConfig: state.axisConfig,
    };

    set({
      nodes: next.nodes,
      edges: next.edges,
      tracks: next.tracks,
      axisConfig: next.axisConfig,
      historyPast: [...state.historyPast, currentSnapshot],
      historyFuture: state.historyFuture.slice(1),
      canUndo: true,
      canRedo: state.historyFuture.length > 1,
      dataVersion: state.dataVersion + 1,
    });
  },

  // Reset
  reset: () =>
    set({
      nodes: [],
      edges: [],
      tracks: [],
      axisConfig: defaultAxisConfig,
      gridSettings: defaultGridSettings,
      selectedNodeId: undefined,
      selectedTrackId: undefined,
      historyPast: [],
      historyFuture: [],
      canUndo: false,
      canRedo: false,
      dataVersion: 0,
    }),
}));
