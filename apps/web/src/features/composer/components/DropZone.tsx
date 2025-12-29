/**
 * @file DropZone.tsx
 * @description Interactive drop zone for building node layouts with sortable rows, handle slots, content slots, and live preview
 */

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useComposerStore } from "../composerStore";
import type { ComposedRow, ComposedHandle, ContentBlock } from "../types";
import { BlockRenderer } from "./blocks";
import { ChevronUp, ChevronDown, Plus, Trash2, Copy } from "lucide-react";
import { NodeIconDisplay } from "../../../components/ui/icon-picker";
import { cn } from "../../../lib/utils";
import { BORDER_RADIUS, SHADOWS } from "../constants";

// Handle display component
function HandleDisplay({
  handle,
  position,
}: {
  handle?: ComposedHandle;
  position: "left" | "right";
}) {
  if (!handle) {
    return (
      <div className="w-16 flex items-center justify-center">
        <div className="w-3 h-3 rounded-full border-2 border-dashed border-muted-foreground/30" />
      </div>
    );
  }

  const isTarget = handle.type === "target";

  return (
    <div
      className={cn(
        "w-16 flex items-center gap-1",
        position === "left" ? "justify-start" : "justify-end"
      )}
    >
      {position === "right" && handle.label && (
        <span className="text-xs text-muted-foreground truncate max-w-[40px]">{handle.label}</span>
      )}
      <div
        className={cn("w-3 h-3 rounded-full border-2", isTarget ? "bg-background" : "bg-current")}
        style={{ borderColor: handle.color || "#64748b", color: handle.color || "#64748b" }}
      />
      {position === "left" && handle.label && (
        <span className="text-xs text-muted-foreground truncate max-w-[40px]">{handle.label}</span>
      )}
    </div>
  );
}

// Handle slot for dropping handles
function HandleSlot({
  rowId,
  position,
  handle,
}: {
  rowId: string;
  position: "left" | "right";
  handle?: ComposedHandle;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `handle-slot-${rowId}-${position}`,
    data: { type: "handle-slot", rowId, position },
  });

  const { selectElement, selectedRowId, selectedElementType, setRowHandle } = useComposerStore();
  const isSelected =
    selectedRowId === rowId &&
    selectedElementType === (position === "left" ? "leftHandle" : "rightHandle");

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (handle) {
      selectElement(rowId, position === "left" ? "leftHandle" : "rightHandle");
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRowHandle(rowId, position, undefined);
  };

  return (
    <div
      ref={setNodeRef}
      onClick={handleClick}
      className={cn(
        "relative p-1 rounded transition-colors min-h-[28px] flex items-center",
        isOver && "bg-primary/10 ring-2 ring-primary/30",
        isSelected && "ring-2 ring-primary",
        handle && "cursor-pointer hover:bg-muted"
      )}
    >
      <HandleDisplay handle={handle} position={position} />
      {handle && isSelected && (
        <button
          onClick={handleRemove}
          className="absolute -top-1 -right-1 p-0.5 rounded-full bg-destructive text-destructive-foreground"
        >
          <Trash2 className="h-2.5 w-2.5" />
        </button>
      )}
    </div>
  );
}

