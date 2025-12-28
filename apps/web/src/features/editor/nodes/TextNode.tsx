import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { type Node, type NodeProps } from "@xyflow/react";

import RichTextEditor from "../../../components/RichTextEditor";
import { NodeIconDisplay } from "../../../components/ui/icon-picker";
import { type NodeKind, type NodeStyle, useGraphStore } from "../../../store/graphStore";

type TextNodeData = {
  label: string;
  kind: NodeKind;
  style?: NodeStyle;
  groupId?: string;
};

type TextNodeType = Node<TextNodeData, "text">;

// Strip HTML tags for plain text display
const stripHtml = (html: string): string => {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
};

// Map size to text classes
const sizeToTextClass = (size: string | undefined): string => {
  switch (size) {
    case "sm":
      return "text-base";
    case "lg":
      return "text-2xl";
    default:
      return "text-lg";
  }
};

export default function TextNode({ id, data, selected }: NodeProps<TextNodeType>) {
  const { editingNodeId, startEditingNode, stopEditingNode, updateNodeLabel, selectGroupNodes } =
    useGraphStore();
  const isEditing = editingNodeId === id;
  const [draftLabel, setDraftLabel] = useState(data.label);

  useEffect(() => {
    setDraftLabel(data.label);
  }, [data.label]);

  const commitLabel = () => {
    const plainText = stripHtml(draftLabel);
    const nextLabel = plainText.trim() ? draftLabel : "Heading";
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

  const handleEnter = () => {
    commitLabel();
  };

  const handleEscape = () => {
    cancelEditing();
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

  const textSizeClass = sizeToTextClass(data.style?.size);

  // Text nodes have no background by default, transparent
  const nodeStyle: React.CSSProperties = {
    color: data.style?.textColor,
  };

  return (
    <div
      className={`relative px-2 py-1 font-semibold transition ${textSizeClass} ${
        selected ? "ring-2 ring-muted-foreground ring-offset-2 rounded" : ""
      }`}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleFocusKeyDown}
      tabIndex={0}
      aria-label={`Text: ${stripHtml(data.label)}`}
      style={nodeStyle}
    >
      <div className="flex items-center gap-1.5">
        {data.style?.icon && (
          <span
            className="flex-shrink-0 flex items-center"
            style={{ color: data.style?.iconColor ?? data.style?.textColor }}
          >
            <NodeIconDisplay icon={data.style.icon} className="h-[1em] w-[1em]" />
          </span>
        )}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <RichTextEditor
              value={draftLabel}
              onChange={setDraftLabel}
              onBlur={commitLabel}
              onEnter={handleEnter}
              onEscape={handleEscape}
              placeholder="Heading"
              className="w-full bg-transparent"
              textColor={data.style?.textColor}
              singleLine
              autoFocus
            />
          ) : (
            <div
              className="node-rich-text w-full"
              dangerouslySetInnerHTML={{ __html: data.label }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
