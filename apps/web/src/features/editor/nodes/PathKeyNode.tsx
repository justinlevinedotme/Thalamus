import { NodeResizer } from "@reactflow/node-resizer";
import "@reactflow/node-resizer/dist/style.css";
import { Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { type NodeProps } from "reactflow";

import { ColorPicker, ColorSwatch } from "../../../components/ui/color-picker";
import { NodeIconDisplay } from "../../../components/ui/icon-picker";
import { Kbd } from "../../../components/ui/kbd";
import {
  type NodeKind,
  type NodeStyle,
  useGraphStore,
} from "../../../store/graphStore";

const MIN_WIDTH = 150;
const MIN_HEIGHT = 100;

type PathKeyEntry = {
  id: string;
  label: string;
  color: string;
  style: "solid" | "dashed";
  thickness: number;
};

type PathKeyData = {
  label: string;
  body?: string;
  kind: NodeKind;
  style?: NodeStyle;
  groupId?: string;
  entries?: PathKeyEntry[];
};

export default function PathKeyNode({
  id,
  data,
  selected,
}: NodeProps<PathKeyData>) {
  const { selectGroupNodes, updateNodeLabel, updateNodeBody } = useGraphStore();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState(data.label);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse entries from body or use defaults
  const entries: PathKeyEntry[] = (() => {
    try {
      if (data.body) {
        return JSON.parse(data.body);
      }
    } catch {
      // Invalid JSON, use defaults
    }
    return [
      { id: "1", label: "Causes", color: "#22C55E", style: "solid", thickness: 2 },
      { id: "2", label: "Supports", color: "#3B82F6", style: "solid", thickness: 2 },
      { id: "3", label: "Contradicts", color: "#EF4444", style: "dashed", thickness: 2 },
    ];
  })();

  const saveEntries = (newEntries: PathKeyEntry[]) => {
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

  const handleEntryStyleChange = (entryId: string, newStyle: "solid" | "dashed") => {
    const newEntries = entries.map((e) =>
      e.id === entryId ? { ...e, style: newStyle } : e
    );
    saveEntries(newEntries);
  };

  const addEntry = () => {
    const newEntry: PathKeyEntry = {
      id: crypto.randomUUID(),
      label: "New path",
      color: "#94A3B8",
      style: "solid",
      thickness: 2,
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
        // Check if we're not in an input field
        const activeElement = document.activeElement;
        const isInInput = activeElement?.tagName === "INPUT" || activeElement?.tagName === "TEXTAREA";

        // Only add entry if Tab is pressed while the node container is focused or we're in an entry input
        if (containerRef.current?.contains(activeElement as Node) || !isInInput) {
          event.preventDefault();
          addEntry();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selected, entries]);

  const borderWidth = data.style?.borderWidth ?? 1;
  const borderStyle = data.style?.borderStyle ?? "solid";
  const hasBorder = borderWidth > 0;
  const borderColor = selected && hasBorder
    ? "#64748b"
    : (data.style?.borderColor ?? "#e2e8f0");

  // Text colors from style
  const titleColor = data.style?.textColor ?? "#334155";
  const bodyTextColor = data.style?.bodyTextColor ?? "#64748b";
  const separatorColor = data.style?.separatorColor ?? "#e2e8f0";
  const iconColor = data.style?.iconColor ?? "#64748b";

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
                style={{ color: iconColor }}
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
              {/* Line preview */}
              <div className="w-6 flex items-center">
                <svg width="24" height="8" viewBox="0 0 24 8">
                  <line
                    x1="0"
                    y1="4"
                    x2="24"
                    y2="4"
                    stroke={entry.color}
                    strokeWidth={entry.thickness}
                    strokeDasharray={entry.style === "dashed" ? "4 2" : undefined}
                  />
                </svg>
              </div>
              {/* Style toggle - only show when selected */}
              {selected && (
                <button
                  type="button"
                  onClick={() => handleEntryStyleChange(entry.id, entry.style === "solid" ? "dashed" : "solid")}
                  className="nodrag text-[9px] w-6 hover:opacity-70"
                  style={{ color: bodyTextColor }}
                  title="Toggle line style"
                >
                  {entry.style === "solid" ? "—" : "- -"}
                </button>
              )}
              {/* Label */}
              <input
                type="text"
                value={entry.label}
                onChange={(e) => handleEntryLabelChange(entry.id, e.target.value)}
                className="nodrag flex-1 bg-transparent text-[11px] outline-none min-w-0"
                style={{ color: bodyTextColor }}
                placeholder="Label"
              />
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
