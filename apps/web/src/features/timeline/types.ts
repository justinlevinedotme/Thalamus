import type { Node, Edge } from "@xyflow/react";
import type { NodeIcon, NodeStyle } from "../../store/graphStore";

// Axis configuration types
export type AxisType = "time" | "number" | "milestone" | "custom";

export type TimeUnit = "minute" | "hour" | "day" | "week" | "month" | "year";

export interface AxisConfig {
  type: AxisType;
  // For time-based axes
  startDate?: string; // ISO date string
  endDate?: string;
  timeUnit?: TimeUnit;
  // For number-based axes
  startValue?: number;
  endValue?: number;
  step?: number;
  // For milestone/custom axes
  labels?: AxisLabel[];
  // Display options
  showGrid?: boolean;
  tickCount?: number;
}

export interface AxisLabel {
  id: string;
  value: number | string; // Position on axis
  label: string;
  color?: string;
}

// Track (lane) types
export interface TimelineTrack {
  id: string;
  label: string;
  color?: string;
  height?: number; // Custom lane height
  collapsed?: boolean;
}

// Event types - for point-in-time markers
export interface TimelineEventData {
  type: "event";
  axisPosition: number; // Normalized position 0-1 on axis
  rawValue?: number | string; // Original value (date, number, etc.)
  trackId: string;
  label: string;
  description?: string;
  icon?: NodeIcon;
  color?: string;
  style?: Partial<NodeStyle>;
  [key: string]: unknown; // Index signature for React Flow v12 compatibility
}

// Span types - for duration events
export interface TimelineSpanData {
  type: "span";
  startPosition: number; // Normalized 0-1
  endPosition: number; // Normalized 0-1
  rawStartValue?: number | string;
  rawEndValue?: number | string;
  trackId: string;
  label: string;
  description?: string;
  icon?: NodeIcon;
  color?: string;
  style?: Partial<NodeStyle>;
  [key: string]: unknown; // Index signature for React Flow v12 compatibility
}

// Combined timeline node data
export type TimelineNodeData = TimelineEventData | TimelineSpanData;

// React Flow node type for timeline
export type TimelineNode = Node<TimelineNodeData>;

// React Flow edge type for timeline (connections between events)
export type TimelineEdge = Edge<{
  label?: string;
  color?: string;
}>;

// Timeline-specific grid settings
export interface TimelineGridSettings {
  snapToAxis: boolean;
  snapToTrack: boolean;
  showAxisGrid: boolean;
  showTrackDividers: boolean;
}

// Full timeline data for save/load
export interface TimelineData {
  axisConfig: AxisConfig;
  tracks: TimelineTrack[];
  gridSettings: TimelineGridSettings;
}
