import {
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignEndHorizontal,
  AlignEndVertical,
  AlignHorizontalSpaceAround,
  AlignStartHorizontal,
  AlignStartVertical,
  AlignVerticalSpaceAround,
  ArrowDownToLine,
  ArrowUpToLine,
  ChevronRight,
  Clipboard,
  ClipboardCopy,
  Copy,
  Focus,
  Group,
  Pencil,
  Plus,
  Scissors,
  Square,
  Trash2,
  Type,
  Ungroup,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Kbd } from "../../components/ui/kbd";
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

type SubMenuType = "group" | "align" | "distribute" | null;

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
    alignNodesLeft,
    alignNodesRight,
    alignNodesCenter,
    alignNodesTop,
    alignNodesBottom,
    alignNodesMiddle,
    sendNodeToFront,
    sendNodeToBack,
    copySelectedNodes,
    cutSelectedNodes,
    pasteNodes,
  } = useGraphStore();
  const menuRef = useRef<HTMLDivElement>(null);
  const [openSubMenu, setOpenSubMenu] = useState<SubMenuType>(null);

  // Get info about selected nodes for group/ungroup logic
  const selectedNodes = useMemo(
    () => nodes.filter((n) => n.selected),
    [nodes]
  );
  const selectedCount = selectedNodes.length;

  // Check if right-clicked node is part of a group
  const clickedNode = menu?.nodeId ? nodes.find((n) => n.id === menu.nodeId) : null;
  const clickedNodeGroupId = clickedNode?.data?.groupId;
  const clickedNodeKind = clickedNode?.data?.kind;
  const isTextOrShapeNode = clickedNodeKind === "text" || clickedNodeKind === "shape";

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

  // Reset submenu when menu closes
  useEffect(() => {
    if (!menu) {
      setOpenSubMenu(null);
    }
  }, [menu]);

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
      const flowPos = flowInstance.screenToFlowPosition(menu.position);
      // Offset so node center is at cursor (typical node is ~150x50)
      const position = { x: flowPos.x - 75, y: flowPos.y - 25 };
      addNode({ position });
    }
    onClose();
  }, [addNode, flowInstance, menu, onClose]);

  const handleAddTextNode = useCallback(() => {
    if (menu?.type === "pane" && flowInstance) {
      const flowPos = flowInstance.screenToFlowPosition(menu.position);
      // Offset so text node center is at cursor (text nodes are smaller)
      const position = { x: flowPos.x - 50, y: flowPos.y - 15 };
      addNode({ position, kind: "text" });
    }
    onClose();
  }, [addNode, flowInstance, menu, onClose]);

  const handleAddShapeNode = useCallback(() => {
    if (menu?.type === "pane" && flowInstance) {
      const flowPos = flowInstance.screenToFlowPosition(menu.position);
      // Offset so shape center is at cursor (shapes default to 200x120)
      const position = { x: flowPos.x - 100, y: flowPos.y - 60 };
      addNode({ position, kind: "shape" });
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

  const handleAlignLeft = useCallback(() => {
    alignNodesLeft();
    onClose();
  }, [alignNodesLeft, onClose]);

  const handleAlignRight = useCallback(() => {
    alignNodesRight();
    onClose();
  }, [alignNodesRight, onClose]);

  const handleAlignCenter = useCallback(() => {
    alignNodesCenter();
    onClose();
  }, [alignNodesCenter, onClose]);

  const handleAlignTop = useCallback(() => {
    alignNodesTop();
    onClose();
  }, [alignNodesTop, onClose]);

  const handleAlignBottom = useCallback(() => {
    alignNodesBottom();
    onClose();
  }, [alignNodesBottom, onClose]);

  const handleAlignMiddle = useCallback(() => {
    alignNodesMiddle();
    onClose();
  }, [alignNodesMiddle, onClose]);

  const handleDeleteSelection = useCallback(() => {
    deleteSelectedNodes();
    onClose();
  }, [deleteSelectedNodes, onClose]);

  const handleSendToFront = useCallback(() => {
    if (menu?.type === "node" && menu.nodeId) {
      sendNodeToFront(menu.nodeId);
    }
    onClose();
  }, [menu, onClose, sendNodeToFront]);

  const handleSendToBack = useCallback(() => {
    if (menu?.type === "node" && menu.nodeId) {
      sendNodeToBack(menu.nodeId);
    }
    onClose();
  }, [menu, onClose, sendNodeToBack]);

  const handleCopy = useCallback(() => {
    copySelectedNodes();
    onClose();
  }, [copySelectedNodes, onClose]);

  const handleCut = useCallback(() => {
    cutSelectedNodes();
    onClose();
  }, [cutSelectedNodes, onClose]);

  const handlePaste = useCallback(() => {
    pasteNodes();
    onClose();
  }, [pasteNodes, onClose]);

  if (!menu) {
    return null;
  }

  const isMac =
    typeof navigator !== "undefined" &&
    navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  const modKeyLabel = isMac ? "⌘" : "Ctrl";

  const menuItemClass =
    "flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 transition cursor-pointer";
  const menuItemWithSubmenuClass =
    "flex w-full items-center justify-between px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 transition cursor-pointer";
  const disabledItemClass =
    "flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-400 cursor-not-allowed";
  const dangerItemClass =
    "flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition cursor-pointer";
  const subMenuClass =
    "absolute left-full top-0 ml-1 min-w-[160px] rounded-lg border border-slate-200 bg-white py-1 shadow-lg";

  const renderKbd = (keys: string) => (
    <span className="ml-auto flex items-center gap-0.5 text-xs text-slate-400">
      {keys.split("+").map((key, i) => (
        <Kbd key={i} className="text-[10px] px-1 py-0.5">
          {key}
        </Kbd>
      ))}
    </span>
  );

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[200px] rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
      style={{
        left: menu.position.x,
        top: menu.position.y,
      }}
    >
      {menu.type === "selection" ? (
        <>
          {/* Clipboard actions */}
          <button className={menuItemClass} type="button" onClick={handleCopy}>
            <ClipboardCopy className="h-4 w-4" />
            Copy
            {renderKbd(`${modKeyLabel}+C`)}
          </button>
          <button className={menuItemClass} type="button" onClick={handlePaste}>
            <Clipboard className="h-4 w-4" />
            Paste
            {renderKbd(`${modKeyLabel}+V`)}
          </button>
          <button className={menuItemClass} type="button" onClick={handleCut}>
            <Scissors className="h-4 w-4" />
            Cut
            {renderKbd(`${modKeyLabel}+X`)}
          </button>

          <div className="my-1 h-px bg-slate-200" />

          {/* Group submenu */}
          {selectedCount >= 2 && (
            <div
              className="relative"
              onMouseEnter={() => setOpenSubMenu("group")}
              onMouseLeave={() => setOpenSubMenu(null)}
            >
              <button className={menuItemWithSubmenuClass} type="button">
                <span className="flex items-center gap-2">
                  <Group className="h-4 w-4" />
                  Group
                </span>
                <ChevronRight className="h-4 w-4" />
              </button>
              {openSubMenu === "group" && (
                <div className={subMenuClass}>
                  <button
                    className={canGroup ? menuItemClass : disabledItemClass}
                    type="button"
                    onClick={canGroup ? handleGroup : undefined}
                    disabled={!canGroup}
                  >
                    <Group className="h-4 w-4" />
                    Group
                    {renderKbd(`${modKeyLabel}+G`)}
                  </button>
                  <button
                    className={canUngroup ? menuItemClass : disabledItemClass}
                    type="button"
                    onClick={canUngroup ? handleUngroup : undefined}
                    disabled={!canUngroup}
                  >
                    <Ungroup className="h-4 w-4" />
                    Ungroup
                    {renderKbd(`${modKeyLabel}+⇧+G`)}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Align submenu */}
          {selectedCount >= 2 && (
            <div
              className="relative"
              onMouseEnter={() => setOpenSubMenu("align")}
              onMouseLeave={() => setOpenSubMenu(null)}
            >
              <button className={menuItemWithSubmenuClass} type="button">
                <span className="flex items-center gap-2">
                  <AlignCenterHorizontal className="h-4 w-4" />
                  Align
                </span>
                <ChevronRight className="h-4 w-4" />
              </button>
              {openSubMenu === "align" && (
                <div className={subMenuClass}>
                  <button className={menuItemClass} type="button" onClick={handleAlignLeft}>
                    <AlignStartHorizontal className="h-4 w-4" />
                    Left
                  </button>
                  <button className={menuItemClass} type="button" onClick={handleAlignCenter}>
                    <AlignCenterHorizontal className="h-4 w-4" />
                    Center
                  </button>
                  <button className={menuItemClass} type="button" onClick={handleAlignRight}>
                    <AlignEndHorizontal className="h-4 w-4" />
                    Right
                  </button>
                  <div className="my-1 h-px bg-slate-200" />
                  <button className={menuItemClass} type="button" onClick={handleAlignTop}>
                    <AlignStartVertical className="h-4 w-4" />
                    Top
                  </button>
                  <button className={menuItemClass} type="button" onClick={handleAlignMiddle}>
                    <AlignCenterVertical className="h-4 w-4" />
                    Middle
                  </button>
                  <button className={menuItemClass} type="button" onClick={handleAlignBottom}>
                    <AlignEndVertical className="h-4 w-4" />
                    Bottom
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Distribute submenu */}
          {selectedCount >= 2 && (
            <div
              className="relative"
              onMouseEnter={() => setOpenSubMenu("distribute")}
              onMouseLeave={() => setOpenSubMenu(null)}
            >
              <button className={menuItemWithSubmenuClass} type="button">
                <span className="flex items-center gap-2">
                  <AlignHorizontalSpaceAround className="h-4 w-4" />
                  Distribute
                </span>
                <ChevronRight className="h-4 w-4" />
              </button>
              {openSubMenu === "distribute" && (
                <div className={subMenuClass}>
                  <button className={menuItemClass} type="button" onClick={handleDistributeHorizontally}>
                    <AlignHorizontalSpaceAround className="h-4 w-4" />
                    Horizontally
                  </button>
                  <button className={menuItemClass} type="button" onClick={handleDistributeVertically}>
                    <AlignVerticalSpaceAround className="h-4 w-4" />
                    Vertically
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="my-1 h-px bg-slate-200" />
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
          {/* Clipboard actions */}
          <button className={menuItemClass} type="button" onClick={handleCopy}>
            <ClipboardCopy className="h-4 w-4" />
            Copy
            {renderKbd(`${modKeyLabel}+C`)}
          </button>
          <button className={menuItemClass} type="button" onClick={handlePaste}>
            <Clipboard className="h-4 w-4" />
            Paste
            {renderKbd(`${modKeyLabel}+V`)}
          </button>
          <button className={menuItemClass} type="button" onClick={handleCut}>
            <Scissors className="h-4 w-4" />
            Cut
            {renderKbd(`${modKeyLabel}+X`)}
          </button>

          <div className="my-1 h-px bg-slate-200" />

          {/* Edit option - only for non-shape nodes */}
          {clickedNodeKind !== "shape" && (
            <button className={menuItemClass} type="button" onClick={handleEdit}>
              <Pencil className="h-4 w-4" />
              Edit
            </button>
          )}
          <button
            className={menuItemClass}
            type="button"
            onClick={handleDuplicate}
          >
            <Copy className="h-4 w-4" />
            Duplicate
          </button>
          {/* Focus option - only for regular nodes */}
          {!isTextOrShapeNode && (
            <button className={menuItemClass} type="button" onClick={handleFocus}>
              <Focus className="h-4 w-4" />
              Focus
            </button>
          )}
          {/* Send to front/back - for text and shape nodes */}
          {isTextOrShapeNode && (
            <>
              <div className="my-1 h-px bg-slate-200" />
              <button className={menuItemClass} type="button" onClick={handleSendToFront}>
                <ArrowUpToLine className="h-4 w-4" />
                Send to Front
              </button>
              <button className={menuItemClass} type="button" onClick={handleSendToBack}>
                <ArrowDownToLine className="h-4 w-4" />
                Send to Back
              </button>
            </>
          )}
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
        <>
          <button
            className={menuItemClass}
            type="button"
            onClick={handlePaste}
          >
            <Clipboard className="h-4 w-4" />
            Paste
            {renderKbd(`${modKeyLabel}+V`)}
          </button>
          <div className="my-1 h-px bg-slate-200" />
          <button
            className={menuItemClass}
            type="button"
            onClick={handleAddNode}
          >
            <Plus className="h-4 w-4" />
            Add Node
          </button>
          <button
            className={menuItemClass}
            type="button"
            onClick={handleAddTextNode}
          >
            <Type className="h-4 w-4" />
            Add Text
          </button>
          <button
            className={menuItemClass}
            type="button"
            onClick={handleAddShapeNode}
          >
            <Square className="h-4 w-4" />
            Add Shape
          </button>
        </>
      )}
    </div>
  );
}

export type { ContextMenuState };
