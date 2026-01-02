import { MarkerType, type Edge, type Node } from "@xyflow/react";
import type {
  AppEdge,
  AppNode,
  EdgeMarkerSize,
  EdgeMarkerType,
  EdgeStyle,
  GraphNodeData,
  GraphSnapshot,
  GridSettings,
  NodeGroup,
  NodeKind,
  RelationshipData,
  RelationshipDirection,
} from "./types";
import { defaultEdgeStyle, nodeStyleDefaults } from "./defaults";

type MarkerConfig =
  | { type: MarkerType; color?: string; width?: number; height?: number }
  | string
  | undefined;

export const getNodeType = (kind: NodeKind): string => {
  switch (kind) {
    case "text":
      return "text";
    case "shape":
      return "shape";
    case "pathKey":
      return "pathKey";
    case "nodeKey":
      return "nodeKey";
    case "composed":
      return "composed";
    default:
      return "editable";
  }
};

export const normalizeNodes = (nodes: Node<GraphNodeData>[]) =>
  nodes.map((node) => {
    const kind = node.data?.kind ?? "idea";
    const nodeType = node.type ?? getNodeType(kind);
    return {
      ...node,
      type: nodeType,
      data: {
        ...node.data,
        label: node.data?.label ?? "Untitled",
        body: node.data?.body,
        kind,
        style: node.data?.style ?? nodeStyleDefaults[kind],
        sourceHandles: node.data?.sourceHandles,
        targetHandles: node.data?.targetHandles,
        groupId: node.data?.groupId,
      },
    };
  });

export const markerSizeToScale = (size: EdgeMarkerSize): number => {
  switch (size) {
    case "xs":
      return 8;
    case "sm":
      return 15;
    case "lg":
      return 35;
    default:
      return 25;
  }
};

export const getMarkerId = (
  markerType: EdgeMarkerType,
  color: string,
  size: EdgeMarkerSize
): string => {
  const colorId = color.replace("#", "");
  return `marker-${markerType}-${colorId}-${size}`;
};

export const markerForDirection = (
  direction: RelationshipDirection,
  color: string,
  style?: EdgeStyle
): {
  markerStart?: MarkerConfig;
  markerEnd?: MarkerConfig;
} => {
  const markerSize = markerSizeToScale(style?.markerSize ?? "md");
  const size = style?.markerSize ?? "md";

  const getStartMarkerType = (): EdgeMarkerType | undefined => {
    if (style?.markerStart) {
      return style.markerStart === "none" ? undefined : style.markerStart;
    }
    if (direction === "backward" || direction === "both") {
      return "arrowclosed";
    }
    return undefined;
  };

  const getEndMarkerType = (): EdgeMarkerType | undefined => {
    if (style?.markerEnd) {
      return style.markerEnd === "none" ? undefined : style.markerEnd;
    }
    if (direction === "forward" || direction === "both") {
      return "arrowclosed";
    }
    return undefined;
  };

  if (direction === "none" && !style?.markerStart && !style?.markerEnd) {
    return { markerStart: undefined, markerEnd: undefined };
  }

  const startType = getStartMarkerType();
  const endType = getEndMarkerType();

  const getMarkerConfig = (type: EdgeMarkerType | undefined): MarkerConfig => {
    if (!type) return undefined;

    if (type === "arrow") {
      return { type: MarkerType.Arrow, color, width: markerSize, height: markerSize };
    }
    if (type === "arrowclosed") {
      return { type: MarkerType.ArrowClosed, color, width: markerSize, height: markerSize };
    }
    return getMarkerId(type, color, size);
  };

  return {
    markerStart: getMarkerConfig(startType),
    markerEnd: getMarkerConfig(endType),
  };
};

export const normalizeEdges = (edges: Edge<RelationshipData>[]) =>
  edges.map((edge) => {
    const mergedStyle = {
      ...defaultEdgeStyle,
      ...edge.data?.style,
    };
    const mergedData = {
      relationType: edge.data?.relationType ?? "related",
      direction: edge.data?.direction ?? "forward",
      style: mergedStyle,
    };
    return {
      ...edge,
      data: mergedData,
      ...markerForDirection(mergedData.direction, mergedStyle.color, mergedStyle),
    };
  });

export const cloneGraph = (
  nodes: AppNode[],
  edges: AppEdge[],
  groups: NodeGroup[],
  gridSettings: GridSettings
): GraphSnapshot => ({
  nodes: nodes.map((n) => ({
    ...n,
    data: { ...n.data, style: n.data.style ? { ...n.data.style } : undefined },
    position: { ...n.position },
  })),
  edges: edges.map((e) => ({
    ...e,
    data: e.data
      ? {
          ...e.data,
          style: e.data.style ? { ...e.data.style } : undefined,
        }
      : undefined,
  })),
  groups: groups.map((g) => ({ ...g })),
  gridSettings: { ...gridSettings },
});
