import { useEffect, useState } from "react";
import { Handle, Position, useUpdateNodeInternals, type Node, type NodeProps } from "@xyflow/react";

import RichTextEditor from "../../../components/RichTextEditor";
import { NodeIconDisplay } from "../../../components/ui/icon-picker";
import { Kbd } from "../../../components/ui/kbd";
import {
  type EdgePadding,
  type NodeHandle,
  type NodeKind,
  type NodeStyle,
  useGraphStore,
} from "../../../store/graphStore";

type EditableNodeData = {
  label: string;
  body?: string;
  kind: NodeKind;
  style?: NodeStyle;
  sourceHandles?: NodeHandle[];
  targetHandles?: NodeHandle[];
  groupId?: string;
};

type EditableNodeType = Node<EditableNodeData, "editable">;

// Default text color for nodes without explicit textColor (ensures readability on light backgrounds)
const DEFAULT_TEXT_COLOR = "#1f2937"; // gray-800

const edgePaddingToOffset = (padding: EdgePadding | undefined): number => {
  switch (padding) {
    case "sm":
      return 8;
    case "md":
      return 16;
    case "lg":
      return 24;
    default:
      return 0;
  }
};

// Strip HTML tags for plain text display
const stripHtml = (html: string): string => {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
};

export default function EditableNode({ id, data, selected }: NodeProps<EditableNodeType>) {
  const { editingNodeId, startEditingNode, stopEditingNode, updateNodeLabel, updateNodeBody } =
    useGraphStore();
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
  const borderWidth = data.style?.borderWidth ?? 1;
  const borderStyle = data.style?.borderStyle ?? "solid";
  const hasBorder = borderWidth > 0;
  const borderColor = selected
    ? hasBorder
      ? undefined
      : undefined // Let CSS class handle selected state
    : data.style?.borderColor; // Use theme-aware border color

  const nodeStyle: React.CSSProperties = {
    backgroundColor: data.style?.color,
    borderColor: hasBorder ? borderColor : "transparent",
    borderWidth: hasBorder ? borderWidth : 0,
    borderStyle: hasBorder ? borderStyle : "none",
  };

  const hasBody = isExpanded || Boolean(data.body);

  const targetHandles = data.targetHandles ?? [{ id: "target" }];
  const sourceHandles = data.sourceHandles ?? [{ id: "source" }];
  const paddingOffset = edgePaddingToOffset(data.style?.edgePadding);

  return (
    <div
      className={`relative h-full w-full px-3 py-2 text-sm shadow-sm transition ${shapeClass} ${
        selected && hasBorder ? "!border-muted-foreground" : ""
      } ${selected && !hasBorder ? "ring-2 ring-muted-foreground ring-offset-0" : ""}`}
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

      {/* Title */}
      <div className="flex items-center gap-1.5">
        {data.style?.icon && (
          <span
            className="flex-shrink-0 flex items-center"
            style={{ color: data.style?.iconColor ?? data.style?.textColor ?? DEFAULT_TEXT_COLOR }}
          >
            <NodeIconDisplay icon={data.style.icon} className="h-4 w-4" />
          </span>
        )}
        <div className="flex-1 min-w-0">
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
              textColor={data.style?.textColor ?? DEFAULT_TEXT_COLOR}
              singleLine
              autoFocus={editingField === "title"}
            />
          ) : (
            <div
              className="node-rich-text font-medium w-full"
              style={{ color: data.style?.textColor ?? DEFAULT_TEXT_COLOR }}
              dangerouslySetInnerHTML={{ __html: data.label }}
            />
          )}
        </div>
      </div>

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
            textColor={data.style?.bodyTextColor ?? data.style?.textColor ?? DEFAULT_TEXT_COLOR}
            autoFocus={editingField === "body"}
          />
        ) : (
          <div
            className="nodrag node-rich-text mt-1 w-full text-xs cursor-text"
            style={{
              color: data.style?.bodyTextColor ?? data.style?.textColor ?? DEFAULT_TEXT_COLOR,
            }}
            dangerouslySetInnerHTML={{ __html: draftBody || data.body || "" }}
            onClick={(e) => {
              e.stopPropagation();
              setEditingField("body");
              startEditingNode(id);
            }}
          />
        )
      ) : null}

      {/* Hint popover when editing title and no body exists */}
      {isEditing && editingField === "title" && !hasBody && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 pointer-events-none z-50">
          <div className="flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 shadow-md text-[11px] text-muted-foreground whitespace-nowrap">
            <Kbd>Tab</Kbd>
            <span>to add body text</span>
          </div>
        </div>
      )}
    </div>
  );
}
