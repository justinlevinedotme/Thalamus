// Timeline types - to be implemented in Phase 2

export type AxisType = "time" | "number" | "milestone" | "custom";

export interface AxisConfig {
  type: AxisType;
  start?: number | string;
  end?: number | string;
  unit?: string;
  labels?: string[];
}

export interface TimelineTrack {
  id: string;
  label: string;
  color?: string;
}

export interface TimelineEvent {
  id: string;
  axisPosition: number | string;
  endPosition?: number | string; // For duration spans
  trackId: string;
  label: string;
  description?: string;
  color?: string;
  icon?: string;
}
