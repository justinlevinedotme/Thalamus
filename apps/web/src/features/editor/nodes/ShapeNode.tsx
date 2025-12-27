import { NodeResizer } from "@reactflow/node-resizer";
import "@reactflow/node-resizer/dist/style.css";
import { flushSync } from "react-dom";
import { type NodeProps } from "reactflow";

import { type NodeKind, type NodeStyle, useGraphStore } from "../../../store/graphStore";

const MIN_WIDTH = 100;
const MIN_HEIGHT = 60;

export default function ShapeNode({
  data,
  selected,
}: NodeProps<{
  label: string;
  kind: NodeKind;
  style?: NodeStyle;
  groupId?: string;
}>) {
  const { selectGroupNodes } = useGraphStore();

  // Handle mousedown to select all group nodes BEFORE React Flow starts dragging
  // We use flushSync to force the selection update to happen synchronously
  const handleMouseDown = (event: React.MouseEvent) => {
    if (event.button !== 0 || event.shiftKey) {
      return;
    }
    const groupId = data.groupId;
    if (groupId) {
      flushSync(() => {
        selectGroupNodes(groupId);
      });
    }
  };

  const shapeClass = (() => {
    switch (data.style?.shape) {
      case "circle":
        return "rounded-full";
      case "pill":
        return "rounded-full";
      case "square":
        return "rounded-none";
      default:
        return "rounded-lg";
    }
  })();

  // Get border properties with defaults
  const borderWidth = data.style?.borderWidth ?? 2;
  const borderStyle = data.style?.borderStyle ?? "solid";
  const hasBorder = borderWidth > 0;
  const borderColor =
    selected && hasBorder
      ? "#64748b"
      : (data.style?.borderColor ??
        (data.style?.color === "transparent" ? "#e2e8f0" : (data.style?.color ?? "#3B82F6")));

  const nodeStyle: React.CSSProperties = {
    backgroundColor: data.style?.color ?? "#DBEAFE",
    borderColor: hasBorder ? borderColor : "transparent",
    borderWidth: hasBorder ? borderWidth : 0,
    borderStyle: hasBorder ? borderStyle : "none",
  };

  return (
    <>
      <NodeResizer
        minWidth={MIN_WIDTH}
        minHeight={MIN_HEIGHT}
        isVisible={selected}
        lineClassName="!border-slate-400"
        handleClassName="!w-2.5 !h-2.5 !bg-white !border-slate-400"
      />
      <div
        className={`h-full w-full transition ${shapeClass} ${selected && !hasBorder ? "ring-2 ring-slate-500 ring-offset-0" : ""}`}
        style={nodeStyle}
        aria-label="Shape container"
        onMouseDown={handleMouseDown}
      />
    </>
  );
}
