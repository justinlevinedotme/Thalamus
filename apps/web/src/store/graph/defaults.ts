import type { EdgeStyle, GridSettings, NodeKind, NodeStyle, RelationshipData } from "./types";

export const DEFAULT_NODE_TEXT_COLOR = "#1f2937"; // gray-800

export const nodeStyleDefaults: Record<NodeKind, NodeStyle> = {
  idea: { color: "#E2E8F0", shape: "rounded", size: "md", textColor: DEFAULT_NODE_TEXT_COLOR },
  question: { color: "#FDE68A", shape: "circle", size: "md", textColor: DEFAULT_NODE_TEXT_COLOR },
  evidence: { color: "#BBF7D0", shape: "rounded", size: "sm", textColor: DEFAULT_NODE_TEXT_COLOR },
  goal: { color: "#BFDBFE", shape: "pill", size: "lg", textColor: DEFAULT_NODE_TEXT_COLOR },
  text: { color: "transparent", shape: "rounded", size: "md" },
  shape: {
    color: "#DBEAFE",
    shape: "rounded",
    size: "lg",
    borderColor: "#3B82F6",
    borderWidth: 2,
    borderStyle: "solid",
    textColor: DEFAULT_NODE_TEXT_COLOR,
  },
  pathKey: {
    color: "#FFFFFF",
    shape: "rounded",
    size: "md",
    borderColor: "#e2e8f0",
    borderWidth: 1,
    borderStyle: "solid",
    textColor: DEFAULT_NODE_TEXT_COLOR,
  },
  nodeKey: {
    color: "#FFFFFF",
    shape: "rounded",
    size: "md",
    borderColor: "#e2e8f0",
    borderWidth: 1,
    borderStyle: "solid",
    textColor: DEFAULT_NODE_TEXT_COLOR,
  },
  composed: {
    color: "#FFFFFF",
    shape: "rounded",
    size: "md",
    borderColor: "#e2e8f0",
    borderWidth: 1,
    borderStyle: "solid",
    textColor: DEFAULT_NODE_TEXT_COLOR,
  },
};

export const defaultEdgeStyle: EdgeStyle = {
  color: "#94A3B8",
  thickness: 2,
  curvature: "smoothstep",
  lineStyle: "solid",
};

export const defaultEdgeData: RelationshipData = {
  relationType: "related",
  direction: "forward",
  style: defaultEdgeStyle,
};

export const MAX_HISTORY_SIZE = 50;

export const defaultGridSettings: GridSettings = {
  snapEnabled: false,
  gridVisible: true,
  gridSize: 24,
  gridStyle: "lines",
};