// Content slot for dropping content blocks
function ContentSlot({ rowId, content }: { rowId: string; content?: ContentBlock }) {
  const { isOver, setNodeRef } = useDroppable({
    id: `content-slot-${rowId}`,
    data: { type: "content-slot", rowId },
  });

  const { selectElement, selectedRowId, selectedElementType, setRowContent } = useComposerStore();
  const isSelected = selectedRowId === rowId && selectedElementType === "content";

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (content) {
      selectElement(rowId, "content");
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRowContent(rowId, undefined);
  };

  // Get background color from header block if applicable
  const backgroundColor =
    content?.type === "header"
      ? (content as { backgroundColor?: string }).backgroundColor
      : undefined;

  return (
    <div
      ref={setNodeRef}
      onClick={handleClick}
      className={cn(
        "flex-1 min-h-[28px] rounded transition-colors relative",
        isOver && "bg-primary/10 ring-2 ring-primary/30",
        isSelected && "ring-2 ring-primary",
        content ? "cursor-pointer" : "border-2 border-dashed border-muted-foreground/20"
      )}
      style={{ backgroundColor }}
    >
      {content ? (
        <div className="p-2">
          <BlockRenderer block={content} />
        </div>
      ) : (
        <div className="flex items-center justify-center h-full text-xs text-muted-foreground p-2">
          Drop content here
        </div>
      )}
      {content && isSelected && (
        <button
          onClick={handleRemove}
          className="absolute -top-1 -right-1 p-0.5 rounded-full bg-destructive text-destructive-foreground z-10"
        >
          <Trash2 className="h-2.5 w-2.5" />
        </button>
      )}
    </div>
  );
}

