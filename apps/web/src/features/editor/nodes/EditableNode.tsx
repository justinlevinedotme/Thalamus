import { useEffect, useState } from "react";
import { Handle, Position, useUpdateNodeInternals, type NodeProps } from "reactflow";

import RichTextEditor from "../../../components/RichTextEditor";
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

// Strip HTML tags for plain text display
const stripHtml = (html: string): string => {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
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

  const commitLabel = () => {
    const plainText = stripHtml(draftLabel);
    const nextLabel = plainText.trim() ? draftLabel : "Untitled";
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

  const handleTitleEnter = () => {
    commitLabel();
    // Move to body if it exists
    if (isExpanded) {
      setEditingField("body");
      startEditingNode(id);
    }
  };

  const handleTitleTab = () => {
    // Expand body if not already and move focus to it
    if (!isExpanded) {
      setIsExpanded(true);
    }
    setEditingField("body");
  };

  const handleTitleEscape = () => {
    cancelEditing();
  };

  const handleBodyEscape = () => {
    commitBody();
    setEditingField(null);
    stopEditingNode();
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
      aria-label={`Node ${stripHtml(data.label)}`}
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
        <RichTextEditor
          value={draftLabel}
          onChange={setDraftLabel}
          onBlur={() => {
            // Only commit if we're actually editing the title
            if (editingField === "title") {
              commitLabel();
            }
          }}
          onEnter={handleTitleEnter}
          onEscape={handleTitleEscape}
          onTab={handleTitleTab}
          onFocus={() => setEditingField("title")}
          placeholder="Node title"
          className="w-full bg-transparent font-medium"
          textColor={data.style?.textColor ?? "#1e293b"}
          singleLine
          autoFocus={editingField === "title"}
        />
      ) : (
        <div
          className="node-rich-text font-medium"
          style={{ color: data.style?.textColor ?? "#1e293b" }}
          dangerouslySetInnerHTML={{ __html: data.label }}
        />
      )}

      {/* Body text */}
      {hasBody ? (
        isEditing ? (
          <RichTextEditor
            value={draftBody}
            onChange={setDraftBody}
            onBlur={() => {
              // Only commit if we're actually editing the body
              if (editingField === "body") {
                commitBody();
              }
            }}
            onEscape={handleBodyEscape}
            onFocus={() => setEditingField("body")}
            placeholder="Add notes..."
            className="mt-1 w-full bg-transparent text-xs"
            textColor={data.style?.bodyTextColor ?? data.style?.textColor ?? "#475569"}
            autoFocus={editingField === "body"}
          />
        ) : (
          <div
            className="nodrag node-rich-text mt-1 text-xs cursor-text"
            style={{ color: data.style?.bodyTextColor ?? data.style?.textColor ?? "#475569" }}
            dangerouslySetInnerHTML={{ __html: draftBody || data.body || "" }}
            onClick={(e) => {
              e.stopPropagation();
              setEditingField("body");
              startEditingNode(id);
            }}
          />
        )
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
