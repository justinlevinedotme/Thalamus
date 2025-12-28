import {
  DndContext,
  DragOverlay,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useState } from "react";
import { ComponentPalette } from "./ComponentPalette";
import { DropZone } from "./DropZone";
import { ConfigPanel } from "./ConfigPanel";
import { useComposerStore } from "../composerStore";
import type { DragItem, ContentBlockType, HandleType, HandlePosition } from "../types";
import { createBlockByType, createDefaultHandle, createDefaultRow } from "../types";

export function ComposerLayout() {
  const [activeDragItem, setActiveDragItem] = useState<DragItem | null>(null);
  const { addRow, setRowContent, setRowHandle } = useComposerStore();

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const dragData = active.data.current as DragItem | undefined;
    if (dragData) {
      setActiveDragItem(dragData);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragItem(null);

    if (!over) return;

    const dragData = active.data.current as DragItem | undefined;
    const dropData = over.data.current as
      | { type: string; rowId?: string; position?: "left" | "right" }
      | undefined;

    if (!dragData || !dropData) return;

    // Handle dropping from palette onto drop zone
    if (dragData.type === "palette-block" && dragData.blockType) {
      if (dropData.type === "new-row") {
        // Create a new row with the block
        const rowId = addRow();
        if (rowId) {
          const block = createBlockByType(crypto.randomUUID(), dragData.blockType);
          setRowContent(rowId, block);
        }
      } else if (dropData.type === "content-slot" && dropData.rowId) {
        // Add block to existing row
        const block = createBlockByType(crypto.randomUUID(), dragData.blockType);
        setRowContent(dropData.rowId, block);
      }
    }

    if (dragData.type === "palette-handle" && dragData.handleType && dragData.handlePosition) {
      if (dropData.type === "new-row") {
        // Create a new row with the handle
        const rowId = addRow();
        if (rowId) {
          const handle = createDefaultHandle(
            crypto.randomUUID(),
            dragData.handleType,
            dragData.handlePosition
          );
          setRowHandle(rowId, dragData.handlePosition, handle);
        }
      } else if (dropData.type === "handle-slot" && dropData.rowId && dropData.position) {
        // Add handle to existing row
        const handle = createDefaultHandle(
          crypto.randomUUID(),
          dragData.handleType,
          dragData.handlePosition
        );
        setRowHandle(dropData.rowId, dropData.position, handle);
      }
    }
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full">
        {/* Left Panel - Component Palette */}
        <div className="w-64 border-r border-border bg-muted/30 overflow-y-auto flex-shrink-0">
          <ComponentPalette />
        </div>

        {/* Center Panel - Drop Zone / Build Area */}
        <div className="flex-1 overflow-hidden flex flex-col bg-muted/10">
          <DropZone />
        </div>

        {/* Right Panel - Configuration */}
        <div className="w-80 border-l border-border bg-background overflow-y-auto flex-shrink-0">
          <ConfigPanel />
        </div>
      </div>

      {/* Drag Overlay for visual feedback */}
      <DragOverlay>
        {activeDragItem && (
          <div className="bg-background border border-border rounded-md px-3 py-2 shadow-lg text-sm">
            {activeDragItem.type === "palette-block" && (
              <span className="capitalize">{activeDragItem.blockType} Block</span>
            )}
            {activeDragItem.type === "palette-handle" && (
              <span className="capitalize">
                {activeDragItem.handleType === "target" ? "Input" : "Output"} Handle
              </span>
            )}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
