import { useEffect, useState } from "react";
import { Handle, Position, type NodeProps } from "reactflow";

import { Input } from "../../../components/ui/input";
import { type NodeKind, useGraphStore } from "../../../store/graphStore";

export default function EditableNode({ id, data, selected }: NodeProps<{
  label: string;
  kind: NodeKind;
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

  return (
    <div
      className={`min-w-[140px] max-w-[240px] rounded-md border bg-white px-3 py-2 text-sm shadow-sm transition ${
        selected ? "border-slate-500" : "border-slate-200"
      }`}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleFocusKeyDown}
      tabIndex={0}
      aria-label={`Node ${data.label}`}
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
