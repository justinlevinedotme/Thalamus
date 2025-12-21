import { Copy, Focus, Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";

import { useGraphStore } from "../../store/graphStore";

type ContextMenuState = {
  type: "node" | "edge" | "pane";
  nodeId?: string;
  edgeId?: string;
  position: { x: number; y: number };
} | null;

type CanvasContextMenuProps = {
  menu: ContextMenuState;
  onClose: () => void;
};

export default function CanvasContextMenu({
  menu,
  onClose,
}: CanvasContextMenuProps) {
  const {
    duplicateNode,
    deleteNode,
    deleteEdge,
    startEditingNode,
    setFocusNode,
    addNode,
    flowInstance,
  } = useGraphStore();
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

  const handleDuplicate = useCallback(() => {
    if (menu?.type === "node" && menu.nodeId) {
      duplicateNode(menu.nodeId);
    }
    onClose();
  }, [duplicateNode, menu, onClose]);

  const handleDelete = useCallback(() => {
    if (menu?.type === "node" && menu.nodeId) {
      deleteNode(menu.nodeId);
    } else if (menu?.type === "edge" && menu.edgeId) {
      deleteEdge(menu.edgeId);
    }
    onClose();
  }, [deleteNode, deleteEdge, menu, onClose]);

  const handleEdit = useCallback(() => {
    if (menu?.type === "node" && menu.nodeId) {
      startEditingNode(menu.nodeId);
    }
    onClose();
  }, [menu, onClose, startEditingNode]);

  const handleFocus = useCallback(() => {
    if (menu?.type === "node" && menu.nodeId) {
      setFocusNode(menu.nodeId);
    }
    onClose();
  }, [menu, onClose, setFocusNode]);

  const handleAddNode = useCallback(() => {
    if (menu?.type === "pane" && flowInstance) {
      const position = flowInstance.screenToFlowPosition(menu.position);
      addNode({ position });
    }
    onClose();
  }, [addNode, flowInstance, menu, onClose]);

  if (!menu) {
    return null;
  }

  const menuItemClass =
    "flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 transition cursor-pointer";
  const dangerItemClass =
    "flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition cursor-pointer";

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[160px] rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
      style={{
        left: menu.position.x,
        top: menu.position.y,
      }}
    >
      {menu.type === "node" ? (
        <>
          <button className={menuItemClass} type="button" onClick={handleEdit}>
            <Pencil className="h-4 w-4" />
            Edit
          </button>
          <button
            className={menuItemClass}
            type="button"
            onClick={handleDuplicate}
          >
            <Copy className="h-4 w-4" />
            Duplicate
          </button>
          <button className={menuItemClass} type="button" onClick={handleFocus}>
            <Focus className="h-4 w-4" />
            Focus
          </button>
          <div className="my-1 h-px bg-slate-200" />
          <button
            className={dangerItemClass}
            type="button"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </>
      ) : menu.type === "edge" ? (
        <button
          className={dangerItemClass}
          type="button"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      ) : (
        <button
          className={menuItemClass}
          type="button"
          onClick={handleAddNode}
        >
          <Plus className="h-4 w-4" />
          Add Node Here
        </button>
      )}
    </div>
  );
}

export type { ContextMenuState };
