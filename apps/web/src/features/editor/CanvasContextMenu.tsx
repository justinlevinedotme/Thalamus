import { AlignHorizontalSpaceAround, AlignVerticalSpaceAround, Copy, Focus, Group, Pencil, Plus, Trash2, Ungroup } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef } from "react";

import { useGraphStore } from "../../store/graphStore";

type ContextMenuState = {
  type: "node" | "edge" | "pane" | "selection";
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
    nodes,
    duplicateNode,
    deleteNode,
    deleteEdge,
    deleteSelectedNodes,
    startEditingNode,
    setFocusNode,
    addNode,
    flowInstance,
    groupSelectedNodes,
    ungroupNodes,
    distributeNodesHorizontally,
    distributeNodesVertically,
  } = useGraphStore();
  const menuRef = useRef<HTMLDivElement>(null);

  // Get info about selected nodes for group/ungroup logic
  const selectedNodes = useMemo(
    () => nodes.filter((n) => n.selected),
    [nodes]
  );
  const selectedCount = selectedNodes.length;

  // Check if right-clicked node is part of a group
  const clickedNode = menu?.nodeId ? nodes.find((n) => n.id === menu.nodeId) : null;
  const clickedNodeGroupId = clickedNode?.data?.groupId;

  // For selection context menu, check if all selected are in same group
  const selectedGroupIds = useMemo(() => {
    const groupIds = new Set<string>(
      selectedNodes.map((n) => n.data.groupId).filter((id): id is string => Boolean(id))
    );
    return groupIds;
  }, [selectedNodes]);

  // Can group if 2+ nodes selected and none are already grouped
  const canGroup = selectedCount >= 2 && selectedGroupIds.size === 0;

  // Can ungroup if any selected nodes are in a group
  const canUngroup = selectedGroupIds.size > 0;

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

  const handleGroup = useCallback(() => {
    groupSelectedNodes();
    onClose();
  }, [groupSelectedNodes, onClose]);

  const handleUngroup = useCallback(() => {
    // Ungroup all selected groups
    for (const groupId of selectedGroupIds) {
      ungroupNodes(groupId);
    }
    onClose();
  }, [selectedGroupIds, ungroupNodes, onClose]);

  const handleUngroupSingle = useCallback(() => {
    if (clickedNodeGroupId) {
      ungroupNodes(clickedNodeGroupId);
    }
    onClose();
  }, [clickedNodeGroupId, ungroupNodes, onClose]);

  const handleDistributeHorizontally = useCallback(() => {
    distributeNodesHorizontally();
    onClose();
  }, [distributeNodesHorizontally, onClose]);

  const handleDistributeVertically = useCallback(() => {
    distributeNodesVertically();
    onClose();
  }, [distributeNodesVertically, onClose]);

  const handleDeleteSelection = useCallback(() => {
    deleteSelectedNodes();
    onClose();
  }, [deleteSelectedNodes, onClose]);

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
      {menu.type === "selection" ? (
        <>
          {canGroup && (
            <button className={menuItemClass} type="button" onClick={handleGroup}>
              <Group className="h-4 w-4" />
              Group ({selectedCount} nodes)
            </button>
          )}
          {canUngroup && (
            <button className={menuItemClass} type="button" onClick={handleUngroup}>
              <Ungroup className="h-4 w-4" />
              Ungroup
            </button>
          )}
          {selectedCount >= 2 && (
            <>
              <button className={menuItemClass} type="button" onClick={handleDistributeHorizontally}>
                <AlignHorizontalSpaceAround className="h-4 w-4" />
                Distribute Horizontally
              </button>
              <button className={menuItemClass} type="button" onClick={handleDistributeVertically}>
                <AlignVerticalSpaceAround className="h-4 w-4" />
                Distribute Vertically
              </button>
            </>
          )}
          {(canGroup || canUngroup || selectedCount >= 2) && <div className="my-1 h-px bg-slate-200" />}
          <button
            className={dangerItemClass}
            type="button"
            onClick={handleDeleteSelection}
          >
            <Trash2 className="h-4 w-4" />
            Delete ({selectedCount} nodes)
          </button>
        </>
      ) : menu.type === "node" ? (
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
          {clickedNodeGroupId && (
            <>
              <div className="my-1 h-px bg-slate-200" />
              <button className={menuItemClass} type="button" onClick={handleUngroupSingle}>
                <Ungroup className="h-4 w-4" />
                Ungroup
              </button>
            </>
          )}
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
