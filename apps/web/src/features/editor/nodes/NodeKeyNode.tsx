import { NodeResizer } from "@reactflow/node-resizer";
import "@reactflow/node-resizer/dist/style.css";
import { Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { type NodeProps } from "reactflow";

import { NodeIconDisplay } from "../../../components/ui/icon-picker";
import { Kbd } from "../../../components/ui/kbd";
import {
  type NodeKind,
  type NodeStyle,
  useGraphStore,
} from "../../../store/graphStore";

const MIN_WIDTH = 150;
const MIN_HEIGHT = 100;

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

export default function NodeKeyNode({
  id,
  data,
  selected,
}: NodeProps<NodeKeyData>) {
  const { selectGroupNodes, updateNodeLabel, updateNodeBody } = useGraphStore();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState(data.label);
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

  const saveEntries = (newEntries: NodeKeyEntry[]) => {
    updateNodeBody(id, JSON.stringify(newEntries));
  };

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
    if (draftTitle.trim()) {
      updateNodeLabel(id, draftTitle.trim());
    }
  };

  const handleTitleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleTitleBlur();
    } else if (event.key === "Escape") {
      setIsEditingTitle(false);
      setDraftTitle(data.label);
    }
  };

  const handleEntryLabelChange = (entryId: string, newLabel: string) => {
    const newEntries = entries.map((e) =>
      e.id === entryId ? { ...e, label: newLabel } : e
    );
    saveEntries(newEntries);
  };

  const handleEntryColorChange = (entryId: string, newColor: string) => {
    const newEntries = entries.map((e) =>
      e.id === entryId ? { ...e, color: newColor } : e
    );
    saveEntries(newEntries);
  };

  const handleEntryShapeChange = (entryId: string, newShape: NodeKeyEntry["shape"]) => {
    const newEntries = entries.map((e) =>
      e.id === entryId ? { ...e, shape: newShape } : e
    );
    saveEntries(newEntries);
  };

  const addEntry = () => {
    const newEntry: NodeKeyEntry = {
      id: crypto.randomUUID(),
      label: "New node type",
      color: "#94A3B8",
      shape: "rounded",
    };
    saveEntries([...entries, newEntry]);
  };

  const removeEntry = (entryId: string) => {
    saveEntries(entries.filter((e) => e.id !== entryId));
  };

  // Handle Tab key to add new entry when selected
  useEffect(() => {
    if (!selected) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab" && !event.shiftKey) {
        const activeElement = document.activeElement;
        const isInInput = activeElement?.tagName === "INPUT" || activeElement?.tagName === "TEXTAREA";

        if (containerRef.current?.contains(activeElement as Node) || !isInInput) {
          event.preventDefault();
          addEntry();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selected, entries]);

  const getShapeClass = (shape: NodeKeyEntry["shape"]) => {
    switch (shape) {
      case "circle": return "rounded-full";
      case "pill": return "rounded-full";
      case "square": return "rounded-none";
      default: return "rounded";
    }
  };

  const getShapeLabel = (shape: NodeKeyEntry["shape"]) => {
    switch (shape) {
      case "circle": return "●";
      case "pill": return "⬬";
      case "square": return "■";
      default: return "▢";
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
  const borderColor = selected && hasBorder
    ? "#64748b"
    : (data.style?.borderColor ?? "#e2e8f0");

  // Text colors from style
  const titleColor = data.style?.textColor ?? "#334155";
  const bodyTextColor = data.style?.bodyTextColor ?? "#64748b";
  const separatorColor = data.style?.iconColor ?? "#e2e8f0"; // Reusing iconColor for separator

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
        lineClassName="!border-slate-400"
        handleClassName="!w-2.5 !h-2.5 !bg-white !border-slate-400"
      />
      <div
        ref={containerRef}
        className={`relative h-full w-full flex flex-col rounded-lg p-3 transition ${selected && !hasBorder ? "ring-2 ring-slate-500 ring-offset-0" : ""}`}
        style={nodeStyle}
        onMouseDown={handleMouseDown}
        tabIndex={0}
      >
        {/* Title with optional icon */}
        <div
          className="mb-2 border-b pb-2 flex-shrink-0"
          style={{ borderColor: separatorColor }}
        >
          <div className="flex items-center gap-1.5">
            {data.style?.icon && (
              <span
                className="flex-shrink-0 flex items-center"
                style={{ color: separatorColor }}
              >
                <NodeIconDisplay icon={data.style.icon} className="h-3.5 w-3.5" />
              </span>
            )}
            {isEditingTitle ? (
              <input
                type="text"
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={handleTitleKeyDown}
                className="w-full bg-transparent text-xs font-semibold outline-none"
                style={{ color: titleColor }}
                autoFocus
              />
            ) : (
              <div
                className="text-xs font-semibold cursor-text"
                style={{ color: titleColor }}
                onDoubleClick={handleTitleDoubleClick}
              >
                {data.label}
              </div>
            )}
          </div>
        </div>

        {/* Entries */}
        <div className="space-y-1.5 flex-1 overflow-y-auto">
          {entries.map((entry) => (
            <div key={entry.id} className="flex items-center gap-2 group">
              {/* Color picker */}
              <input
                type="color"
                value={entry.color}
                onChange={(e) => handleEntryColorChange(entry.id, e.target.value)}
                className="nodrag h-4 w-4 cursor-pointer rounded border-0 p-0"
                title="Change color"
              />
              {/* Node shape preview */}
              <div
                className={`w-5 h-5 flex items-center justify-center border ${getShapeClass(entry.shape)}`}
                style={{ backgroundColor: entry.color, borderColor: separatorColor }}
              />
              {/* Shape toggle */}
              <button
                type="button"
                onClick={() => handleEntryShapeChange(entry.id, cycleShape(entry.shape))}
                className="nodrag text-[10px] w-4 hover:opacity-70"
                style={{ color: bodyTextColor }}
                title="Toggle shape"
              >
                {getShapeLabel(entry.shape)}
              </button>
              {/* Label */}
              <input
                type="text"
                value={entry.label}
                onChange={(e) => handleEntryLabelChange(entry.id, e.target.value)}
                className="nodrag flex-1 bg-transparent text-[11px] outline-none min-w-0"
                style={{ color: bodyTextColor }}
                placeholder="Label"
              />
              {/* Delete button */}
              <button
                type="button"
                onClick={() => removeEntry(entry.id)}
                className="nodrag opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity"
                style={{ color: bodyTextColor }}
                title="Remove entry"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Tab hint popover when selected */}
        {selected && (
          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 pointer-events-none z-50">
            <div className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-1 shadow-md text-[11px] text-slate-500 whitespace-nowrap">
              <Kbd>Tab</Kbd>
              <span>to add entry</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
