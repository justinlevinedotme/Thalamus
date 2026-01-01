import { useEffect } from "react";

type UseCanvasKeyboardOptions = {
  editingNodeId?: string;
  onDelete: () => void;
  onUndo: () => void;
  onRedo: () => void;
};

export function useCanvasKeyboard({
  editingNodeId,
  onDelete,
  onUndo,
  onRedo,
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
      if (event.key.toLowerCase() !== "z") return;

      event.preventDefault();
      if (event.shiftKey) {
        onRedo();
      } else {
        onUndo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editingNodeId, onDelete, onUndo, onRedo]);
}
