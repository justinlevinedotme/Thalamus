import { useEffect } from "react";

type UseCanvasKeyboardOptions = {
  editingNodeId?: string;
  onDelete: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onCopyStyle: () => void;
  onPasteStyle: () => void;
};

export function useCanvasKeyboard({
  editingNodeId,
  onDelete,
  onUndo,
  onRedo,
  onCopyStyle,
  onPasteStyle,
}: UseCanvasKeyboardOptions): void {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (editingNodeId) return;

      if (target) {
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable) {
          return;
        }
      }

      if (event.key === "Backspace" || event.key === "Delete") {
        event.preventDefault();
        onDelete();
        return;
      }

      if (!event.metaKey && !event.ctrlKey) return;

      const key = event.key.toLowerCase();

      if (key === "z") {
        event.preventDefault();
        if (event.shiftKey) {
          onRedo();
        } else {
          onUndo();
        }
        return;
      }

      if (event.shiftKey && key === "c") {
        event.preventDefault();
        onCopyStyle();
        return;
      }

      if (event.shiftKey && key === "v") {
        event.preventDefault();
        onPasteStyle();
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editingNodeId, onDelete, onUndo, onRedo, onCopyStyle, onPasteStyle]);
}
