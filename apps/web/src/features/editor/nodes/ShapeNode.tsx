import { NodeResizer } from "@reactflow/node-resizer";
import "@reactflow/node-resizer/dist/style.css";
import { type NodeProps } from "reactflow";

import {
  type NodeKind,
  type NodeStyle,
} from "../../../store/graphStore";

const MIN_WIDTH = 100;
const MIN_HEIGHT = 60;

export default function ShapeNode({
  data,
  selected,
}: NodeProps<{
  label: string;
  kind: NodeKind;
  style?: NodeStyle;
}>) {
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

  const nodeStyle: React.CSSProperties = {
    backgroundColor: data.style?.color ?? "#F1F5F9",
    borderColor: selected ? "#64748b" : (data.style?.color === "transparent" ? "#e2e8f0" : data.style?.color),
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
        className={`h-full w-full border-2 border-dashed transition ${shapeClass}`}
        style={nodeStyle}
        aria-label="Shape container"
      />
    </>
  );
}
