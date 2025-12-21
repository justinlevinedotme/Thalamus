import { useEffect, useState } from "react";
import { Handle, Position, type NodeProps } from "reactflow";

import { Input } from "../../../components/ui/input";
import { type NodeKind, type NodeStyle, useGraphStore } from "../../../store/graphStore";

export default function EditableNode({
  id,
  data,
  selected,
}: NodeProps<{
  label: string;
  kind: NodeKind;
  style?: NodeStyle;
}>) {
  const {
    editingNodeId,
    startEditingNode,
    stopEditingNode,
    updateNodeLabel,
  } = useGraphStore();
  const isEditing = editingNodeId === id;
  const [draftLabel, setDraftLabel] = useState(data.label);

  useEffect(() => {
    if (isEditing) {
      setDraftLabel(data.label);
      return;
    }
    setDraftLabel(data.label);
  }, [data.label, isEditing]);

  const commitLabel = () => {
    const nextLabel = draftLabel.trim() || "Untitled";
    updateNodeLabel(id, nextLabel);
    stopEditingNode();
  };

  const cancelEditing = () => {
    setDraftLabel(data.label);
    stopEditingNode();
  };

  const handleDoubleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    startEditingNode(id);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      commitLabel();
    }
    if (event.key === "Escape") {
      event.preventDefault();
      cancelEditing();
    }
  };

  const handleFocusKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!selected || isEditing) {
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      startEditingNode(id);
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
        return "rounded-md";
    }
  })();

  const sizeClass = (() => {
    switch (data.style?.size) {
      case "sm":
        return "min-w-[120px] min-h-[56px]";
      case "lg":
        return "min-w-[200px] min-h-[96px]";
      default:
        return "min-w-[150px] min-h-[72px]";
    }
  })();

  const nodeStyle: React.CSSProperties = {
    backgroundColor: data.style?.color,
    borderColor: selected ? undefined : data.style?.color,
  };

  return (
    <div
      className={`max-w-[260px] border px-3 py-2 text-sm shadow-sm transition ${shapeClass} ${sizeClass} ${
        selected ? "border-slate-500" : "border-slate-200"
      }`}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleFocusKeyDown}
      tabIndex={0}
      aria-label={`Node ${data.label}`}
      style={nodeStyle}
    >
      <Handle type="target" position={Position.Left} />
      {isEditing ? (
        <Input
          value={draftLabel}
          onChange={(event) => setDraftLabel(event.target.value)}
          onBlur={commitLabel}
          onKeyDown={handleKeyDown}
          autoFocus
          aria-label="Edit node label"
        />
      ) : (
        <div className="font-medium text-slate-800">{data.label}</div>
      )}
      <div className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">
        {data.kind}
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
