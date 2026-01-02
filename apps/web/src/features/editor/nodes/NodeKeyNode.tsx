/**
 * @file NodeKeyNode.tsx
 * @description Node key/legend node component for displaying and managing a list of node type definitions with colors, shapes, and labels
 */

import { Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { NodeResizer, type Node, type NodeProps } from "@xyflow/react";

import RichTextEditor from "../../../components/RichTextEditor";
import { ColorPicker, ColorSwatch } from "../../../components/ui/color-picker";
import { NodeIconDisplay } from "../../../components/ui/icon-picker";
import { Kbd } from "../../../components/ui/kbd";
import { type NodeKind, type NodeStyle, useGraphStore } from "../../../store/graphStore";

// Strip HTML tags for plain text comparison
const stripHtml = (html: string): string => {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
};

const MIN_WIDTH = 144; // 12 × 12 for grid alignment
const MIN_HEIGHT = 96; // 12 × 8 for grid alignment

type NodeKeyEntry = {
  id: string;
  label: string;
  color: string;
  shape: "rounded" | "circle" | "square" | "pill";
  borderColor?: string;
  borderStyle?: "solid" | "dashed" | "dotted";
};

type NodeKeyData = {
  label: string;
  body?: string;
  kind: NodeKind;
  style?: NodeStyle;
  groupId?: string;
  entries?: NodeKeyEntry[];
};

type NodeKeyNodeType = Node<NodeKeyData, "nodeKey">;

// Default text color for nodes without explicit textColor (ensures readability on light backgrounds)
const DEFAULT_TEXT_COLOR = "#1f2937"; // gray-800

export default function NodeKeyNode({ id, data, selected }: NodeProps<NodeKeyNodeType>) {
  const { selectGroupNodes, updateNodeLabel, updateNodeBody } = useGraphStore();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState(data.label);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [draftEntryLabel, setDraftEntryLabel] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse entries from body or use defaults
  const entries: NodeKeyEntry[] = (() => {
    try {
      if (data.body) {
        return JSON.parse(data.body);
      }
    } catch {
      // Invalid JSON, use defaults
    }
    return [
      { id: "1", label: "Ideas", color: "#E2E8F0", shape: "rounded" },
      { id: "2", label: "Questions", color: "#FDE68A", shape: "circle" },
      { id: "3", label: "Evidence", color: "#BBF7D0", shape: "rounded" },
    ];
  })();

  const saveEntries = useCallback(
    (newEntries: NodeKeyEntry[]) => {
      updateNodeBody(id, JSON.stringify(newEntries));
    },
    [id, updateNodeBody]
  );

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

  const handleTitleDoubleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsEditingTitle(true);
    setDraftTitle(data.label);
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    const plainText = stripHtml(draftTitle);
    if (plainText.trim()) {
      updateNodeLabel(id, draftTitle);
    }
  };

  const handleEntryLabelChange = (entryId: string, newLabel: string) => {
    const newEntries = entries.map((e) => (e.id === entryId ? { ...e, label: newLabel } : e));
    saveEntries(newEntries);
  };

  const handleEntryLabelCommit = (entryId: string) => {
    const plainText = stripHtml(draftEntryLabel);
    const finalLabel = plainText.trim() ? draftEntryLabel : "Label";
    handleEntryLabelChange(entryId, finalLabel);
    setEditingEntryId(null);
  };

  const startEditingEntry = (entryId: string, currentLabel: string) => {
    setEditingEntryId(entryId);
    setDraftEntryLabel(currentLabel);
  };

  const handleEntryColorChange = (entryId: string, newColor: string) => {
    const newEntries = entries.map((e) => (e.id === entryId ? { ...e, color: newColor } : e));
    saveEntries(newEntries);
  };

  const handleEntryShapeChange = (entryId: string, newShape: NodeKeyEntry["shape"]) => {
    const newEntries = entries.map((e) => (e.id === entryId ? { ...e, shape: newShape } : e));
    saveEntries(newEntries);
  };

  const addEntry = useCallback(() => {
    const newEntry: NodeKeyEntry = {
      id: crypto.randomUUID(),
      label: "New node type",
      color: "#94A3B8",
      shape: "rounded",
    };
    saveEntries([...entries, newEntry]);
  }, [entries, saveEntries]);

  const removeEntry = (entryId: string) => {
    saveEntries(entries.filter((e) => e.id !== entryId));
  };

  // Handle Tab key to add new entry when selected
  useEffect(() => {
    if (!selected) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab" && !event.shiftKey) {
        const activeElement = document.activeElement;
        const isInInput =
          activeElement?.tagName === "INPUT" || activeElement?.tagName === "TEXTAREA";

        if (containerRef.current?.contains(activeElement as globalThis.Node) || !isInInput) {
          event.preventDefault();
          addEntry();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selected, entries, addEntry]);

  const getShapeClass = (shape: NodeKeyEntry["shape"]) => {
    switch (shape) {
      case "circle":
        return "rounded-full";
      case "pill":
        return "rounded-full";
      case "square":
        return "rounded-none";
      default:
        return "rounded";
    }
  };

  const getShapeLabel = (shape: NodeKeyEntry["shape"]) => {
    switch (shape) {
      case "circle":
        return "●";
      case "pill":
        return "⬬";
      case "square":
        return "■";
      default:
        return "▢";
    }
  };

  const cycleShape = (current: NodeKeyEntry["shape"]): NodeKeyEntry["shape"] => {
    const shapes: NodeKeyEntry["shape"][] = ["rounded", "circle", "square", "pill"];
    const idx = shapes.indexOf(current);
    return shapes[(idx + 1) % shapes.length];
  };

  const borderWidth = data.style?.borderWidth ?? 1;
  const borderStyle = data.style?.borderStyle ?? "solid";
  const hasBorder = borderWidth > 0;
  const borderColor = selected && hasBorder ? undefined : data.style?.borderColor;

  // Text colors from style with fallback for existing nodes
  const titleColor = data.style?.textColor ?? DEFAULT_TEXT_COLOR;
  const bodyTextColor = data.style?.bodyTextColor ?? DEFAULT_TEXT_COLOR;
  const separatorColor = data.style?.separatorColor;
  const iconColor = data.style?.iconColor ?? DEFAULT_TEXT_COLOR;

  const nodeStyle: React.CSSProperties = {
    backgroundColor: data.style?.color ?? "#FFFFFF",
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
        lineClassName="!border-muted-foreground"
        handleClassName="!w-2.5 !h-2.5 !bg-background !border-muted-foreground"
      />
      <div
        ref={containerRef}
        className={`relative h-full w-full flex flex-col rounded-lg p-3 transition ${
          selected && hasBorder ? "!border-blue-500" : ""
        } ${selected && !hasBorder ? "ring-2 ring-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.35)]" : ""}`}
        style={nodeStyle}
        onMouseDown={handleMouseDown}
        tabIndex={0}
      >
        {/* Title with optional icon */}
        <div className="mb-2 border-b pb-2 flex-shrink-0" style={{ borderColor: separatorColor }}>
          <div className="flex items-center gap-1.5">
            {data.style?.icon && (
              <span className="flex-shrink-0 flex items-center" style={{ color: iconColor }}>
                <NodeIconDisplay icon={data.style.icon} className="h-3.5 w-3.5" />
              </span>
            )}
            {isEditingTitle ? (
              <RichTextEditor
                value={draftTitle}
                onChange={setDraftTitle}
                onBlur={handleTitleBlur}
                onEscape={() => {
                  setIsEditingTitle(false);
                  setDraftTitle(data.label);
                }}
                onEnter={handleTitleBlur}
                placeholder="Title"
                className="w-full bg-transparent text-xs font-semibold"
                textColor={titleColor}
                singleLine
                autoFocus
              />
            ) : (
              <div
                className="node-rich-text text-xs font-semibold cursor-text"
                style={{ color: titleColor }}
                onDoubleClick={handleTitleDoubleClick}
                dangerouslySetInnerHTML={{ __html: data.label }}
              />
            )}
          </div>
        </div>

        {/* Entries */}
        <div className="space-y-1.5 flex-1 overflow-y-auto">
          {entries.map((entry) => (
            <div key={entry.id} className="flex items-center gap-2 group">
              {/* Color picker - only show when selected */}
              {selected && (
                <ColorPicker
                  value={entry.color}
                  onChange={(color) => handleEntryColorChange(entry.id, color)}
                  showAlpha={false}
                >
                  <button
                    type="button"
                    className="nodrag flex h-4 w-4 cursor-pointer items-center justify-center"
                    title="Change color"
                  >
                    <ColorSwatch color={entry.color} className="h-4 w-4" />
                  </button>
                </ColorPicker>
              )}
              {/* Node shape preview */}
              <div
                className={`w-5 h-5 flex items-center justify-center border ${getShapeClass(entry.shape)}`}
                style={{ backgroundColor: entry.color, borderColor: separatorColor }}
              />
              {/* Shape toggle - only show when selected */}
              {selected && (
                <button
                  type="button"
                  onClick={() => handleEntryShapeChange(entry.id, cycleShape(entry.shape))}
                  className="nodrag text-[10px] w-4 hover:opacity-70"
                  style={{ color: bodyTextColor }}
                  title="Toggle shape"
                >
                  {getShapeLabel(entry.shape)}
                </button>
              )}
              {/* Label */}
              {editingEntryId === entry.id ? (
                <div className="flex-1 min-w-0">
                  <RichTextEditor
                    value={draftEntryLabel}
                    onChange={setDraftEntryLabel}
                    onBlur={() => handleEntryLabelCommit(entry.id)}
                    onEscape={() => {
                      setEditingEntryId(null);
                      setDraftEntryLabel(entry.label);
                    }}
                    onEnter={() => handleEntryLabelCommit(entry.id)}
                    placeholder="Label"
                    className="nodrag bg-transparent text-[11px]"
                    textColor={bodyTextColor}
                    singleLine
                    autoFocus
                  />
                </div>
              ) : (
                <div
                  className="nodrag node-rich-text flex-1 min-w-0 text-[11px] cursor-text"
                  style={{ color: bodyTextColor }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    startEditingEntry(entry.id, entry.label);
                  }}
                  dangerouslySetInnerHTML={{ __html: entry.label }}
                />
              )}
              {/* Delete button - only show when selected */}
              {selected && (
                <button
                  type="button"
                  onClick={() => removeEntry(entry.id)}
                  className="nodrag opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity"
                  style={{ color: bodyTextColor }}
                  title="Remove entry"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Tab hint popover when selected */}
        {selected && (
          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 pointer-events-none z-50">
            <div className="flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 shadow-md text-[11px] text-muted-foreground whitespace-nowrap">
              <Kbd>Tab</Kbd>
              <span>to add entry</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
