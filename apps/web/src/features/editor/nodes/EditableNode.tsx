import { useEffect, useRef, useState } from "react";
import { Handle, Position, useUpdateNodeInternals, type NodeProps } from "reactflow";

import {
  type EdgePadding,
  type NodeHandle,
  type NodeKind,
  type NodeStyle,
  useGraphStore,
} from "../../../store/graphStore";

const edgePaddingToOffset = (padding: EdgePadding | undefined): number => {
  switch (padding) {
    case "sm": return 8;
    case "md": return 16;
    case "lg": return 24;
    default: return 0;
  }
};

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
  const updateNodeInternals = useUpdateNodeInternals();
  const isEditing = editingNodeId === id;
  const [draftLabel, setDraftLabel] = useState(data.label);
  const [draftBody, setDraftBody] = useState(data.body ?? "");
  const [isExpanded, setIsExpanded] = useState(Boolean(data.body));
  const [editingField, setEditingField] = useState<"title" | "body" | null>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  // Update node internals when edge padding changes so edges recalculate
  useEffect(() => {
    updateNodeInternals(id);
  }, [id, data.style?.edgePadding, updateNodeInternals]);

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
    setEditingField(null);
    stopEditingNode();
  };

  const commitBody = () => {
    updateNodeBody(id, draftBody);
  };

  const cancelEditing = () => {
    setDraftLabel(data.label);
    setDraftBody(data.body ?? "");
    setEditingField(null);
    stopEditingNode();
  };

  const handleDoubleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setEditingField("title");
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
      setEditingField(null);
      stopEditingNode();
    }
  };

  const handleFocusKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!selected || isEditing) {
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      setEditingField("title");
      startEditingNode(id);
    }
  };

  const toggleBody = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!isExpanded) {
      setIsExpanded(true);
      setEditingField("body");
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
  const paddingOffset = edgePaddingToOffset(data.style?.edgePadding);

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
            left: -paddingOffset,
          }}
        />
      ))}

      {/* Title */}
      {isEditing ? (
        <input
          className="nodrag w-full bg-transparent font-medium outline-none placeholder:text-slate-400"
          style={{ color: data.style?.textColor ?? "#1e293b" }}
          value={draftLabel}
          onChange={(event) => setDraftLabel(event.target.value)}
          onBlur={commitLabel}
          onKeyDown={handleLabelKeyDown}
          onFocus={() => setEditingField("title")}
          autoFocus={editingField === "title"}
          placeholder="Node title"
          aria-label="Edit node label"
        />
      ) : (
        <div
          className="font-medium"
          style={{ color: data.style?.textColor ?? "#1e293b" }}
        >
          {data.label}
        </div>
      )}

      {/* Body text */}
      {hasBody ? (
        <textarea
          ref={bodyRef}
          className="nodrag mt-1 w-full resize-none bg-transparent text-xs outline-none placeholder:text-slate-400"
          style={{ color: data.style?.bodyTextColor ?? data.style?.textColor ?? "#475569" }}
          value={draftBody}
          onChange={(event) => setDraftBody(event.target.value)}
          onBlur={commitBody}
          onKeyDown={handleBodyKeyDown}
          onFocus={() => {
            setEditingField("body");
            startEditingNode(id);
          }}
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
            right: -paddingOffset,
          }}
        />
      ))}
    </div>
  );
}
