import { useEffect, useRef, useState } from "react";
import { Handle, Position, type NodeProps } from "reactflow";

import {
  type NodeHandle,
  type NodeKind,
  type NodeStyle,
  useGraphStore,
} from "../../../store/graphStore";

export default function EditableNode({
  id,
  data,
  selected,
}: NodeProps<{
  label: string;
  body?: string;
  kind: NodeKind;
  style?: NodeStyle;
  sourceHandles?: NodeHandle[];
  targetHandles?: NodeHandle[];
}>) {
  const {
    editingNodeId,
    startEditingNode,
    stopEditingNode,
    updateNodeLabel,
    updateNodeBody,
  } = useGraphStore();
  const isEditing = editingNodeId === id;
  const [draftLabel, setDraftLabel] = useState(data.label);
  const [draftBody, setDraftBody] = useState(data.body ?? "");
  const [isExpanded, setIsExpanded] = useState(Boolean(data.body));
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setDraftLabel(data.label);
  }, [data.label]);

  useEffect(() => {
    setDraftBody(data.body ?? "");
    setIsExpanded(Boolean(data.body));
  }, [data.body]);

  // Auto-resize textarea
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.style.height = "auto";
      bodyRef.current.style.height = `${bodyRef.current.scrollHeight}px`;
    }
  }, [draftBody, isExpanded]);

  const commitLabel = () => {
    const nextLabel = draftLabel.trim() || "Untitled";
    updateNodeLabel(id, nextLabel);
    stopEditingNode();
  };

  const commitBody = () => {
    updateNodeBody(id, draftBody);
  };

  const cancelEditing = () => {
    setDraftLabel(data.label);
    setDraftBody(data.body ?? "");
    stopEditingNode();
  };

  const handleDoubleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    startEditingNode(id);
  };

  const handleLabelKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      commitLabel();
      // Focus body if it exists
      if (isExpanded && bodyRef.current) {
        bodyRef.current.focus();
      }
    }
    if (event.key === "Escape") {
      event.preventDefault();
      cancelEditing();
    }
  };

  const handleBodyKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      commitBody();
      stopEditingNode();
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

  const toggleBody = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!isExpanded) {
      setIsExpanded(true);
      startEditingNode(id);
      setTimeout(() => bodyRef.current?.focus(), 0);
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

  const nodeStyle: React.CSSProperties = {
    backgroundColor: data.style?.color,
    borderColor: selected ? undefined : data.style?.color,
  };

  const hasBody = isExpanded || Boolean(data.body);

  const targetHandles = data.targetHandles ?? [{ id: "target" }];
  const sourceHandles = data.sourceHandles ?? [{ id: "source" }];

  return (
    <div
      className={`relative min-w-[120px] max-w-[300px] border px-3 py-2 text-sm shadow-sm transition ${shapeClass} ${
        selected ? "border-slate-500" : "border-slate-200"
      }`}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleFocusKeyDown}
      tabIndex={0}
      aria-label={`Node ${data.label}`}
      style={nodeStyle}
    >
      {/* Target handles (left side) */}
      {targetHandles.map((handle, index) => (
        <Handle
          key={handle.id}
          id={handle.id}
          type="target"
          position={Position.Left}
          style={{
            top: `${((index + 1) / (targetHandles.length + 1)) * 100}%`,
          }}
        />
      ))}

      {/* Title */}
      {isEditing ? (
        <input
          className="w-full bg-transparent font-medium text-slate-800 outline-none placeholder:text-slate-400"
          value={draftLabel}
          onChange={(event) => setDraftLabel(event.target.value)}
          onBlur={commitLabel}
          onKeyDown={handleLabelKeyDown}
          autoFocus
          placeholder="Node title"
          aria-label="Edit node label"
        />
      ) : (
        <div className="font-medium text-slate-800">{data.label}</div>
      )}

      {/* Body text */}
      {hasBody ? (
        <textarea
          ref={bodyRef}
          className="mt-1 w-full resize-none bg-transparent text-xs text-slate-600 outline-none placeholder:text-slate-400"
          value={draftBody}
          onChange={(event) => setDraftBody(event.target.value)}
          onBlur={commitBody}
          onKeyDown={handleBodyKeyDown}
          onFocus={() => startEditingNode(id)}
          placeholder="Add notes..."
          rows={1}
          aria-label="Node body text"
        />
      ) : selected ? (
        <button
          className="mt-1 text-xs text-slate-400 hover:text-slate-600"
          type="button"
          onClick={toggleBody}
        >
          + Add notes
        </button>
      ) : null}

      {/* Source handles (right side) */}
      {sourceHandles.map((handle, index) => (
        <Handle
          key={handle.id}
          id={handle.id}
          type="source"
          position={Position.Right}
          style={{
            top: `${((index + 1) / (sourceHandles.length + 1)) * 100}%`,
          }}
        />
      ))}
    </div>
  );
}