// Sortable row component
function SortableRow({
  row,
  index,
  totalRows,
}: {
  row: ComposedRow;
  index: number;
  totalRows: number;
}) {
  const { selectRow, selectedRowId, removeRow, reorderRows, duplicateRow } = useComposerStore();
  const isSelected = selectedRowId === row.id;

  const { setNodeRef, transform, transition, isDragging } = useSortable({
    id: row.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleRowClick = () => {
    selectRow(row.id);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeRow(row.id);
  };

  const handleMoveUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (index > 0) {
      reorderRows(index, index - 1);
    }
  };

  const handleMoveDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (index < totalRows - 1) {
      reorderRows(index, index + 1);
    }
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateRow(row.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={handleRowClick}
      className={cn(
        "group flex items-stretch gap-2 p-2 rounded-md border bg-background transition-all",
        isDragging && "opacity-50 shadow-lg",
        isSelected
          ? "border-primary ring-1 ring-primary/20"
          : "border-border hover:border-muted-foreground/50"
      )}
    >
      {/* Move up/down buttons */}
      <div className="flex flex-col justify-center gap-0.5">
        <button
          onClick={handleMoveUp}
          disabled={index === 0}
          className={cn(
            "p-0.5 rounded transition-colors",
            index === 0
              ? "text-muted-foreground/20 cursor-not-allowed"
              : "text-muted-foreground/50 hover:text-foreground hover:bg-muted"
          )}
        >
          <ChevronUp className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={handleMoveDown}
          disabled={index === totalRows - 1}
          className={cn(
            "p-0.5 rounded transition-colors",
            index === totalRows - 1
              ? "text-muted-foreground/20 cursor-not-allowed"
              : "text-muted-foreground/50 hover:text-foreground hover:bg-muted"
          )}
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Left handle slot */}
      <HandleSlot rowId={row.id} position="left" handle={row.leftHandle} />

      {/* Content slot */}
      <ContentSlot rowId={row.id} content={row.content} />

      {/* Right handle slot */}
      <HandleSlot rowId={row.id} position="right" handle={row.rightHandle} />

      {/* Action buttons */}
      <div className="flex flex-col justify-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleDuplicate}
          className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded"
          title="Duplicate row"
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={handleRemove}
          className="p-1 text-muted-foreground hover:text-destructive hover:bg-muted rounded"
          title="Remove row"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// New row drop zone
function NewRowDropZone() {
  const { isOver, setNodeRef } = useDroppable({
    id: "new-row",
    data: { type: "new-row" },
  });

  const { addRow } = useComposerStore();

  return (
    <div
      ref={setNodeRef}
      onClick={() => addRow()}
      className={cn(
        "flex items-center justify-center gap-2 p-4 rounded-md border-2 border-dashed cursor-pointer transition-colors",
        isOver
          ? "border-primary bg-primary/10"
          : "border-muted-foreground/30 hover:border-muted-foreground/50 hover:bg-muted/50"
      )}
    >
      <Plus className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">
        {isOver ? "Drop to add row" : "Add row or drop component"}
      </span>
    </div>
  );
}

// Preview pane showing the actual node
function PreviewPane() {
  const { currentLayout } = useComposerStore();

  if (!currentLayout) return null;

  const style = currentLayout.style;
  const borderRadius = BORDER_RADIUS[style.borderRadius || "md"];
  const shadow = SHADOWS[style.shadow || "sm"];

  return (
    <div className="p-4 bg-muted/50 border-t border-border">
      <div className="text-xs font-medium text-muted-foreground mb-3">Preview</div>
      <div className="flex justify-center">
        <div
          className="min-w-[200px] max-w-[300px] overflow-hidden"
          style={{
            backgroundColor: style.backgroundColor,
            borderColor: style.borderColor,
            borderWidth: style.borderWidth,
            borderStyle: style.borderStyle,
            borderRadius,
            boxShadow: shadow,
          }}
        >
          {/* Header */}
          {currentLayout.header && (
            <div
              className="px-3 py-2 border-b"
              style={{
                backgroundColor: currentLayout.header.backgroundColor,
                borderColor: style.borderColor,
              }}
            >
              <div
                className="font-medium text-sm flex items-center gap-1.5"
                style={{ color: currentLayout.header.textColor }}
              >
                {currentLayout.header.icon && (
                  <NodeIconDisplay
                    icon={currentLayout.header.icon}
                    className="h-4 w-4 flex-shrink-0"
                  />
                )}
                {currentLayout.header.title || "Title"}
              </div>
              {currentLayout.header.subtitle && (
                <div className="text-xs text-muted-foreground mt-0.5">
                  {currentLayout.header.subtitle}
                </div>
              )}
            </div>
          )}

          {/* Rows */}
          <div className="p-2 space-y-1">
            {currentLayout.rows.length === 0 ? (
              <div className="text-xs text-muted-foreground text-center py-4">No rows yet</div>
            ) : (
              currentLayout.rows.map((row) => (
                <div key={row.id} className="flex items-center gap-2 py-1">
                  {/* Left handle preview */}
                  {row.leftHandle && (
                    <div
                      className="w-2 h-2 rounded-full border"
                      style={{ borderColor: row.leftHandle.color || "#64748b" }}
                    />
                  )}

                  {/* Content preview */}
                  <div className="flex-1 min-w-0">
                    {row.content ? (
                      <BlockRenderer block={row.content} preview />
                    ) : (
                      <div className="h-4" />
                    )}
                  </div>

                  {/* Right handle preview */}
                  {row.rightHandle && (
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: row.rightHandle.color || "#64748b" }}
                    />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {currentLayout.footer && currentLayout.footer.content && (
            <div
              className="px-3 py-2 border-t"
              style={{
                backgroundColor: currentLayout.footer.backgroundColor,
                borderColor: style.borderColor,
              }}
            >
              <BlockRenderer block={currentLayout.footer.content} preview />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function DropZone() {
  const { currentLayout, clearSelection } = useComposerStore();

  if (!currentLayout) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        No layout loaded
      </div>
    );
  }

  const rowIds = currentLayout.rows.map((r) => r.id);

  // Clear selection when clicking on the background (not on a row)
  const handleBackgroundClick = (e: React.MouseEvent) => {
    // Only clear if clicking directly on the background, not on a child element
    if (e.target === e.currentTarget) {
      clearSelection();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Build area */}
      <div className="flex-1 overflow-y-auto p-4" onClick={handleBackgroundClick}>
        <div className="max-w-xl mx-auto space-y-2" onClick={handleBackgroundClick}>
          <SortableContext items={rowIds} strategy={verticalListSortingStrategy}>
            {currentLayout.rows.map((row, index) => (
              <SortableRow
                key={row.id}
                row={row}
                index={index}
                totalRows={currentLayout.rows.length}
              />
            ))}
          </SortableContext>

          <NewRowDropZone />
        </div>
      </div>

      {/* Preview */}
      <PreviewPane />
    </div>
  );
}
