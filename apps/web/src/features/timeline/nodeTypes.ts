import type { NodeTypes } from "@xyflow/react";
import { TimelineEventNode } from "./nodes/TimelineEventNode";
import { TimelineSpanNode } from "./nodes/TimelineSpanNode";

// Node types for timeline editor
export const timelineNodeTypes: NodeTypes = {
  timelineEvent: TimelineEventNode,
  timelineSpan: TimelineSpanNode,
};
