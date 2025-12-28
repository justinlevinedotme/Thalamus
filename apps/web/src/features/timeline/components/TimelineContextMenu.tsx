import { useCallback, useEffect, useRef } from "react";
import { Calendar, Clock, Copy, Pencil, Plus, Trash2 } from "lucide-react";

import { Kbd } from "../../../components/ui/kbd";
import { useTimelineStore } from "../timelineStore";
import type { TimelineTrack } from "../types";

export type TimelineContextMenuState = {
  type: "node" | "pane";
  nodeId?: string;
  trackId?: string;
  position: { x: number; y: number };
  flowPosition: { x: number; y: number };
} | null;

type TimelineContextMenuProps = {
  menu: TimelineContextMenuState;
  onClose: () => void;
  onAddEvent: (trackId: string, position: { x: number; y: number }) => void;
  onAddSpan: (trackId: string, position: { x: number; y: number }) => void;
  onEditNode: (nodeId: string) => void;
  tracks: TimelineTrack[];
};

export function TimelineContextMenu({
  menu,
  onClose,
  onAddEvent,
  onAddSpan,
  onEditNode,
  tracks,
}: TimelineContextMenuProps) {
  const { nodes, deleteNode } = useTimelineStore();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside or escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const handleAddEvent = useCallback(() => {
    if (menu?.type === "pane" && menu.trackId) {
      onAddEvent(menu.trackId, menu.flowPosition);
    }
    onClose();
  }, [menu, onAddEvent, onClose]);

  const handleAddSpan = useCallback(() => {
    if (menu?.type === "pane" && menu.trackId) {
      onAddSpan(menu.trackId, menu.flowPosition);
    }
    onClose();
  }, [menu, onAddSpan, onClose]);

  const handleEdit = useCallback(() => {
    if (menu?.type === "node" && menu.nodeId) {
      onEditNode(menu.nodeId);
    }
    onClose();
  }, [menu, onEditNode, onClose]);

  const handleDelete = useCallback(() => {
    if (menu?.type === "node" && menu.nodeId) {
      deleteNode(menu.nodeId);
    }
    onClose();
  }, [menu, deleteNode, onClose]);

  if (!menu) {
    return null;
  }

  const isMac =
    typeof navigator !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  const modKeyLabel = isMac ? "⌘" : "Ctrl";

  const menuItemClass =
    "flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary transition cursor-pointer";
  const dangerItemClass =
    "flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition cursor-pointer";

  const renderKbd = (keys: string) => (
    <span className="ml-auto flex items-center gap-0.5 text-xs text-muted-foreground">
      {keys.split("+").map((key, i) => (
        <Kbd key={i} className="text-[10px] px-1 py-0.5">
          {key}
        </Kbd>
      ))}
    </span>
  );

  // Get track info for pane context menu
  const track = menu.trackId ? tracks.find((t) => t.id === menu.trackId) : null;

  // Adjust menu position to stay within viewport
  const adjustedPosition = { ...menu.position };
  if (typeof window !== "undefined") {
    const menuWidth = 200;
    const menuHeight = menu.type === "pane" ? 120 : 100;
    if (adjustedPosition.x + menuWidth > window.innerWidth) {
      adjustedPosition.x = window.innerWidth - menuWidth - 10;
    }
    if (adjustedPosition.y + menuHeight > window.innerHeight) {
      adjustedPosition.y = window.innerHeight - menuHeight - 10;
    }
  }

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[180px] rounded-lg border border-border bg-background py-1 shadow-lg"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
      }}
    >
      {menu.type === "node" ? (
        <>
          <button className={menuItemClass} type="button" onClick={handleEdit}>
            <Pencil className="h-4 w-4" />
            Edit Event
          </button>
          <div className="my-1 h-px bg-border" />
          <button className={dangerItemClass} type="button" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
            Delete
            {renderKbd("⌫")}
          </button>
        </>
      ) : (
        <>
          {track && (
            <div className="px-3 py-1.5 text-xs text-muted-foreground flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: track.color ?? "#64748b" }}
              />
              {track.label}
            </div>
          )}
          {track && <div className="my-1 h-px bg-border" />}
          <button className={menuItemClass} type="button" onClick={handleAddEvent}>
            <Clock className="h-4 w-4" />
            Add Event
          </button>
          <button className={menuItemClass} type="button" onClick={handleAddSpan}>
            <Calendar className="h-4 w-4" />
            Add Span
          </button>
          {!track && tracks.length === 0 && (
            <>
              <div className="my-1 h-px bg-border" />
              <div className="px-3 py-2 text-xs text-muted-foreground">
                Add a track first to create events
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
